import { parse } from 'csv-parse/sync';
import { DecodeUTF8, Unzip, UnzipInflate, strFromU8, unzipSync } from 'fflate';

export const UTRERA = '51200';
const SOURCES = {
  cercanias: {
    schedule: 'https://ssl.renfe.com/ftransit/Fichero_CER_FOMENTO/fomento_transit.zip',
    realtime: 'https://gtfsrt.renfe.com/trip_updates.json',
  },
  largaDistancia: {
    schedule: 'https://ssl.renfe.com/gtransit/Fichero_AV_LD/google_transit.zip',
    realtime: 'https://gtfsrt.renfe.com/trip_updates_LD.json',
  },
};
const ALERTS = 'https://gtfsrt.renfe.com/alerts.json';
const FILES = new Set(['stops.txt', 'routes.txt', 'trips.txt', 'calendar.txt', 'calendar_dates.txt']);
const DAY = 86400;
const madrid = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});

function madridParts(seconds) {
  return Object.fromEntries(madrid.formatToParts(seconds * 1000)
    .filter(part => part.type !== 'literal')
    .map(part => [part.type, Number(part.value)]));
}

function serviceDay(date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const noon = Date.UTC(year, month, day, 12) / 1000;
  const localNoon = madridParts(noon);
  // GTFS measures service time from local noon minus twelve hours, including DST changes.
  return {
    id: date.toISOString().slice(0, 10).replaceAll('-', ''),
    start: noon - (localNoon.hour - 12) * 3600 - DAY / 2,
    weekday: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getUTCDay()],
  };
}

function scheduledTime(day, time) {
  if (!/^\d{1,3}:[0-5]\d:[0-5]\d$/.test(time || '')) return null;
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return day.start + hours * 3600 + minutes * 60 + seconds;
}

// The national stop_times file expands to hundreds of MB. Decompress it in
// chunks and parse only the physical rows with Utrera or a matching trip ID.
function readStopTimes(bytes, include) {
  let remainder = '';
  let header;
  const selected = [];
  const archive = new Unzip(file => {
    if (file.name !== 'stop_times.txt') return;
    const decoder = new DecodeUTF8((text, final) => {
      const lines = (remainder + text).split('\n');
      remainder = lines.pop();
      if (final && remainder) lines.push(remainder);
      for (const line of lines) {
        if (header === undefined) header = line;
        else if (include(line)) selected.push(line);
      }
    });
    file.ondata = (error, data, final) => {
      if (error) throw error;
      decoder.push(data, final);
    };
    file.start();
  });
  archive.register(UnzipInflate);
  for (let offset = 0; offset < bytes.length; offset += 32768) {
    const end = Math.min(offset + 32768, bytes.length);
    archive.push(bytes.subarray(offset, end), end === bytes.length);
  }

  if (!header) throw new Error('GTFS sin stop_times.txt');
  return parse([header, ...selected].join('\n'), {
    bom: true, columns: true, trim: true, skip_empty_lines: true,
  });
}

export function readSchedule(bytes) {
  const archive = unzipSync(bytes, { filter: ({ name }) => FILES.has(name) });
  function rows(name, on_record) {
    const file = archive[name + '.txt'];
    if (!file) return [];
    return parse(strFromU8(file), {
      bom: true, columns: true, trim: true, skip_empty_lines: true, on_record,
    });
  }

  const stops = new Map(rows('stops').map(stop => [stop.stop_id, stop]));
  const stationStops = new Set([...stops.values()]
    .filter(stop => stop.stop_id === UTRERA || stop.parent_station === UTRERA)
    .map(stop => stop.stop_id));
  if (!stationStops.size) throw new Error('Utrera no figura en el GTFS');

  const stationStopFields = [...stationStops].map(id => ',' + id + ',');
  const stationTimes = readStopTimes(bytes, line => stationStopFields.some(field => line.includes(field))
    || [...stationStops].some(id => line.includes('"' + id + '"')))
    .filter(row => stationStops.has(row.stop_id));
  const stationTripIds = new Set(stationTimes.map(row => row.trip_id));
  const routes = new Map(rows('routes').map(route => [route.route_id, route]));
  const trips = new Map(rows('trips', trip => stationTripIds.has(trip.trip_id) ? trip : null)
    .map(trip => [trip.trip_id, { ...trip, stops: [], route: routes.get(trip.route_id) }]));

  const tripTimes = readStopTimes(bytes, line => trips.has(line.slice(0, line.indexOf(',')).trim().replace(/^"|"$/g, '')));
  for (const row of tripTimes) trips.get(row.trip_id).stops.push(row);
  for (const trip of trips.values()) trip.stops.sort((a, b) => a.stop_sequence - b.stop_sequence);

  const serviceIds = new Set([...trips.values()].map(trip => trip.service_id));
  const calendars = new Map(rows('calendar', row => serviceIds.has(row.service_id) ? row : null)
    .map(row => [row.service_id, row]));
  const exceptions = new Map(rows('calendar_dates', row => serviceIds.has(row.service_id) ? row : null)
    .map(row => [row.service_id + ':' + row.date, row.exception_type]));
  const dates = [...calendars.values()].flatMap(row => [row.start_date, row.end_date])
    .concat([...exceptions.keys()].map(key => key.slice(-8))).sort();
  if (!trips.size || !dates.length) throw new Error('GTFS sin calendario para Utrera');

  return { stops, stationStops, trips, calendars, exceptions, firstDate: dates[0], lastDate: dates.at(-1) };
}

function runsOn(schedule, trip, day) {
  const exception = schedule.exceptions.get(trip.service_id + ':' + day.id);
  if (exception) return exception === '1';
  const calendar = schedule.calendars.get(trip.service_id);
  return calendar && day.id >= calendar.start_date && day.id <= calendar.end_date
    && calendar[day.weekday] === '1';
}

function matchingUpdates(feed) {
  const updates = new Map();
  for (const { tripUpdate, isDeleted } of feed?.entity ?? []) {
    if (isDeleted || !tripUpdate?.trip?.tripId) continue;
    const id = tripUpdate.trip.tripId;
    if (!updates.has(id)) updates.set(id, []);
    updates.get(id).push(tripUpdate);
  }
  return updates;
}

function prediction(updates, trip, station, type, scheduled, day, feedTime) {
  const active = (updates.get(trip.trip_id) ?? [])
    .filter(({ trip }) => trip.startDate ? trip.startDate === day.id : true);
  const undatedIsCurrent = Math.abs(scheduled - feedTime) <= 6 * 3600;
  const match = active.filter(({ trip }) => trip.startDate || undatedIsCurrent);
  if (match.some(({ trip }) => ['CANCELED', 'DELETED'].includes(trip.scheduleRelationship))) {
    return { status: 'cancelado' };
  }

  const sequence = Number(station.stop_sequence);
  const stopUpdates = match.flatMap(update => update.stopTimeUpdate ?? []);
  const stop = stopUpdates.find(update => update.stopSequence != null
    ? Number(update.stopSequence) === sequence : update.stopId === station.stop_id);
  if (stop?.scheduleRelationship === 'SKIPPED') return { status: 'sin-parada' };
  // Renfe suele publicar una sola parada por tren. Una previsión en otra
  // estación no confirma la hora de llegada o salida de Utrera.
  const event = stop?.scheduleRelationship !== 'NO_DATA' ? stop?.[type] : null;
  if (!event || (event.time == null && !Number.isFinite(event.delay))) return { status: 'programado' };

  const expected = event.time == null ? scheduled + event.delay : Number(event.time);
  if (!Number.isFinite(expected) || Math.abs(expected - scheduled) > 6 * 3600) {
    return { status: 'programado' };
  }
  const delay = expected - scheduled;
  return { status: delay >= 60 ? 'retraso' : 'previsto', expected, delay };
}

export function makeBoard(sources, alerts, now = Math.floor(Date.now() / 1000)) {
  const { year, month, day } = madridParts(now);
  const days = [-1, 0, 1].map(offset => serviceDay(new Date(Date.UTC(year, month - 1, day + offset))));
  const events = { arrival: [], departure: [] };
  const coverage = {};
  const coveredRoutes = new Set();
  const coveredTrips = new Set();
  const stationStops = new Set([UTRERA]);

  for (const [service, { schedule, realtime }] of Object.entries(sources)) {
    const live = currentFeed(realtime, now);
    const available = !!schedule && days[1].id >= schedule.firstDate && days[1].id <= schedule.lastDate;
    coverage[service] = { schedule: available, realtimeAt: live ? Number(live.header.timestamp) : null };
    if (!schedule) continue;
    if (service === 'cercanias') {
      for (const id of schedule.stationStops) stationStops.add(id);
      for (const trip of schedule.trips.values()) {
        coveredRoutes.add(trip.route_id);
        coveredTrips.add(trip.trip_id);
      }
    }
    if (!available) continue;

    const updates = matchingUpdates(live);
    for (const trip of schedule.trips.values()) {
      const stops = trip.stops;
      if (stops.length < 2) continue;
      const origin = schedule.stops.get(stops[0].stop_id)?.stop_name;
      const destination = schedule.stops.get(stops.at(-1).stop_id)?.stop_name;
      for (const [index, stop] of stops.entries()) {
        if (!schedule.stationStops.has(stop.stop_id)) continue;
        for (const date of days) {
          if (!runsOn(schedule, trip, date)) continue;
          for (const type of ['arrival', 'departure']) {
            if (type === 'arrival' && (index === 0 || stop.drop_off_type === '1')) continue;
            if (type === 'departure' && (index === stops.length - 1 || stop.pickup_type === '1')) continue;
            const scheduled = scheduledTime(date, stop[type + '_time']);
            if (scheduled === null || scheduled > now + 6 * 3600 || scheduled < now - 6 * 3600) continue;
            const state = prediction(updates, trip, stop, type, scheduled, date, Number(live?.header.timestamp));
            const order = state.expected ?? scheduled;
            if (order < now - 60 || order > now + 6 * 3600) continue;

            events[type].push({
              id: [service, date.id, trip.trip_id, stop.stop_sequence, type].join(':'),
              service, line: trip.route?.route_short_name || (service === 'cercanias' ? 'Cercanías' : 'Renfe'),
              origin, destination, scheduled, trainNumber: trip.trip_short_name || null, ...state,
            });
          }
        }
      }
    }
  }

  for (const type of ['arrival', 'departure']) {
    const distinct = new Map();
    for (const event of events[type]) {
      const key = event.trainNumber
        ? JSON.stringify([event.service, event.trainNumber, event.origin, event.destination, event.scheduled])
        : event.id;
      const previous = distinct.get(key);
      if (!previous || (previous.status === 'programado' && event.status !== 'programado')) {
        distinct.set(key, event);
      }
    }
    events[type] = [...distinct.values()].sort((a, b) => (a.expected ?? a.scheduled) - (b.expected ?? b.scheduled));
  }
  const liveAlerts = currentFeed(alerts, now);
  const notices = (liveAlerts?.entity ?? []).flatMap(({ id, alert, isDeleted }) => {
    if (!alert || isDeleted) return [];
    if (alert.activePeriod?.length && !alert.activePeriod.some(period =>
      Number(period.start ?? 0) <= now && Number(period.end ?? Infinity) > now)) return [];
    const relevant = alert.informedEntity?.some(selector => {
      if (selector.stopId && !stationStops.has(selector.stopId)) return false;
      if (selector.routeId && !coveredRoutes.has(selector.routeId)) return false;
      if (selector.trip?.tripId && !coveredTrips.has(selector.trip.tripId)) return false;
      return Boolean(selector.stopId || selector.routeId || selector.trip?.tripId);
    });
    const title = translation(alert.headerText);
    const description = translation(alert.descriptionText);
    return relevant && (title || description) ? [{ id, title, description }] : [];
  });

  return { events, notices, coverage, generatedAt: now, alertsAt: liveAlerts ? Number(liveAlerts.header.timestamp) : null };
}

function translation(value) {
  const texts = value?.translation ?? [];
  return (texts.find(({ language }) => /^es(?:-|$)/i.test(language)) ?? texts[0])?.text?.trim();
}

function currentFeed(feed, now) {
  const timestamp = Number(feed?.header?.timestamp);
  return timestamp >= now - 180 && timestamp <= now + 60
    && (feed.entity == null || Array.isArray(feed.entity)) ? feed : null;
}

const cache = new Map();
async function cached(url, ttl, timeout, read, fallbackFor) {
  const entry = cache.get(url) ?? {};
  cache.set(url, entry);
  if (entry.expires > Date.now()) return entry.value;
  if (!entry.pending) {
    entry.pending = (async () => {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(timeout) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        entry.value = await read(response);
        entry.updated = Date.now();
        entry.expires = entry.updated + ttl;
        return entry.value;
      } catch (error) {
        console.warn('Renfe', url, error.message);
        const fallback = Date.now() - entry.updated <= fallbackFor;
        entry.expires = Date.now() + 15000;
        if (!fallback) entry.value = null;
        return entry.value ?? null;
      } finally {
        entry.pending = null;
      }
    })();
  }
  return entry.pending;
}

const fetchRealtime = url => cached(url, 15000, 7000, response => response.json(), 90000);
export async function getBoard() {
  const [sources, alerts] = await Promise.all([
    Promise.all(Object.entries(SOURCES).map(async ([service, { schedule, realtime }]) => {
      const [scheduled, live] = await Promise.all([
        cached(schedule, 6 * 3600000, 50000,
          async response => readSchedule(new Uint8Array(await response.arrayBuffer())), 48 * 3600000),
        fetchRealtime(realtime),
      ]);
      return [service, { schedule: scheduled, realtime: live }];
    })),
    fetchRealtime(ALERTS),
  ]);
  return makeBoard(Object.fromEntries(sources), alerts);
}

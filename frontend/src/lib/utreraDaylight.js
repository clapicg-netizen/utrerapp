const minute = 60_000;
const day = 1440 * minute;
const radians = Math.PI / 180;
const latitude = 37.18246 * radians;
const longitude = -5.78175;
const horizon = Math.cos(90.833 * radians);
const madridDate = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Madrid', year: 'numeric', month: 'numeric', day: 'numeric',
});

function crossing(midnight, direction) {
  let utcMinutes = 720 - 4 * longitude - direction * 360;
  for (let pass = 0; pass < 2; pass++) {
    // NOAA, solar position from Julian centuries. UTC instants avoid applying DST twice.
    const t = (midnight / day + utcMinutes / 1440 - 10957.5) / 36525;
    const meanLongitude = ((280.46646 + t * (36000.76983 + t * 0.0003032)) % 360) * radians;
    const anomaly = (357.52911 + t * (35999.05029 - 0.0001537 * t)) * radians;
    const eccentricity = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
    const center = Math.sin(anomaly) * (1.914602 - t * (0.004817 + 0.000014 * t))
      + Math.sin(2 * anomaly) * (0.019993 - 0.000101 * t) + 0.000289 * Math.sin(3 * anomaly);
    const omega = (125.04 - 1934.136 * t) * radians;
    const apparentLongitude = meanLongitude + (center - 0.00569 - 0.00478 * Math.sin(omega)) * radians;
    const obliquity = (23.439291 - t * (0.013004167 + t * (0.000000164 - 0.000000504 * t))
      + 0.00256 * Math.cos(omega)) * radians;
    const declination = Math.asin(Math.sin(obliquity) * Math.sin(apparentLongitude));
    const y = Math.tan(obliquity / 2) ** 2;
    const equation = 4 / radians * (y * Math.sin(2 * meanLongitude) - 2 * eccentricity * Math.sin(anomaly)
      + 4 * eccentricity * y * Math.sin(anomaly) * Math.cos(2 * meanLongitude)
      - 0.5 * y ** 2 * Math.sin(4 * meanLongitude) - 1.25 * eccentricity ** 2 * Math.sin(2 * anomaly));
    const angle = Math.acos((horizon - Math.sin(latitude) * Math.sin(declination))
      / (Math.cos(latitude) * Math.cos(declination))) / radians;
    utcMinutes = 720 - 4 * (longitude + direction * angle) - equation;
  }
  return midnight + Math.round(utcMinutes * minute);
}

export function utreraDaylight(now = new Date()) {
  const parts = Object.fromEntries(madridDate.formatToParts(now).map(({ type, value }) => [type, value]));
  const midnight = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day));
  const sunrise = crossing(midnight, 1);
  const sunset = crossing(midnight, -1);
  return { sunrise, sunset, daylight: now >= sunrise && now < sunset };
}

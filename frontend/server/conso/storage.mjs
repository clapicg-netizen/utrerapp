const reserveScript = `
local user = tonumber(redis.call('GET', KEYS[1]) or 0)
local global = tonumber(redis.call('HGET', KEYS[2], 'queries') or 0)
local burst = tonumber(redis.call('GET', KEYS[3]) or 0)
if user >= tonumber(ARGV[1]) or global >= tonumber(ARGV[2]) or burst >= 5 then return 0 end
redis.call('INCR', KEYS[1])
redis.call('EXPIRE', KEYS[1], 172800)
redis.call('HINCRBY', KEYS[2], 'queries', 1)
redis.call('EXPIRE', KEYS[2], 34560000)
redis.call('INCR', KEYS[3])
redis.call('EXPIRE', KEYS[3], 90)
return 1
`;

function credentials(env, readOnly) {
  const sources = [
    [env.KV_REST_API_URL, readOnly ? env.KV_REST_API_READ_ONLY_TOKEN : env.KV_REST_API_TOKEN],
    [env.CONSO_REDIS_REST_URL, readOnly ? env.CONSO_REDIS_REST_READ_ONLY_TOKEN : env.CONSO_REDIS_REST_TOKEN],
    [env.UPSTASH_REDIS_REST_URL, readOnly ? env.UPSTASH_REDIS_REST_READ_ONLY_TOKEN : env.UPSTASH_REDIS_REST_TOKEN],
  ];
  const [url, token] = sources.find(([url]) => url) || [];
  if (!url || !token || new URL(url).protocol !== 'https:') throw new Error('Conso storage unavailable');
  return { url, token };
}

export function redisStore(prefix, env, { readOnly = false } = {}) {
  const { url, token } = credentials(env, readOnly);
  const rateSecret = readOnly ? undefined : env.CONSO_RATE_SECRET || token;
  async function command(args, pipeline = false) {
    const response = await fetch(url.replace(/\/$/, '') + (pipeline ? '/pipeline' : ''), {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) throw new Error('Conso storage unavailable');
    const data = await response.json();
    if (pipeline ? data.some(item => item.error) : data.error) throw new Error('Conso storage unavailable');
    return pipeline ? data.map(item => item.result) : data.result;
  }

  return {
    rateSecret,
    reserve: async (day, user, minute, limits) => {
      const result = await command([
        'EVAL', reserveScript, 3, prefix + ':user:' + day + ':' + user,
        prefix + ':day:' + day, prefix + ':burst:' + minute + ':' + user,
        limits.userLimit, limits.globalLimit,
      ]);
      if (result !== 0 && result !== 1) throw new Error('Invalid quota response');
      return result === 1;
    },
    record: async (day, metrics) => {
      const key = prefix + ':day:' + day;
      await command(Object.entries(metrics).map(([field, value]) => ['HINCRBY', key, field, value]), true);
    },
    metrics: async days => {
      const rows = await command(days.map(day => ['HGETALL', prefix + ':day:' + day]), true);
      return rows.map(fields => Object.fromEntries((fields || []).flatMap((key, index) =>
        index % 2 ? [] : [[key, Number(fields[index + 1])]])));
    },
  };
}

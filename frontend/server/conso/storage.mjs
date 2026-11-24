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

const reserveSpendScript = `
local amount = tonumber(ARGV[1])
local used = tonumber(redis.call('GET', KEYS[1]) or 0)
if used + amount > tonumber(ARGV[2]) then return 0 end
local now = tonumber(ARGV[3])
redis.call('ZREMRANGEBYSCORE', KEYS[2], '-inf', now - 60000)
if redis.call('ZCARD', KEYS[2]) >= 10 then return 2 end
if redis.call('EXISTS', KEYS[3]) == 1 then return 3 end
redis.call('INCRBY', KEYS[1], amount)
redis.call('EXPIRE', KEYS[1], 34560000)
redis.call('ZADD', KEYS[2], now, ARGV[4])
redis.call('EXPIRE', KEYS[2], 120)
redis.call('SET', KEYS[3], amount, 'EX', 600)
return 1
`;

const settleSpendScript = `
local held = tonumber(redis.call('GET', KEYS[2]))
local actual = tonumber(ARGV[1])
if not held or actual > held or actual < 0 then return 0 end
if tonumber(redis.call('GET', KEYS[1]) or 0) < held then return 0 end
redis.call('DECRBY', KEYS[1], held - actual)
redis.call('DEL', KEYS[2])
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
    reserveSpend: async (month, id, now, amount, budget) => {
      const result = await command([
        'EVAL', reserveSpendScript, 3, prefix + ':spend:' + month,
        prefix + ':calls:rolling', prefix + ':hold:' + month + ':' + id,
        amount, budget, now, id,
      ]);
      if (result === 0) return 'budget';
      if (result === 2) return 'rate';
      if (result !== 1) throw new Error('Invalid spending reservation');
      return 'reserved';
    },
    settleSpend: (month, id, actual) => command([
      'EVAL', settleSpendScript, 2, prefix + ':spend:' + month, prefix + ':hold:' + month + ':' + id, actual,
    ]),
    monthlyReserved: async month => Number(await command(['GET', prefix + ':spend:' + month]) || 0),
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

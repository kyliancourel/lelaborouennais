const ipMap = new Map<string, { count: number; time: number }>();

export function rateLimit(ip: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();

  const record = ipMap.get(ip);

  if (!record || now - record.time > windowMs) {
    ipMap.set(ip, { count: 1, time: now });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}
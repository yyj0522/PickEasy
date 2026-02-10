const ipRequestMap = new Map<string, { count: number; lastTime: number }>();
const WINDOW_SIZE = 60 * 1000; 
const MAX_REQUESTS = 5; 

export function checkRateLimit(ip: string) {
  const now = Date.now();
  const record = ipRequestMap.get(ip);

  if (!record) {
    ipRequestMap.set(ip, { count: 1, lastTime: now });
    return true;
  }

  if (now - record.lastTime > WINDOW_SIZE) {
    ipRequestMap.set(ip, { count: 1, lastTime: now });
    return true;
  }

  if (record.count >= MAX_REQUESTS) {
    return false;
  }

  record.count += 1;
  return true;
}
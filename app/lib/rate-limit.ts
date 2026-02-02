import { NextResponse } from "next/server";

const ipRequestMap = new Map<string, { count: number; lastTime: number }>();

// 설정: 60초(WINDOW_SIZE) 동안 최대 5회(MAX_REQUESTS) 요청 가능
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
    // 시간이 지났으면 리셋
    ipRequestMap.set(ip, { count: 1, lastTime: now });
    return true;
  }

  if (record.count >= MAX_REQUESTS) {
    // 제한 초과
    return false;
  }

  record.count += 1;
  return true;
}
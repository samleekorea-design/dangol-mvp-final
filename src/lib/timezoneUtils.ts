/**
 * Korean timezone utilities for handling KST (Korea Standard Time)
 */

export const KOREA_TIMEZONE = 'Asia/Seoul';

/**
 * Gets the current time in Korean timezone
 */
export function getKoreanTime(): Date {
  // Use proper timezone conversion instead of manual offset
  const now = new Date();
  const koreanTimeString = now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' });
  return new Date(koreanTimeString);
}

/**
 * Checks if the current time in Korea is within business hours (9am-10pm)
 * @returns {boolean} true if current Korean time is between 9am-10pm
 */
export function isKoreanBusinessHours(): boolean {
  const koreanTime = getKoreanTime();
  const hour = koreanTime.getHours();
  
  // Business hours: 9am (9) to 10pm (22)
  return hour >= 9 && hour < 22;
}

/**
 * Gets the current hour in Korean timezone
 */
export function getKoreanHour(): number {
  return getKoreanTime().getHours();
}

/**
 * Formats a date to Korean timezone string
 */
export function formatKoreanTime(date: Date = new Date()): string {
  return date.toLocaleString('ko-KR', {
    timeZone: KOREA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Checks if a specific time is within Korean business hours
 */
export function isTimeInKoreanBusinessHours(date: Date): boolean {
  const koreanTime = new Date(date.toLocaleString("en-US", { timeZone: KOREA_TIMEZONE }));
  const hour = koreanTime.getHours();
  return hour >= 9 && hour < 22;
}

/**
 * Gets the next business hour in Korean timezone
 * Returns the next 9am if currently outside business hours
 */
export function getNextKoreanBusinessHour(): Date {
  const now = getKoreanTime();
  const hour = now.getHours();
  
  if (hour >= 9 && hour < 22) {
    // Already in business hours
    return now;
  }
  
  // Calculate next 9am
  const nextBusinessDay = new Date(now);
  
  if (hour >= 22) {
    // After 8pm, next business hour is tomorrow 9am
    nextBusinessDay.setDate(nextBusinessDay.getDate() + 1);
  }
  
  nextBusinessDay.setHours(9, 0, 0, 0);
  
  // Convert back from Korean time to UTC
  const utcTime = new Date(nextBusinessDay.toLocaleString("en-US", { timeZone: "UTC" }));
  const koreanOffset = nextBusinessDay.getTimezoneOffset() * 60000;
  const koreaOffset = 9 * 60 * 60 * 1000; // KST is UTC+9
  
  return new Date(utcTime.getTime() - koreanOffset + koreaOffset);
}

/**
 * Check if a deal is expired with proper Korean timezone handling
 * All deals are stored as UTC, but expiration is checked against Korean time
 */
export function isDealExpired(dealId: number, expiresAt: string): boolean {
  const koreanNow = getKoreanTime();
  
  // All deals are stored as UTC strings, parse as UTC and compare with Korean time
  const expiryDate = new Date(expiresAt + ' UTC');
  return expiryDate < koreanNow;
}

/**
 * Test function to validate timezone utilities
 */
export function testTimezoneUtils() {
  console.log("Timezone utilities test:");
  console.log(`Current Korean time: ${formatKoreanTime()}`);
  console.log(`Current Korean hour: ${getKoreanHour()}`);
  console.log(`Is Korean business hours: ${isKoreanBusinessHours()}`);
  console.log(`Next business hour: ${formatKoreanTime(getNextKoreanBusinessHour())}`);
}
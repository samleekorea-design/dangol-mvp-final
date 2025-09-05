/**
 * Korean timezone utilities for handling KST (Korea Standard Time)
 */

export const KOREA_TIMEZONE = 'Asia/Seoul';

/**
 * Gets the current time in Korean timezone
 */
export function getKoreanTime(): Date {
  // Get current time in Korean timezone properly
  const now = new Date();
  // Convert to Korean time by getting the time string in ISO format for Seoul timezone
  const koreanTimeString = new Intl.DateTimeFormat('sv-SE', { 
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(now);
  // Parse the Korean time as if it were UTC to get a Date object representing Korean time
  return new Date(koreanTimeString + 'Z');
}

/**
 * Checks if the current time in Korea is within business hours (9am-8pm)
 * @returns {boolean} true if current Korean time is between 9am-8pm
 */
export function isKoreanBusinessHours(): boolean {
  const koreaHour = (new Date().getUTCHours() + 9) % 24;
  return koreaHour >= 9 && koreaHour < 20;
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
export function formatKoreanTime(date: Date | string = new Date()): string {
  // Handle both Date objects and timestamp strings
  let dateObj: Date;
  
  if (typeof date === 'string') {
    // Handle timestamp strings like '2025-09-05 07:50:25.04+00'
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  // Validate that we have a valid Date object
  if (isNaN(dateObj.getTime())) {
    throw new Error(`Invalid date provided: ${date}`);
  }
  
  return dateObj.toLocaleString('ko-KR', {
    timeZone: KOREA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
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
 * Check if a deal is expired using UTC timestamps
 */
export function isDealExpired(dealId: number, expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
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
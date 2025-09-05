// Test the fixed timezone functions
const KOREA_TIMEZONE = 'Asia/Seoul';

function getKoreanTime() {
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

function isDealExpired(dealId, expiresAt) {
  const koreanNow = getKoreanTime();
  
  // Parse the UTC expiry date correctly
  const expiryDate = new Date(expiresAt);
  
  // Convert expiry date to Korean timezone for comparison
  const expiryKoreanTime = new Date(expiryDate.toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }) + 'Z');
  
  console.log('isDealExpired:', dealId, expiresAt, 'Korean now:', koreanNow.toISOString(), 'Expiry (Korean):', expiryKoreanTime.toISOString(), 'Result:', expiryKoreanTime < koreanNow);
  return expiryKoreanTime < koreanNow;
}

console.log('=== Testing FIXED Timezone Functions ===\n');

console.log('Current UTC time:', new Date().toISOString());
console.log('Current Korean time (manual):', new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }));

const koreanTimeFromFunction = getKoreanTime();
console.log('Korean time from getKoreanTime():', koreanTimeFromFunction.toISOString());
console.log('Korean time formatted:', koreanTimeFromFunction.toLocaleString('ko-KR', { timeZone: 'UTC' }), '(treating as UTC)');
console.log();

// Test with the deal we found in the API
const testDeal = {
  id: 4,
  expires_at: "2025-09-05T05:00:07.081Z"
};

console.log('=== Testing Deal Expiry ===');
const isExpired = isDealExpired(testDeal.id, testDeal.expires_at);
console.log('\nFinal result: Deal is', isExpired ? 'EXPIRED' : 'ACTIVE');

// Additional test with a clearly expired deal (yesterday)
console.log('\n=== Testing with Clearly Expired Deal ===');
const expiredDeal = {
  id: 999,
  expires_at: "2025-09-04T12:00:00.000Z"
};
const isExpiredTest = isDealExpired(expiredDeal.id, expiredDeal.expires_at);
console.log('Final result: Yesterday deal is', isExpiredTest ? 'EXPIRED' : 'ACTIVE');
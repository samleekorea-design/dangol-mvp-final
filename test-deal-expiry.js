// Test script to check isDealExpired function with timezone debugging
// Import the timezone utilities

// Since we can't directly import ES modules in Node.js without proper setup,
// let's recreate the essential functions here for testing

const KOREA_TIMEZONE = 'Asia/Seoul';

function getKoreanTime() {
  const now = new Date();
  const koreanTimeString = now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' });
  return new Date(koreanTimeString);
}

function isDealExpired(dealId, expiresAt) {
  const koreanNow = getKoreanTime();
  
  // All deals are stored as UTC strings, parse as UTC and compare with Korean time
  const expiryDate = new Date(expiresAt + ' UTC');
  console.log('isDealExpired:', dealId, expiresAt, 'Korean time:', koreanNow, 'Expiry date:', expiryDate, 'Result:', expiryDate < koreanNow);
  return expiryDate < koreanNow;
}

// Test with the deal we found in the API
console.log('=== Testing Deal Expiry with Timezone Debugging ===\n');

const testDeal = {
  id: 4,
  expires_at: "2025-09-05T05:00:07.081Z"
};

console.log('Current UTC time:', new Date().toISOString());
console.log('Current Korean time (manual):', new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }));
console.log();

// Test the isDealExpired function
const isExpired = isDealExpired(testDeal.id, testDeal.expires_at);
console.log('\nFinal result: Deal is', isExpired ? 'EXPIRED' : 'ACTIVE');
// Simple script to check merchant locations in the database
const Database = require('better-sqlite3');

async function checkMerchantLocations() {
  try {
    console.log('📍 Checking merchant locations in database...\n');
    
    // Connect to database
    const db = new Database('dangol-v2.db');
    
    // Query for all merchants with their locations
    console.log('🏪 MERCHANT LOCATIONS:');
    console.log('='.repeat(80));
    const merchants = db.prepare('SELECT id, business_name, latitude, longitude FROM merchants').all();
    
    if (merchants.length === 0) {
      console.log('❌ No merchants found in database');
    } else {
      console.log(`✅ Found ${merchants.length} merchant(s):\n`);
      
      merchants.forEach((merchant, index) => {
        console.log(`${index + 1}. ${merchant.business_name} (ID: ${merchant.id})`);
        console.log(`   📍 Location: ${merchant.latitude}, ${merchant.longitude}`);
        
        // Calculate distance from test coordinates (37.481284, 127.056054)
        const testLat = 37.481284;
        const testLng = 127.056054;
        
        // Simple distance calculation using Haversine formula
        const distance = calculateDistance(testLat, testLng, merchant.latitude, merchant.longitude);
        console.log(`   📏 Distance from test coords (${testLat}, ${testLng}): ${distance.toFixed(2)} meters`);
        console.log(`   🎯 Within 1000m radius? ${distance <= 1000 ? '✅ YES' : '❌ NO'}`);
        console.log('');
      });
    }
    
    // Close database
    db.close();
    console.log('='.repeat(80));
    console.log('✅ Merchant location check complete');
    
  } catch (error) {
    console.error('❌ Merchant location check failed:', error.message);
  }
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in meters
}

checkMerchantLocations();
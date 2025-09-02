// Script to update merchant location coordinates in the database
const Database = require('better-sqlite3');

async function updateMerchantLocation() {
  try {
    console.log('🔧 Updating merchant location coordinates...\n');
    
    // Connect to database
    const db = new Database('dangol-v2.db');
    
    // New coordinates to set
    const newLat = 37.52058306850513;
    const newLng = 127.03447936485097;
    const merchantId = 1;
    
    console.log('📍 TARGET MERCHANT:');
    console.log('='.repeat(60));
    console.log(`   Merchant ID: ${merchantId}`);
    console.log(`   New Latitude: ${newLat}`);
    console.log(`   New Longitude: ${newLng}`);
    
    // Check current merchant info before update
    console.log('\n🔍 BEFORE UPDATE:');
    const beforeMerchant = db.prepare('SELECT id, business_name, latitude, longitude FROM merchants WHERE id = ?').get(merchantId);
    
    if (!beforeMerchant) {
      console.log(`❌ Merchant with ID ${merchantId} not found`);
      db.close();
      return;
    }
    
    console.log(`   Business: ${beforeMerchant.business_name}`);
    console.log(`   Current Location: ${beforeMerchant.latitude}, ${beforeMerchant.longitude}`);
    
    // Update the merchant coordinates
    console.log('\n🔄 UPDATING...');
    const result = db.prepare('UPDATE merchants SET latitude = ?, longitude = ? WHERE id = ?').run(newLat, newLng, merchantId);
    
    if (result.changes > 0) {
      console.log('✅ Update successful!');
      
      // Verify the update
      console.log('\n📋 AFTER UPDATE:');
      const afterMerchant = db.prepare('SELECT id, business_name, latitude, longitude FROM merchants WHERE id = ?').get(merchantId);
      console.log(`   Business: ${afterMerchant.business_name}`);
      console.log(`   Updated Location: ${afterMerchant.latitude}, ${afterMerchant.longitude}`);
      
      // Calculate distance from other merchants
      console.log('\n📏 DISTANCE FROM OTHER MERCHANTS:');
      const allMerchants = db.prepare('SELECT id, business_name, latitude, longitude FROM merchants WHERE id != ?').all(merchantId);
      
      allMerchants.forEach((merchant) => {
        const distance = calculateDistance(newLat, newLng, merchant.latitude, merchant.longitude);
        console.log(`   ${merchant.business_name} (ID: ${merchant.id}): ${distance.toFixed(2)} meters`);
      });
      
    } else {
      console.log('❌ Update failed - no rows affected');
    }
    
    // Close database
    db.close();
    console.log('\n' + '='.repeat(60));
    console.log('✅ Merchant location update complete');
    
  } catch (error) {
    console.error('❌ Update failed:', error.message);
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

updateMerchantLocation();
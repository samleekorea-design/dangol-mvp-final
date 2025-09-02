// Script to move Nearme merchant to new location coordinates
const Database = require('better-sqlite3');

async function moveNearmeMerchant() {
  try {
    console.log('🚚 Moving Nearme merchant to new location...\n');
    
    // Connect to database
    const db = new Database('dangol-v2.db');
    
    // New coordinates to set
    const newLat = 37.52058306850513;
    const newLng = 127.03447936485097;
    const merchantId = 5; // Nearme merchant ID
    
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
    
    // Check active deals for this merchant
    const activeDeals = db.prepare(`
      SELECT id, title, current_claims, max_claims, expires_at 
      FROM deals 
      WHERE merchant_id = ? AND expires_at > datetime('now', '+9 hours') AND current_claims < max_claims
    `).all(merchantId);
    
    console.log(`   Active Deals: ${activeDeals.length}`);
    if (activeDeals.length > 0) {
      activeDeals.forEach((deal, index) => {
        console.log(`     ${index + 1}. "${deal.title}" (${deal.current_claims}/${deal.max_claims} claims)`);
      });
    }
    
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
      
      // Show the merchant's deals are now at new location
      if (activeDeals.length > 0) {
        console.log(`   📍 ${activeDeals.length} active deal(s) now available at new location:`);
        activeDeals.forEach((deal, index) => {
          console.log(`     ${index + 1}. "${deal.title}"`);
        });
      }
      
      // Calculate distance from other merchants at Seoul location
      console.log('\n📏 DISTANCE FROM OTHER MERCHANTS (Seoul):');
      const seoulMerchants = db.prepare('SELECT id, business_name, latitude, longitude FROM merchants WHERE id != ? AND latitude = 37.5665 AND longitude = 126.978').all(merchantId);
      
      if (seoulMerchants.length > 0) {
        seoulMerchants.forEach((merchant) => {
          const distance = calculateDistance(newLat, newLng, merchant.latitude, merchant.longitude);
          console.log(`   ${merchant.business_name} (ID: ${merchant.id}): ${distance.toFixed(2)} meters`);
        });
      }
      
      // Show merchants at same location as moved merchant
      console.log('\n👥 MERCHANTS AT SAME LOCATION:');
      const sameLocationMerchants = db.prepare('SELECT id, business_name FROM merchants WHERE latitude = ? AND longitude = ?').all(newLat, newLng);
      sameLocationMerchants.forEach((merchant) => {
        console.log(`   ${merchant.business_name} (ID: ${merchant.id})`);
      });
      
    } else {
      console.log('❌ Update failed - no rows affected');
    }
    
    // Close database
    db.close();
    console.log('\n' + '='.repeat(60));
    console.log('✅ Nearme merchant move complete');
    console.log('🎯 API calls to new coordinates should now find Nearme\'s deals!');
    
  } catch (error) {
    console.error('❌ Move failed:', error.message);
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

moveNearmeMerchant();
// Simple script to check database contents
const Database = require('better-sqlite3');

async function checkDatabase() {
  try {
    console.log('🔍 Checking database contents...\n');
    
    // Connect to database
    const db = new Database('dangol-v2.db');
    
    // Query 1: Check merchants
    console.log('📍 MERCHANTS:');
    console.log('='.repeat(80));
    const merchants = db.prepare('SELECT id, business_name, latitude, longitude FROM merchants').all();
    
    if (merchants.length === 0) {
      console.log('❌ No merchants found in database');
    } else {
      console.log(`✅ Found ${merchants.length} merchant(s):`);
      merchants.forEach((merchant, index) => {
        console.log(`  ${index + 1}. ${merchant.business_name} (ID: ${merchant.id})`);
        console.log(`     Location: ${merchant.latitude}, ${merchant.longitude}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    
    // Query 2: Check active deals
    console.log('🎯 ACTIVE DEALS (with timezone fix):');
    console.log('='.repeat(80));
    const deals = db.prepare(`
      SELECT id, title, merchant_id, expires_at, current_claims, max_claims 
      FROM deals 
      WHERE expires_at > datetime('now', '+9 hours')
    `).all();
    
    if (deals.length === 0) {
      console.log('❌ No active deals found');
      
      // Also check all deals (including expired)
      const allDeals = db.prepare('SELECT id, title, expires_at FROM deals').all();
      if (allDeals.length > 0) {
        console.log(`\n📋 Found ${allDeals.length} total deal(s) in database (including expired):`);
        allDeals.forEach((deal, index) => {
          console.log(`  ${index + 1}. ${deal.title} (ID: ${deal.id})`);
          console.log(`     Expires: ${deal.expires_at}`);
        });
      } else {
        console.log('\n📋 No deals at all in database');
      }
    } else {
      console.log(`✅ Found ${deals.length} active deal(s):`);
      deals.forEach((deal, index) => {
        console.log(`  ${index + 1}. ${deal.title} (ID: ${deal.id})`);
        console.log(`     Merchant ID: ${deal.merchant_id}`);
        console.log(`     Claims: ${deal.current_claims}/${deal.max_claims}`);
        console.log(`     Expires: ${deal.expires_at}`);
      });
    }
    
    // Close database
    db.close();
    console.log('\n' + '='.repeat(80));
    console.log('✅ Database check complete');
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

checkDatabase();
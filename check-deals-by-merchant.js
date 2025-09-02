// Script to check which merchants have active deals
const Database = require('better-sqlite3');

async function checkDealsByMerchant() {
  try {
    console.log('🎯 Checking active deals by merchant...\n');
    
    // Connect to database
    const db = new Database('dangol-v2.db');
    
    // Query for active deals with merchant info
    console.log('🏪 ACTIVE DEALS BY MERCHANT:');
    console.log('='.repeat(80));
    const activeDeals = db.prepare(`
      SELECT d.id, d.title, d.merchant_id, m.business_name 
      FROM deals d 
      JOIN merchants m ON d.merchant_id = m.id 
      WHERE d.expires_at > datetime('now', '+9 hours') 
      AND d.current_claims < d.max_claims
    `).all();
    
    if (activeDeals.length === 0) {
      console.log('❌ No active deals found');
      console.log('\n📋 Checking all deals (including expired):');
      
      const allDeals = db.prepare(`
        SELECT d.id, d.title, d.merchant_id, m.business_name, d.expires_at, d.current_claims, d.max_claims
        FROM deals d 
        JOIN merchants m ON d.merchant_id = m.id
      `).all();
      
      if (allDeals.length > 0) {
        console.log(`   Found ${allDeals.length} total deal(s):`);
        allDeals.forEach((deal, index) => {
          console.log(`   ${index + 1}. "${deal.title}" by ${deal.business_name}`);
          console.log(`      Deal ID: ${deal.id}, Merchant ID: ${deal.merchant_id}`);
          console.log(`      Claims: ${deal.current_claims}/${deal.max_claims}`);
          console.log(`      Expires: ${deal.expires_at}`);
        });
      } else {
        console.log('   No deals at all in database');
      }
    } else {
      console.log(`✅ Found ${activeDeals.length} active deal(s):\n`);
      
      // Group deals by merchant
      const dealsByMerchant = {};
      activeDeals.forEach(deal => {
        if (!dealsByMerchant[deal.merchant_id]) {
          dealsByMerchant[deal.merchant_id] = {
            business_name: deal.business_name,
            deals: []
          };
        }
        dealsByMerchant[deal.merchant_id].deals.push(deal);
      });
      
      // Display deals grouped by merchant
      Object.entries(dealsByMerchant).forEach(([merchantId, merchantData]) => {
        console.log(`🏪 ${merchantData.business_name} (ID: ${merchantId}):`);
        merchantData.deals.forEach((deal, index) => {
          console.log(`   ${index + 1}. "${deal.title}" (Deal ID: ${deal.id})`);
        });
        console.log('');
      });
      
      console.log('📊 SUMMARY:');
      console.log(`   Total merchants with active deals: ${Object.keys(dealsByMerchant).length}`);
      console.log(`   Total active deals: ${activeDeals.length}`);
      
      // Show merchant breakdown
      Object.entries(dealsByMerchant).forEach(([merchantId, merchantData]) => {
        console.log(`   ${merchantData.business_name}: ${merchantData.deals.length} deal(s)`);
      });
    }
    
    // Close database
    db.close();
    console.log('\n' + '='.repeat(80));
    console.log('✅ Active deals check complete');
    
  } catch (error) {
    console.error('❌ Deals check failed:', error.message);
  }
}

checkDealsByMerchant();
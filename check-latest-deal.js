// Simple script to check the latest deal in the database
const Database = require('better-sqlite3');

async function checkLatestDeal() {
  try {
    console.log('🔍 Checking latest deal in database...\n');
    
    // Connect to database
    const db = new Database('dangol-v2.db');
    
    // Query for latest deal
    console.log('📋 LATEST DEAL:');
    console.log('='.repeat(60));
    const latestDeal = db.prepare('SELECT id, title, expires_at, created_at FROM deals ORDER BY id DESC LIMIT 1').get();
    
    if (!latestDeal) {
      console.log('❌ No deals found in database');
    } else {
      console.log(`✅ Found latest deal (ID: ${latestDeal.id}):`);
      console.log(`   Title: ${latestDeal.title}`);
      console.log(`   Created: ${latestDeal.created_at}`);
      console.log(`   Expires: ${latestDeal.expires_at}`);
      
      // Check if deal is active based on current UTC time vs stored time
      const now = new Date();
      const expiryDate = new Date(latestDeal.expires_at + ' UTC');
      const isExpired = expiryDate < now;
      
      console.log(`   Status: ${isExpired ? '❌ EXPIRED' : '✅ ACTIVE'}`);
      
      if (isExpired) {
        const timeDiff = Math.round((now - expiryDate) / (1000 * 60)); // minutes
        console.log(`   Expired: ${timeDiff} minutes ago`);
      } else {
        const timeDiff = Math.round((expiryDate - now) / (1000 * 60)); // minutes
        console.log(`   Expires in: ${timeDiff} minutes`);
      }
    }
    
    // Close database
    db.close();
    console.log('\n' + '='.repeat(60));
    console.log('✅ Latest deal check complete');
    
  } catch (error) {
    console.error('❌ Latest deal check failed:', error.message);
  }
}

checkLatestDeal();
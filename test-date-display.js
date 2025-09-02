// Test script to check date formatting function with database timestamp
// Replicating the formatDate function from the React components

function testDateFormatting() {
  console.log('🕒 Testing date formatting function...\n');
  
  // The exact timestamp from the database
  const dbTimestamp = '2025-09-01 02:13:14';
  
  console.log('📅 INPUT:');
  console.log(`   Database timestamp: "${dbTimestamp}"`);
  console.log('   (This is stored in UTC format in the database)');
  
  // Replicate the formatDate function from the React components
  const formatDate = (dateString) => {
    // Display in KST
    const date = new Date(dateString + ' UTC');
    const kstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
    return kstDate.toLocaleString('en-US', { timeZone: 'Asia/Seoul' });
  };
  
  console.log('\n🔄 PROCESSING:');
  console.log('   1. Append " UTC" to timestamp');
  console.log('   2. Create Date object');
  console.log('   3. Add 9 hours (KST offset)');
  console.log('   4. Format with toLocaleString()');
  
  // Test the formatting
  const formattedDate = formatDate(dbTimestamp);
  
  console.log('\n📋 OUTPUT:');
  console.log(`   Formatted result: "${formattedDate}"`);
  
  // Show the intermediate steps for debugging
  console.log('\n🔍 DEBUG INFO:');
  const intermediateDate = new Date(dbTimestamp + ' UTC');
  const kstDate = new Date(intermediateDate.getTime() + (9 * 60 * 60 * 1000));
  
  console.log(`   UTC Date object: ${intermediateDate.toISOString()}`);
  console.log(`   KST Date object: ${kstDate.toISOString()}`);
  console.log(`   UTC time: ${intermediateDate.toLocaleString('en-US', { timeZone: 'UTC' })}`);
  console.log(`   KST time: ${kstDate.toLocaleString('en-US', { timeZone: 'Asia/Seoul' })}`);
  
  // Compare with current time
  const now = new Date();
  const isExpired = intermediateDate < now;
  
  console.log('\n⏰ EXPIRY CHECK:');
  console.log(`   Current UTC time: ${now.toISOString()}`);
  console.log(`   Deal expires at: ${intermediateDate.toISOString()}`);
  console.log(`   Is expired? ${isExpired ? '❌ YES' : '✅ NO'}`);
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Date formatting test complete');
}

testDateFormatting();
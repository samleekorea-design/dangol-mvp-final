// Test script to check customer deals API with Seoul merchant coordinates
// Using coordinates where merchants actually exist

async function testSeoulDealsAPI() {
  try {
    const url = 'http://localhost:3000/api/customers/deals?lat=37.5665&lng=126.978&radius=1000';
    console.log('🏪 Testing deals API with Seoul merchant coordinates...');
    console.log('📍 URL:', url);
    console.log('📍 Coordinates: 37.5665, 126.978 (Seoul city center)');
    console.log('📏 Radius: 1000m\n');
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('📡 RESPONSE:');
    console.log('='.repeat(60));
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ API call successful');
      console.log('📍 Location used:', data.location);
      console.log('🎯 Deals found:', data.count);
      
      if (data.deals && data.deals.length > 0) {
        console.log('\n🎉 DEALS FOUND:');
        console.log('='.repeat(60));
        data.deals.forEach((deal, index) => {
          console.log(`${index + 1}. "${deal.title}"`);
          console.log(`   🏪 Merchant: ${deal.merchant_name}`);
          console.log(`   📍 Address: ${deal.merchant_address}`);
          console.log(`   👥 Claims: ${deal.current_claims}/${deal.max_claims}`);
          console.log(`   ⏰ Expires: ${deal.expires_at}`);
          console.log(`   📍 Location: ${deal.latitude}, ${deal.longitude}`);
          console.log('');
        });
      } else {
        console.log('❌ No deals found - check if deals are expired or no merchants have active deals');
      }
    } else {
      console.log('❌ API call failed:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSeoulDealsAPI();
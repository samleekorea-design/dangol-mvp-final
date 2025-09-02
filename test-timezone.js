// Simple test script to check customer deals API with timezone fix
// Using Node.js built-in fetch (Node 18+)

async function testDealsAPI() {
  try {
    const url = 'http://localhost:3000/api/customers/deals?lat=37.481284&lng=127.056054&radius=1000';
    console.log('Testing deals API...');
    console.log('URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('\nResponse Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ API call successful');
      console.log('📍 Location:', data.location);
      console.log('🎯 Deals found:', data.count);
      
      if (data.deals && data.deals.length > 0) {
        console.log('\n📋 Deal details:');
        data.deals.forEach((deal, index) => {
          console.log(`  ${index + 1}. ${deal.title} - ${deal.merchant_name}`);
          console.log(`     Claims: ${deal.current_claims}/${deal.max_claims}`);
          console.log(`     Expires: ${deal.expires_at}`);
        });
      } else {
        console.log('❌ No deals found in this area');
      }
    } else {
      console.log('❌ API call failed:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDealsAPI();
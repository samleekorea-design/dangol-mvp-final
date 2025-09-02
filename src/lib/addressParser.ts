export interface ParsedAddress {
  streetAndDistrict: string;
  fullAddress: string;
}

/**
 * Parses Korean addresses to extract street address and 동 (district)
 * Examples:
 * - "서울특별시 강남구 역삼동 123-45" → "역삼동"
 * - "서울시 서초구 서초동 서초대로 123" → "서초동 서초대로"
 * - "부산광역시 해운대구 우동 중동로 123" → "우동 중동로"
 */
export function parseKoreanAddress(fullAddress: string): ParsedAddress {
  if (!fullAddress) {
    return {
      streetAndDistrict: '',
      fullAddress: ''
    };
  }

  const address = fullAddress.trim();
  
  // Split by spaces and filter empty parts
  const parts = address.split(/\s+/).filter(part => part.length > 0);
  
  if (parts.length === 0) {
    return {
      streetAndDistrict: '',
      fullAddress: address
    };
  }

  // Find 동 (dong/district) - ends with 동
  const dongIndex = parts.findIndex(part => part.endsWith('동'));
  
  if (dongIndex === -1) {
    // No 동 found, try to extract street name from the end
    // Look for common street name patterns (로, 길, 대로, etc.)
    const streetParts = parts.filter(part => 
      part.endsWith('로') || 
      part.endsWith('길') || 
      part.endsWith('대로') ||
      part.endsWith('거리') ||
      part.endsWith('번길')
    );
    
    if (streetParts.length > 0) {
      return {
        streetAndDistrict: streetParts[0],
        fullAddress: address
      };
    }
    
    // Fallback: return last meaningful part (skip numbers)
    const lastMeaningfulPart = parts.reverse().find(part => 
      !/^\d+(-\d+)?$/.test(part) && // not just numbers or number-number
      part.length > 1
    );
    
    return {
      streetAndDistrict: lastMeaningfulPart || parts[parts.length - 1] || '',
      fullAddress: address
    };
  }

  // Found 동, now look for street name after it
  const dongName = parts[dongIndex];
  const remainingParts = parts.slice(dongIndex + 1);
  
  // Find street name (로, 길, 대로, etc.) in remaining parts
  const streetPart = remainingParts.find(part => 
    part.endsWith('로') || 
    part.endsWith('길') || 
    part.endsWith('대로') ||
    part.endsWith('거리') ||
    part.endsWith('번길')
  );
  
  if (streetPart) {
    return {
      streetAndDistrict: `${dongName} ${streetPart}`,
      fullAddress: address
    };
  }
  
  // No street name found after 동, just return 동
  return {
    streetAndDistrict: dongName,
    fullAddress: address
  };
}

/**
 * Test function to validate address parsing
 */
export function testAddressParsing() {
  const testCases = [
    "서울특별시 강남구 역삼동 123-45",
    "서울시 서초구 서초동 서초대로 123",
    "부산광역시 해운대구 우동 중동로 456",
    "경기도 성남시 분당구 정자동 정자일로 789",
    "서울 마포구 홍대입구역 2번 출구",
    "대구광역시 중구 동성로 123",
    "광주광역시 동구 충장로 5가 456-78",
    ""
  ];
  
  console.log("Address parsing test results:");
  testCases.forEach(address => {
    const result = parseKoreanAddress(address);
    console.log(`"${address}" → "${result.streetAndDistrict}"`);
  });
}
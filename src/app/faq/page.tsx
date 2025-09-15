'use client';

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-white mb-8">자주 묻는 질문</h1>
        
        <div className="bg-white rounded-lg p-6 space-y-8 text-gray-800">
          {/* Customer FAQs */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">고객님을 위한 안내</h2>
            
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mt-4">딜 신청 관련</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900">Q: 딜을 신청했는데 다시 신청이 안돼요</p>
                  <p className="text-gray-700 mt-1">A: 현재 딜은 건당 1번 밖에 신청하실 수 없습니다. 이미 신청한 딜은 사용하거나 취소하기 전까지 다시 신청할 수 없습니다. 취소하시려면 신청한 딜에서 '취소' 버튼을 누르세요.</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900">Q: 딜 신청을 취소했는데도 다시 신청이 안돼요</p>
                  <p className="text-gray-700 mt-1">A: 앱을 새로고침하거나 페이지를 다시 방문해보세요. 문제가 지속되면 카카오톡 채널로 문의해주세요.</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900">Q: QR 코드를 스캔했는데 아무 일도 일어나지 않아요</p>
                  <p className="text-gray-700 mt-1">A: 카메라 권한을 허용했는지 확인하세요. Safari나 Chrome 브라우저를 사용하고 계신지 확인해주세요.</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900">Q: 딜이 만료되었다고 나와요</p>
                  <p className="text-gray-700 mt-1">A: 딜은 신청 후 30분 내에 사용해야 합니다. 시간이 지나면 자동으로 만료되며, 다시 신청할 수 있습니다.</p>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mt-6">앱 설치 관련</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900">Q: 홈 화면에 추가가 안돼요</p>
                  <p className="text-gray-700 mt-1">A: 아이폰 iOS는 Safari 브라우저에서만 가능합니다. 안드로이드폰에서는 Chrome에서 가능합니다. dangol.site/install 페이지에서 자세한 방법을 확인하세요.</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900">Q: 알림이 오지 않아요</p>
                  <p className="text-gray-700 mt-1">A: 기기 설정에서 브라우저 알림을 허용했는지 확인하세요. 아이폰 iOS에서는 알림이 지원되지 않으니 자주 방문하셔서 새로고침을 하셔서 새로 올라온 혜택을 확인하세요.</p>
                </div>
              </div>
            </div>
          </section>
          
          {/* Merchant FAQs */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">매장 사장님을 위한 안내</h2>
            
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mt-4">딜 관리</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900">Q: 딜을 만들었는데 수정이 안돼요</p>
                  <p className="text-gray-700 mt-1">A: 확정된 딜은 수량만 수정 가능합니다. 다른 내용을 수정하려면 수량을 0으로 만들고 새로운 딜을 만들어주세요.</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900">Q: 고객이 QR을 보여줬는데 어떻게 확인하나요</p>
                  <p className="text-gray-700 mt-1">A: 매장용 대시보드에서 '스캔' 버튼을 눌러 고객의 QR 코드를 스캔하세요. 자동으로 사용 처리됩니다. QR 스캐닝이 원활하지 않을 경우 6자리 코드를 입력해주세요.</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900">Q: 딜이 자동으로 종료되나요?</p>
                  <p className="text-gray-700 mt-1">A: 설정한 종료 시간이 되거나 수량이 모두 소진되면 자동으로 종료됩니다.</p>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mt-6">기타</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900">Q: 비밀번호를 잊어버렸어요</p>
                  <p className="text-gray-700 mt-1">A: 카카오톡 채널 @dangol_local로 연락주시면 재설정해드립니다.</p>
                </div>
              </div>
            </div>
          </section>
          
          <div className="pt-6 mt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">추가 도움이 필요하신가요?</h3>
            <p className="text-gray-700">카카오톡 채널: @dangol_local</p>
            <p className="text-gray-700">운영 시간: 평일 10:00 - 18:00</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button onClick={() => window.history.back()} className="text-white/80 hover:text-white">← 돌아가기</button>
        </div>
      </div>
    </div>
  );
}

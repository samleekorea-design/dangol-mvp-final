'use client';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-white mb-8">개인정보처리방침</h1>
        
        <div className="bg-white/10 backdrop-blur rounded-lg p-6 space-y-6 text-white">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. 수집하는 정보</h2>
            <ul className="list-disc list-inside space-y-2 text-white/90">
              <li>기기 식별자 (딜 신청 추적용)</li>
              <li>위치 정보 (고객 동의 시, 근처 딜 표시용)</li>
              <li>푸시 알림 토큰 (알림 서비스 제공 시)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. 정보 사용 목적</h2>
            <ul className="list-disc list-inside space-y-2 text-white/90">
              <li>딜 신청 및 사용 관리</li>
              <li>중복 신청 방지</li>
              <li>근처 딜 표시 (위치 정보 제공 시)</li>
              <li>서비스 관련 알림 전송</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. 정보 보관 기간</h2>
            <p className="text-white/90">딜 신청 정보는 딜 종료 후 30일간 보관 후 자동 삭제됩니다. 기기 식별자는 마지막 이용일로부터 1년간 보관됩니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. 정보 보호</h2>
            <p className="text-white/90">수집된 정보는 암호화되어 안전하게 저장되며, 제3자에게 제공되지 않습니다. Firebase Cloud Messaging을 통해 푸시 알림이 전송됩니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. 사용자 권리</h2>
            <p className="text-white/90">브라우저 설정에서 쿠키 및 로컬 저장소를 삭제하여 기기 식별 정보를 제거할 수 있습니다. 위치 정보 및 푸시 알림은 기기 설정에서 언제든 거부할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. 문의</h2>
            <p className="text-white/90">개인정보 관련 문의는 카카오톡 채널 @dangol_local로 연락주세요.</p>
          </section>


          <div className="pt-6 mt-6 border-t border-white/20">
            <p className="text-sm text-white/70">시행일: 2025년 9월 15일</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-white/80 hover:text-white">← 돌아가기</a>
        </div>
      </div>
    </div>
  );
}
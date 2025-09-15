'use client';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-white mb-8">이용약관</h1>
        
        <div className="bg-white/10 backdrop-blur rounded-lg p-6 space-y-6 text-white">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. 서비스 소개</h2>
            <p className="text-white/90">단골 서비스는 지역 상점과 고객을 연결하는 플랫폼입니다. 상점은 할인 또는 특별 혜택을 제공하고, 고객은 QR 코드를 통해 이를 이용할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. 이용 규칙</h2>
            <ul className="list-disc list-inside space-y-2 text-white/90">
              <li>각 기기당 하나의 딜만 신청 가능합니다</li>
              <li>신청한 딜은 유효 시간 내에 사용해야 합니다</li>
              <li>취소 후 동일한 딜을 다시 신청할 수 있습니다</li>
              <li>허위 또는 부정한 방법으로 서비스를 이용할 수 없습니다</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. 책임의 한계</h2>
            <p className="text-white/90">단골은 플랫폼 제공자로서 상점과 고객 간의 거래를 중개합니다. 상품이나 서비스의 품질, 제공 여부는 해당 상점의 책임입니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. 서비스 변경 및 중단</h2>
            <p className="text-white/90">서비스 개선을 위해 사전 고지 없이 서비스가 변경되거나 일시 중단될 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. 문의</h2>
            <p className="text-white/90">서비스 이용 관련 문의는 카카오톡 채널 @dangol_local로 연락주세요.</p>
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
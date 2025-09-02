'use client'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#65BBFF] via-10% via-[#3A82FF] via-25% to-[#1E6AFF]">
      
      {/* Full Page Content */}
      <div className="relative">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <div className="text-center">
            {/* Logo */}
            <div className="mb-8">
              <img 
                src="/images/logo-white.png" 
                alt="Logo" 
                className="h-12 w-auto mx-auto opacity-90"
              />
            </div>

            {/* Benefits Cards Window */}
            <div className="mb-20 overflow-hidden relative w-80 mx-auto">
              <div className="w-80 h-32 mx-auto relative bg-transparent rounded-2xl">
                <div 
                  className="flex absolute inset-0 animate-[slideCards_36s_linear_infinite]"
                  style={{ width: 'calc(12 * 320px)' }}
                >
                  {/* Customer Benefit 1 */}
                  <div className="w-80 h-32 flex flex-col items-center justify-start px-6 flex-shrink-0 bg-transparent rounded-lg pt-4">
                    <div className="w-8 h-8 bg-[#3A82FF]/40 rounded-full flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-light text-white text-center leading-relaxed" dangerouslySetInnerHTML={{ __html: '내 현재 주변에서 받을 수 있는<br/>혜택을 찾아보세요' }} />
                  </div>

                  {/* Merchant Benefit 1 */}
                  <div className="w-80 h-32 flex flex-col items-center justify-start px-6 flex-shrink-0 bg-[#0D4FCC]/60 rounded-lg pt-4">
                    <div className="w-8 h-8 bg-[#3A82FF]/40 rounded-full flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m3 0H4a1 1 0 00-1 1v14a1 1 0 001 1h16a1 1 0 001-1V5a1 1 0 00-1-1z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4" />
                      </svg>
                    </div>
                    <p className="text-sm font-light text-white text-center leading-relaxed" dangerouslySetInnerHTML={{ __html: '매장 근처 고객을 하이퍼 타겟팅하여<br/>직접 알림을 보내세요' }} />
                  </div>

                  {/* Customer Benefit 2 */}
                  <div className="w-80 h-32 flex flex-col items-center justify-start px-6 flex-shrink-0 bg-transparent rounded-lg pt-4">
                    <div className="w-8 h-8 bg-[#3A82FF]/40 rounded-full flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m3 0H4a1 1 0 00-1 1v14a1 1 0 001 1h16a1 1 0 001-1V5a1 1 0 00-1-1z" />
                      </svg>
                    </div>
                    <p className="text-sm font-light text-white text-center leading-relaxed" dangerouslySetInnerHTML={{ __html: '앱에서 쿠폰을 확보하시고<br/>매장에서 바로 사용하세요' }} />
                  </div>

                  {/* Merchant Benefit 2 */}
                  <div className="w-80 h-32 flex flex-col items-center justify-start px-6 flex-shrink-0 bg-[#0D4FCC]/60 rounded-lg pt-4">
                    <div className="w-8 h-8 bg-[#3A82FF]/40 rounded-full flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <p className="text-sm font-light text-white text-center leading-relaxed" dangerouslySetInnerHTML={{ __html: '고객을 기다리지 말고,<br/>매장으로 직접 안내하세요' }} />
                  </div>

                  {/* Customer Benefit 3 */}
                  <div className="w-80 h-32 flex flex-col items-center justify-start px-6 flex-shrink-0 bg-transparent rounded-lg pt-4">
                    <div className="w-8 h-8 bg-[#3A82FF]/40 rounded-full flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-light text-white text-center leading-relaxed" dangerouslySetInnerHTML={{ __html: '처음가는 매장에서도<br/>단골 혜택을 누리세요' }} />
                  </div>

                  {/* Merchant Benefit 3 */}
                  <div className="w-80 h-32 flex flex-col items-center justify-start px-6 flex-shrink-0 bg-[#0D4FCC]/60 rounded-lg pt-4">
                    <div className="w-8 h-8 bg-[#3A82FF]/40 rounded-full flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <p className="text-sm font-light text-white text-center leading-relaxed">
                      더 많은 단골을 만드세요
                    </p>
                  </div>

                  {/* Duplicate cards for seamless infinite loop */}
                  {/* Customer Benefit 1 */}
                  <div className="w-80 h-32 flex flex-col items-center justify-start px-6 flex-shrink-0 bg-transparent rounded-lg pt-4">
                    <div className="w-8 h-8 bg-[#3A82FF]/40 rounded-full flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-light text-white text-center leading-relaxed" dangerouslySetInnerHTML={{ __html: '내 현재 주변에서 받을 수 있는<br/>혜택을 찾아보세요' }} />
                  </div>

                  {/* Merchant Benefit 1 */}
                  <div className="w-80 h-32 flex flex-col items-center justify-start px-6 flex-shrink-0 bg-[#0D4FCC]/60 rounded-lg pt-4">
                    <div className="w-8 h-8 bg-[#3A82FF]/40 rounded-full flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m3 0H4a1 1 0 00-1 1v14a1 1 0 001 1h16a1 1 0 001-1V5a1 1 0 00-1-1z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4" />
                      </svg>
                    </div>
                    <p className="text-sm font-light text-white text-center leading-relaxed" dangerouslySetInnerHTML={{ __html: '매장 근처 고객을 하이퍼 타겟팅하여<br/>직접 알림을 보내세요' }} />
                  </div>

                  {/* Customer Benefit 2 */}
                  <div className="w-80 h-32 flex flex-col items-center justify-start px-6 flex-shrink-0 bg-transparent rounded-lg pt-4">
                    <div className="w-8 h-8 bg-[#3A82FF]/40 rounded-full flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m3 0H4a1 1 0 00-1 1v14a1 1 0 001 1h16a1 1 0 001-1V5a1 1 0 00-1-1z" />
                      </svg>
                    </div>
                    <p className="text-sm font-light text-white text-center leading-relaxed" dangerouslySetInnerHTML={{ __html: '앱에서 쿠폰을 확보하시고<br/>매장에서 바로 사용하세요' }} />
                  </div>

                  {/* Merchant Benefit 2 */}
                  <div className="w-80 h-32 flex flex-col items-center justify-start px-6 flex-shrink-0 bg-[#0D4FCC]/60 rounded-lg pt-4">
                    <div className="w-8 h-8 bg-[#3A82FF]/40 rounded-full flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <p className="text-sm font-light text-white text-center leading-relaxed" dangerouslySetInnerHTML={{ __html: '고객을 기다리지 말고,<br/>매장으로 직접 안내하세요' }} />
                  </div>

                  {/* Customer Benefit 3 */}
                  <div className="w-80 h-32 flex flex-col items-center justify-start px-6 flex-shrink-0 bg-transparent rounded-lg pt-4">
                    <div className="w-8 h-8 bg-[#3A82FF]/40 rounded-full flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-light text-white text-center leading-relaxed" dangerouslySetInnerHTML={{ __html: '처음가는 매장에서도<br/>단골 혜택을 누리세요' }} />
                  </div>

                  {/* Merchant Benefit 3 */}
                  <div className="w-80 h-32 flex flex-col items-center justify-start px-6 flex-shrink-0 bg-[#0D4FCC]/60 rounded-lg pt-4">
                    <div className="w-8 h-8 bg-[#3A82FF]/40 rounded-full flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <p className="text-sm font-light text-white text-center leading-relaxed">
                      더 많은 단골을 만드세요
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Tagline */}
            <div className="text-center mb-10">
              <h1 className="text-sm md:text-lg lg:text-xl font-light text-white/80 mb-1 tracking-wide leading-tight drop-shadow-sm">
                내 주변 특별한 혜택과
              </h1>
              <h1 className="text-sm md:text-lg lg:text-xl font-light text-white/80 mb-1 tracking-wide leading-tight drop-shadow-sm">
                단골 로열티가 만나는
              </h1>
              <h1 className="text-sm md:text-lg lg:text-xl font-light text-white/80 tracking-wide leading-tight drop-shadow-sm">
                우리 동네 전용 채널
              </h1>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-row gap-3 justify-center items-center w-full max-w-[320px] mx-auto mt-20 mb-10">
              <a
                href="/merchant/login"
                className="group flex-1 bg-white/10 backdrop-blur-sm text-white font-light py-3 px-4 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 text-center"
              >
                <span className="text-sm tracking-wide">고객과 연결하기</span>
              </a>
              
              <a
                href="/customer"
                className="group flex-1 bg-white text-blue-600 font-light py-3 px-4 rounded-lg hover:bg-white/90 transition-all duration-300 text-center"
              >
                <span className="text-sm tracking-wide">동네 혜택 찾기</span>
              </a>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes slideCards {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-1920px);
            }
          }
        `}</style>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function InstallPage() {
  const router = useRouter()
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop' | 'unknown'>('unknown')
  const [browserType, setBrowserType] = useState<'safari' | 'chrome' | 'firefox' | 'other'>('other')

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      
      // Detect iOS
      if (/iphone|ipad|ipod/.test(userAgent)) {
        setDeviceType('ios')
        if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) {
          setBrowserType('safari')
        } else if (/chrome/.test(userAgent)) {
          setBrowserType('chrome')
        }
      }
      // Detect Android
      else if (/android/.test(userAgent)) {
        setDeviceType('android')
        if (/chrome/.test(userAgent)) {
          setBrowserType('chrome')
        } else if (/firefox/.test(userAgent)) {
          setBrowserType('firefox')
        }
      }
      // Desktop
      else {
        setDeviceType('desktop')
        // Add browser detection for desktop
        if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) {
          setBrowserType('safari')
        } else if (/chrome/.test(userAgent)) {
          setBrowserType('chrome')
        } else if (/firefox/.test(userAgent)) {
          setBrowserType('firefox')
        } else {
          setBrowserType('other')
        }
      }
    }

    detectDevice()
  }, [])

  const IOSInstructions = () => (
    <>
      <div className="flex items-center gap-4 mb-6">
        <span className="text-4xl">📱</span>
        <div>
          <h2 className="text-2xl font-bold text-white">iOS 설치 안내</h2>
          <p className="text-white/80 mt-1">Safari에서 홈 화면에 추가하세요</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium mb-2">먼저 아래 단계를 모두 확인하세요</h3>
              <p className="text-white/80 text-sm">공유 메뉴가 화면을 가리기 전에 전체 과정을 읽어주세요</p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium mb-4">공유 버튼을 누른 후 다음 단계를 따르세요</h3>
              
              <div className="space-y-3 ml-4">
                <div className="flex items-start gap-3">
                  <span className="text-purple-300 font-bold">2-1</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Image src="/icons/safari-share-icon.png" alt="Safari 공유 버튼" width={32} height={32} className="rounded" />
                      <span className="text-white/80 text-sm">하단 중앙의 공유 버튼을 누르세요</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-purple-300 font-bold">2-2</span>
                  <div className="flex-1">
                    <p className="text-white/80 text-sm">공유 메뉴에서 아래로 스크롤하세요</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-purple-300 font-bold">2-3</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Image src="/icons/safari-addtohomescreen-icon.png" alt="홈 화면에 추가" width={32} height={32} className="rounded" />
                      <span className="text-white/80 text-sm">'홈 화면에 추가'를 선택하세요</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              3
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium mb-2">"추가" 버튼을 눌러 완료하세요</h3>
              <p className="text-white/80 text-sm">앱 이름을 확인하고 추가를 선택하면 홈 화면에 설치됩니다</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  const AndroidInstructions = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🤖</div>
        <h2 className="text-2xl font-light text-white mb-2">Android 설치 안내</h2>
        <p className="text-white/80 text-base">Chrome 브라우저에서 앱을 설치하세요</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">Chrome 브라우저에서 이 페이지를 열어주세요</h3>
              <p className="text-white/80 text-sm">Chrome에서만 앱 설치가 가능합니다</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">우상단 메뉴 버튼을 눌러주세요</h3>
              <div className="flex items-center gap-2 mb-2">
                <Image src="/icons/chrome-threedotmenu-icon.png" alt="Chrome 메뉴 버튼" width={32} height={32} className="rounded" />
                <span className="text-white/80 text-sm">메뉴 (점 3개)</span>
              </div>
              <p className="text-white/80 text-sm">Chrome 브라우저 우상단의 점 3개 메뉴입니다</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">"앱 설치" 또는 "홈 화면에 추가"를 선택하세요</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📱</span>
                <span className="text-white/80 text-sm">앱 설치</span>
              </div>
              <p className="text-white/80 text-sm">메뉴에서 앱 설치 관련 옵션을 찾아 터치하세요</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              4
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">"설치" 버튼을 눌러주세요</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">✅</span>
                <span className="text-white/80 text-sm">설치 완료</span>
              </div>
              <p className="text-white/80 text-sm">홈 화면에 단골 앱이 추가됩니다</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const DesktopInstructions = () => {
    if (browserType === 'safari') {
      return (
        <>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl">💻</span>
            <div>
              <h2 className="text-2xl font-bold text-white">데스크톱 설치 안내</h2>
              <p className="text-white/80 mt-1">Safari는 PWA 설치를 지원하지 않습니다</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-2">Chrome 브라우저를 사용해주세요</h3>
                  <p className="text-white/80 text-sm">데스크톱에서 PWA 설치는 Chrome, Edge, 또는 Brave 브라우저에서만 가능합니다</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )
    }
    
    // Original Chrome instructions
    return (
      <>
        <div className="flex items-center gap-4 mb-6">
          <span className="text-4xl">💻</span>
          <div>
            <h2 className="text-2xl font-bold text-white">데스크톱 설치 안내</h2>
            <p className="text-white/80 mt-1">Chrome 브라우저에서 앱을 설치하세요</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium mb-2">Chrome 브라우저에서 이 페이지를 열어주세요</h3>
                <p className="text-white/80 text-sm">Chrome에서만 데스크톱 앱 설치가 가능합니다</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium mb-2">주소창 오른쪽의 설치 아이콘을 클릭하세요</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Image src="/icons/chrome-addressbarinstall-icon.png" alt="Chrome 설치 아이콘" width={32} height={32} className="rounded" />
                  <span className="text-white/80 text-sm">설치 아이콘</span>
                </div>
                <p className="text-white/80 text-sm">주소창 끝에 나타나는 설치 아이콘을 클릭하세요</p>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const UnsupportedInstructions = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🌐</div>
        <h2 className="text-2xl font-light text-white mb-2">브라우저 안내</h2>
        <p className="text-white/80 text-base">앱 설치를 위해 권장 브라우저를 사용해주세요</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="text-center">
            <h3 className="text-white font-medium mb-4">권장 브라우저</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">🍎</span>
                <span className="text-white">iOS: Safari 브라우저</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">🤖</span>
                <span className="text-white">Android: Chrome 브라우저</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">💻</span>
                <span className="text-white">데스크톱: Chrome 브라우저</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="text-center">
            <p className="text-white/80 text-sm">
              권장 브라우저에서 다시 방문하시면 앱 설치가 가능합니다
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderInstructions = () => {
    if (deviceType === 'ios' && browserType === 'safari') {
      return <IOSInstructions />
    } else if (deviceType === 'android' && browserType === 'chrome') {
      return <AndroidInstructions />
    } else if (deviceType === 'desktop') {
      return <DesktopInstructions />
    } else {
      return <UnsupportedInstructions />
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_#65BBFF_0%,_#3A82FF_25%,_#2570EA_50%,_#1857C7_100%)]">
      <div className="max-w-[375px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-start mb-6 w-full">
          <button onClick={() => router.back()}>
            <svg 
              className="h-8 w-auto opacity-90 text-white hover:opacity-100 transition-opacity duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        {/* Title */}
        <div className="text-center mb-8 w-full">
          <div className="mb-2">
            <h1 className="text-4xl font-light text-white">앱 설치하기</h1>
          </div>
          <p className="text-base text-white/80">
            홈 화면에서 바로 단골을 이용하세요
          </p>
        </div>

        {/* Instructions */}
        {renderInstructions()}

        {/* Benefits */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-white font-medium mb-4 text-center">앱 설치의 장점</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚡</span>
              <span className="text-white/90 text-sm">더 빠른 실행 속도</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">📱</span>
              <span className="text-white/90 text-sm">홈 화면에서 바로 접근</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">🔔</span>
              <span className="text-white/90 text-sm">새로운 혜택 알림</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">📶</span>
              <span className="text-white/90 text-sm">오프라인에서도 이용 가능</span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => router.push('/customer')}
            className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium py-4 px-6 rounded-2xl text-lg transition-all duration-200 border border-white/20"
          >
            혜택 보러가기
          </button>
        </div>
      </div>
    </div>
  )
}
export default function MerchantRegister() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#65BBFF] via-10% via-[#3A82FF] via-25% to-[#1E6AFF] flex items-center justify-center">
      <div className="max-w-[375px] mx-auto px-6 py-8">
        {/* Logo */}
        <div className="flex justify-center mb-8 w-full">
          <a href="/">
            <img 
              src="/images/logo-white.png" 
              alt="Dangol Logo" 
              className="h-8 w-auto opacity-90"
            />
          </a>
        </div>
        
        {/* Main Content */}
        <div className="text-center text-white">
          <h1 className="text-3xl font-light mb-6">상점 등록 안내</h1>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-6">
            <p className="text-lg mb-4">
              상점 등록은 현재 수동으로 진행됩니다.
            </p>
            <p className="text-sm text-white/80 mb-6">
              등록을 원하시면 아래 카카오톡 채널을 통해 문의해주세요.
            </p>
            <a
              href="http://pf.kakao.com/_xbZWkn/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-yellow-400 text-gray-800 font-medium py-3 px-6 rounded-lg hover:bg-yellow-300 transition-colors duration-300"
            >
              카카오톡으로 문의하기
            </a>
          </div>
          
          <div className="text-center">
            <a
              href="/merchant/login"
              className="text-white/80 hover:text-white underline text-sm transition-colors duration-300"
            >
              이미 계정이 있으신가요? 로그인하기
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
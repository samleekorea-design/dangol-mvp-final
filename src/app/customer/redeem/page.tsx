'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import QRCode from 'qrcode'

function RedeemPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const dealId = searchParams.get('dealId')
  const code = searchParams.get('code')
  const merchant = searchParams.get('merchant')
  
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const generateQRCode = async () => {
      if (code) {
        try {
          // Generate QR code with high error correction for better scanning
          const url = await QRCode.toDataURL(code, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            quality: 1,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            },
            width: 300
          })
          setQrCodeUrl(url)
        } catch (error) {
          console.error('Failed to generate QR code:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }
    
    generateQRCode()
  }, [code])
  
  if (!code || !merchant) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <p className="text-gray-600 text-lg mb-4">유효하지 않은 혜택 코드입니다</p>
        <button
          onClick={() => router.push('/customer')}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← 혜택 목록으로 돌아가기
        </button>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_#65BBFF_0%,_#3A82FF_25%,_#2570EA_50%,_#1857C7_100%)] flex flex-col">
      {/* Header */}
      <div className="text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/customer')}
            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">혜택 사용</h1>
          <div className="w-8"></div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Merchant Name */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            {decodeURIComponent(merchant)}
          </h2>
          <p className="text-white/80">혜택 사용 코드</p>
        </div>
        
        {/* QR Code */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {isLoading ? (
            <div className="w-[250px] h-[250px] flex items-center justify-center">
              <div className="text-gray-400">QR 코드 생성 중...</div>
            </div>
          ) : (
            <img 
              src={qrCodeUrl} 
              alt="QR Code"
              className="w-[250px] h-[250px]"
            />
          )}
        </div>
        
        {/* Code Display */}
        <div className="text-center mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-8 py-4 mb-4 shadow-lg">
            <div className="text-3xl font-bold tracking-wider font-mono text-gray-900">
              {code}
            </div>
          </div>
          <p className="text-lg text-white font-medium">
            매장에 보여주세요
          </p>
        </div>
        
        {/* Instructions */}
        <div className="max-w-sm text-center">
          <p className="text-sm text-white/80">
            위의 QR 코드나 숫자 코드를 매장 직원에게 보여주시면 혜택을 받으실 수 있습니다.
          </p>
        </div>
      </div>
      
      {/* Bottom Safe Area */}
      <div className="p-6">
        <button
          onClick={() => router.push('/customer')}
          className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium py-4 px-6 rounded-2xl text-lg transition-all duration-200 border border-white/20"
        >
          혜택 목록으로 돌아가기
        </button>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RedeemPage />
    </Suspense>
  )
}
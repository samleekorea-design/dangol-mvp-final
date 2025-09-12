'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BrowserQRCodeReader } from '@zxing/browser'

type ScanStatus = 'ready' | 'scanning' | 'processing' | 'success' | 'error'

interface ScanResult {
  message: string
  dealTitle?: string
}

export default function MerchantScanPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserQRCodeReader | null>(null)
  const [scanStatus, setScanStatus] = useState<ScanStatus>('ready')
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [manualCode, setManualCode] = useState('')
  const [cameraStarted, setCameraStarted] = useState(false)
  const [isMerchantLoggedIn, setIsMerchantLoggedIn] = useState(false)
  const resetTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Check if merchant is logged in
    const merchantId = localStorage.getItem('merchantId')
    setIsMerchantLoggedIn(!!merchantId)
    
    startCamera()
    
    return () => {
      stopCamera()
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current)
      }
    }
  }, [])

  // Auto-reset after success or error
  useEffect(() => {
    if (scanStatus === 'success' || scanStatus === 'error') {
      resetTimeoutRef.current = setTimeout(() => {
        resetScan()
      }, 3000)
    }
  }, [scanStatus])

  const startCamera = async () => {
    try {
      if (!readerRef.current) {
        readerRef.current = new BrowserQRCodeReader()
      }

      if (videoRef.current) {
        await readerRef.current.decodeFromVideoDevice(
          undefined, // Use default camera
          videoRef.current,
          (result, error) => {
            if (result && scanStatus === 'ready') {
              const code = result.getText()
              processCode(code)
            }
          }
        )
        setCameraStarted(true)
        setScanStatus('ready')
      }
    } catch (error) {
      console.error('Camera error:', error)
      setScanStatus('error')
      setScanResult({ message: '카메라 접근 오류' })
    }
  }

  const stopCamera = () => {
    if (readerRef.current && typeof readerRef.current.stopContinuousDecode === 'function') {
      readerRef.current.stopContinuousDecode()
    } else if (readerRef.current && typeof readerRef.current.stop === 'function') {
      readerRef.current.stop()
    }
    setCameraStarted(false)
  }

  const resetScan = () => {
    setScanStatus('ready')
    setScanResult(null)
    setManualCode('')
    if (!cameraStarted) {
      startCamera()
    }
  }

  const processCode = async (code: string) => {
    // Validate code format (6 characters)
    const cleanCode = code.trim().toUpperCase()
    if (!cleanCode || cleanCode.length !== 6) {
      setScanStatus('error')
      setScanResult({ message: '유효하지 않은 코드 형식입니다' })
      return
    }

    setScanStatus('processing')

    try {
      const response = await fetch('/api/merchants/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ claimCode: cleanCode }),
      })

      const data = await response.json()

      if (data.success) {
        setScanStatus('success')
        setScanResult({
          message: '사용 완료!',
          dealTitle: data.deal?.title
        })
      } else {
        setScanStatus('error')
        setScanResult({ 
          message: data.error || '코드 처리 실패' 
        })
      }
    } catch (error) {
      setScanStatus('error')
      setScanResult({ 
        message: '네트워크 오류가 발생했습니다' 
      })
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.length === 6) {
      processCode(manualCode)
    }
  }

  const handleCodeInput = (value: string) => {
    const alphanumericValue = value.replace(/[^A-Za-z0-9]/g, '').slice(0, 6)
    setManualCode(alphanumericValue)
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_#65BBFF_0%,_#3A82FF_25%,_#2570EA_50%,_#1857C7_100%)]">
      {/* Header */}
      <div className="text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              // Clean up camera before navigation
              stopCamera()
              // Use back navigation for better UX
              if (isMerchantLoggedIn) {
                router.push('/merchant/dashboard')
              } else {
                router.push('/')
              }
            }}
            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">QR 스캔</h1>
          <div className="w-8"></div>
        </div>
        <p className="text-center text-white/90 text-lg">
          QR 코드를 스캔하거나 코드를 입력하세요
        </p>
      </div>

      {/* Status Display */}
      {scanStatus !== 'ready' && (
        <div className={`p-8 text-center ${
          scanStatus === 'success' ? 'bg-green-100 border-b-4 border-green-500' : 
          scanStatus === 'error' ? 'bg-red-100 border-b-4 border-red-500' : 
          'bg-yellow-100 border-b-4 border-yellow-500'
        }`}>
          {scanStatus === 'processing' && (
            <div className="text-yellow-700">
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-3xl font-bold">처리 중...</p>
            </div>
          )}
          
          {scanStatus === 'success' && (
            <div className="text-green-700">
              <div className="text-8xl mb-4">✓</div>
              <p className="text-4xl font-bold mb-3">{scanResult?.message}</p>
              {scanResult?.dealTitle && (
                <p className="text-xl text-green-600">{scanResult.dealTitle}</p>
              )}
              <p className="text-lg text-green-600 mt-4">3초 후 자동으로 다음 스캔 준비됩니다</p>
            </div>
          )}
          
          {scanStatus === 'error' && (
            <div className="text-red-700">
              <div className="text-8xl mb-4">✕</div>
              <p className="text-3xl font-bold mb-3">{scanResult?.message}</p>
              <p className="text-lg text-red-600">3초 후 다시 시도해주세요</p>
            </div>
          )}
        </div>
      )}

      {/* Scanner and Input Area */}
      {scanStatus === 'ready' && (
        <div className="p-6">
          {/* QR Scanner */}
          <div className="max-w-lg mx-auto mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-center mb-4 text-gray-900">QR 코드 스캔</h2>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                {/* Scanner Overlay */}
                <div className="absolute inset-0 border-2 border-white/30 m-12 rounded-lg">
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                </div>
              </div>
              <p className="text-center text-gray-700 mt-4 text-lg font-medium">
                고객의 QR 코드를 중앙에 맞춰주세요
              </p>
            </div>
          </div>

          {/* Manual Input */}
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <form onSubmit={handleManualSubmit} className="space-y-6">
                <div>
                  <label className="block text-lg font-medium text-gray-900 mb-3 text-center">
                    6자리 코드 입력
                  </label>
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => handleCodeInput(e.target.value)}
                    placeholder="6자리 코드"
                    className="w-full px-6 py-6 text-2xl font-mono text-center border-3 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none tracking-widest bg-gray-50 text-gray-900 placeholder:text-gray-400"
                    maxLength={6}
                    autoComplete="off"
                    pattern="[A-Za-z0-9]{6}"
                  />
                  <p className="text-center text-gray-600 mt-2">
                    입력된 자릿수: {manualCode.length}/6
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={manualCode.length !== 6}
                  className={`w-full font-bold py-6 px-8 rounded-xl text-2xl transition-all duration-200 ${
                    manualCode.length === 6
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  확인
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {scanStatus === 'ready' && (
        <div className="max-w-lg mx-auto mt-8 px-6 pb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">사용 방법</h3>
            <div className="space-y-2 text-gray-700">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">1.</span>
                <span>고객이 보여주는 QR 코드를 카메라에 비춰주세요</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">2.</span>
                <span>또는 6자리 코드를 직접 입력하세요</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">3.</span>
                <span>혜택이 자동으로 처리되고 결과가 표시됩니다</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">4.</span>
                <span>3초 후 다음 고객을 위해 자동 준비됩니다</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
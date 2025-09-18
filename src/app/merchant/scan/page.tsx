'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Scanner } from '@yudiel/react-qr-scanner'

type ScanStatus = 'ready' | 'scanning' | 'processing' | 'success' | 'error'

interface ScanResult {
  message: string
  dealTitle?: string
}

export default function MerchantScanPage() {
  const router = useRouter()
  const [scanStatus, setScanStatus] = useState<ScanStatus>('ready')
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [manualCode, setManualCode] = useState('')
  const [cameraStarted, setCameraStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(true)
  const [isMerchantLoggedIn, setIsMerchantLoggedIn] = useState(false)
  const processingRef = useRef(false)
  const resetTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Check if merchant is logged in (client-side only)
    if (typeof window !== 'undefined') {
      const merchantId = localStorage.getItem('merchantId')
      setIsMerchantLoggedIn(!!merchantId)
    }
    
    return () => {
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

  const startCamera = () => {
    setCameraStarted(true)
    setIsPaused(false)
    setScanStatus('scanning')
    processingRef.current = false
  }

  const stopCamera = () => {
    setCameraStarted(false)
    setIsPaused(true)
    // Note: Don't set scanStatus to 'ready' here - let resetScan handle that
    // setScanStatus('ready')
  }

  const resetScan = () => {
    setScanStatus('ready')
    setScanResult(null)
    setManualCode('')
    processingRef.current = false
    // Don't auto-restart - require manual restart
    stopCamera()
  }

  const processCode = async (code: string) => {
    // Prevent multiple simultaneous processing
    if (processingRef.current) return
    processingRef.current = true
    
    // Immediately pause scanning
    setIsPaused(true)
    
    // Validate code format (6 characters)
    const cleanCode = code.trim().toUpperCase()
    if (!cleanCode || cleanCode.length !== 6) {
      setScanStatus('error')
      setScanResult({ message: '유효하지 않은 코드 형식입니다' })
      processingRef.current = false
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

        // Translate common English API errors to Korean
        let errorMessage = data.error
        if (errorMessage) {
          if (errorMessage.includes('Invalid, expired, or already redeemed')) {
            errorMessage = '유효하지 않거나 만료되었거나 이미 사용된 코드입니다'
          } else if (errorMessage.includes('already redeemed')) {
            errorMessage = '이미 사용된 코드입니다'
          } else if (errorMessage.includes('expired')) {
            errorMessage = '만료된 코드입니다'
          }
        }

        setScanResult({
          message: errorMessage || '코드 처리 실패'
        })
      }
    } catch (error) {
      setScanStatus('error')
      setScanResult({ 
        message: '네트워크 오류가 발생했습니다' 
      })
    } finally {
      // Note: Don't call stopCamera() here to allow success/error messages to display
      // stopCamera()
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

  const handleScan = (detectedCodes: any) => {
    // Get the first detected QR code
    if (detectedCodes && detectedCodes.length > 0) {
      const code = detectedCodes[0].rawValue
      if (code && !processingRef.current) {
        processCode(code)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_#65BBFF_0%,_#3A82FF_25%,_#2570EA_50%,_#1857C7_100%)]">
      {/* Header */}
      <div className="text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              stopCamera()
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
      {scanStatus !== 'ready' && scanStatus !== 'scanning' && (
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
      {(scanStatus === 'ready' || scanStatus === 'scanning') && (
        <div className="p-6">
          {/* QR Scanner */}
          <div className="max-w-lg mx-auto mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-center mb-4 text-gray-900">QR 코드 스캔</h2>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
                {cameraStarted ? (
                  <Scanner
                    paused={isPaused}
                    onScan={handleScan}
                    onError={(error) => console.error('Scanner error:', error)}
                    constraints={{
                      facingMode: 'environment',
                      aspectRatio: 1
                    }}
                    formats={['qr_code']}
                    styles={{
                      container: {
                        width: '100%',
                        height: '100%'
                      }
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <button
                      onClick={startCamera}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      카메라 시작
                    </button>
                  </div>
                )}
              </div>
              
              {cameraStarted && (
                <button
                  onClick={stopCamera}
                  className="w-full mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  스캔 중지
                </button>
              )}
              
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
      {(scanStatus === 'ready' || scanStatus === 'scanning') && (
        <div className="max-w-lg mx-auto mt-8 px-6 pb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">사용 방법</h3>
            <div className="space-y-2 text-gray-700">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">1.</span>
                <span>카메라 시작 버튼을 눌러 스캔을 시작하세요</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">2.</span>
                <span>고객이 보여주는 QR 코드를 카메라에 비춰주세요</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">3.</span>
                <span>또는 6자리 코드를 직접 입력하세요</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">4.</span>
                <span>혜택이 자동으로 처리되고 결과가 표시됩니다</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

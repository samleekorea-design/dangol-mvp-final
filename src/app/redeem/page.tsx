'use client'

import { useState } from 'react'

export default function RedeemPage() {
  const [claimCode, setClaimCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  const validateForm = () => {
    const newErrors: string[] = []
    
    if (!claimCode.trim()) newErrors.push('Claim code is required')
    if (claimCode.trim().length < 6) newErrors.push('Claim code must be at least 6 characters')
    
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setMessage('')

    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/merchants/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          claimCode: claimCode.trim().toUpperCase()
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('혜택이 성공적으로 사용되었습니다!')
        setClaimCode('')
      } else {
        setErrors([data.error || 'Redemption failed'])
      }
    } catch (error) {
      setErrors(['Network error. Please try again.'])
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClaimCode(e.target.value)
  }

  const handleClear = () => {
    setClaimCode('')
    setErrors([])
    setMessage('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#65BBFF] via-10% via-[#3A82FF] via-25% to-[#1E6AFF]">
      
      <div className="max-w-[375px] mx-auto px-6 py-8">
        {/* Logo - Top Left */}
        <div className="flex justify-start mb-6 w-full">
          <a href="/">
            <img 
              src="/images/logo-white.png" 
              alt="Dangol Logo" 
              className="h-8 w-auto opacity-90"
            />
          </a>
        </div>
        
        {/* Main Title - Center */}
        <div className="text-center mb-8 w-full">
          <h1 className="text-3xl font-light text-white mb-2">코드 사용</h1>
          <p className="text-sm text-white/80">고객의 혜택 코드를 입력하여 사용 처리하세요</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-6 w-full">
            <div>
              <label htmlFor="claimCode" className="block text-sm font-light text-white mb-2">
                혜택 코드 *
              </label>
              <input
                type="text"
                id="claimCode"
                name="claimCode"
                value={claimCode}
                onChange={handleChange}
                placeholder="6자리 코드 입력"
                className="w-full px-4 py-4 border-2 border-white/30 rounded-lg bg-white text-gray-900 uppercase tracking-wider text-center text-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 shadow-sm"
                required
                autoComplete="off"
                maxLength={6}
              />
              <p className="text-xs text-white/60 mt-2">코드는 자동으로 대문자로 변환됩니다</p>
            </div>

            {errors.length > 0 && (
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg p-3">
                {errors.map((error, index) => (
                  <p key={index} className="text-red-100 text-sm">{error}</p>
                ))}
              </div>
            )}

            {message && (
              <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg p-3">
                <p className="text-green-100 text-sm font-medium">{message}</p>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <button
                type="submit"
                disabled={isLoading || !claimCode.trim()}
                className="flex-1 bg-white text-blue-600 font-light py-3 px-4 rounded-lg hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-300/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
              >
                {isLoading ? '사용 처리 중...' : '코드 사용하기'}
              </button>
              
              <button
                type="button"
                onClick={handleClear}
                className="bg-white/20 text-white font-light py-3 px-4 rounded-lg hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300"
              >
                지우기
              </button>
            </div>
          </form>
        
        {/* Instructions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4 mb-6 w-full">
          <h3 className="text-sm font-light text-white mb-3">사용 방법:</h3>
          <ul className="text-xs text-white/80 space-y-2">
            <li>• 고객에게 혜택 코드를 보여달라고 요청하세요</li>
            <li>• 6자리 코드를 정확히 입력하세요</li>
            <li>• 코드는 30분 후 만료되며 대소문자를 구분하지 않습니다</li>
            <li>• 각 코드는 한 번만 사용할 수 있습니다</li>
          </ul>
        </div>

        <div className="text-center w-full">
          <a 
            href="/merchant/dashboard" 
            className="text-sm text-white hover:text-white/80 underline transition-colors duration-300"
          >
            대시보드로 돌아가기
          </a>
        </div>
      </div>
    </div>
  )
}
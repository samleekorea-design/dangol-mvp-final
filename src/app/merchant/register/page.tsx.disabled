'use client'

import { useState } from 'react'

export default function MerchantRegister() {
  const [formData, setFormData] = useState({
    businessName: '',
    address: '',
    phone: '',
    email: '',
    latitude: '',
    longitude: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationInputMethod, setLocationInputMethod] = useState<'gps' | 'manual'>('gps')

  const validateForm = () => {
    const newErrors: string[] = []
    
    if (!formData.businessName.trim()) newErrors.push('Business name is required')
    if (!formData.address.trim()) newErrors.push('Address is required')
    if (!formData.email.trim()) newErrors.push('Email is required')
    if (!formData.email.includes('@')) newErrors.push('Valid email is required')
    if (!formData.password || formData.password.length < 6) newErrors.push('Password must be at least 6 characters')
    if (!formData.confirmPassword) newErrors.push('Password confirmation is required')
    if (formData.password !== formData.confirmPassword) newErrors.push('Passwords do not match')
    if (!formData.latitude || isNaN(Number(formData.latitude))) newErrors.push('Valid latitude is required')
    if (!formData.longitude || isNaN(Number(formData.longitude))) newErrors.push('Valid longitude is required')
    
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
      const response = await fetch('/api/auth/merchant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
          password: formData.password
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('Registration successful!')
        setFormData({
          businessName: '',
          address: '',
          phone: '',
          email: '',
          latitude: '',
          longitude: '',
          password: '',
          confirmPassword: ''
        })
      } else {
        setErrors([data.error || 'Registration failed'])
      }
    } catch (error) {
      setErrors(['Network error. Please try again.'])
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const getCurrentLocation = () => {
    setIsGettingLocation(true)
    setErrors([])
    
    if (!navigator.geolocation) {
      setErrors(['GPS가 지원되지 않는 브라우저입니다.'])
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }))
        setIsGettingLocation(false)
        setMessage('현재 위치가 성공적으로 설정되었습니다.')
        setTimeout(() => setMessage(''), 3000)
      },
      (error) => {
        let errorMessage = '위치를 가져올 수 없습니다.'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '위치 접근 권한이 거부되었습니다. 브라우저 설정에서 위치 접근을 허용해주세요.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없습니다.'
            break
          case error.TIMEOUT:
            errorMessage = '위치 요청 시간이 초과되었습니다.'
            break
        }
        setErrors([errorMessage])
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
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
          <h1 className="text-3xl font-light text-white mb-2">상점 등록</h1>
          <p className="text-sm text-white/80">매장 정보를 등록하고 서비스를 시작하세요</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 w-full">
        <div>
          <label htmlFor="businessName" className="block text-sm font-light text-white mb-2">
            매장명 *
          </label>
          <input
            type="text"
            id="businessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300/60"
            placeholder="매장명을 입력하세요"
            required
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-light text-white mb-2">
            주소 *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300/60"
            placeholder="매장 주소를 입력하세요"
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-light text-white mb-2">
            전화번호
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300/60"
            placeholder="전화번호를 입력하세요"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-light text-white mb-2">
            이메일 *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300/60"
            placeholder="이메일을 입력하세요"
            required
          />
        </div>

        {/* Store Location Section */}
        <div>
          <label className="block text-sm font-light text-white mb-3">
            매장 위치 *
          </label>
          
          {/* Location Input Method Selection */}
          <div className="flex space-x-3 mb-4">
            <button
              type="button"
              onClick={() => setLocationInputMethod('gps')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                locationInputMethod === 'gps'
                  ? 'bg-white/20 text-white border-2 border-white/40'
                  : 'bg-white/5 text-white/70 border border-white/20 hover:bg-white/10'
              }`}
            >
              현재 위치 사용
            </button>
            <button
              type="button"
              onClick={() => setLocationInputMethod('manual')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                locationInputMethod === 'manual'
                  ? 'bg-white/20 text-white border-2 border-white/40'
                  : 'bg-white/5 text-white/70 border border-white/20 hover:bg-white/10'
              }`}
            >
              직접 입력
            </button>
          </div>

          {/* GPS Location Option */}
          {locationInputMethod === 'gps' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="w-full px-4 py-3 bg-blue-500/80 hover:bg-blue-500/90 disabled:bg-blue-500/50 text-white rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isGettingLocation ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m15.84 10.32l1.42 1.42A7.003 7.003 0 0 1 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7s3.13-7 7-7c1.94 0 3.7.79 4.96 2.06l1.42-1.42A8.954 8.954 0 0 0 12 3C7.03 3 3 7.03 3 12s4.03 9 9 9s9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61z"></path>
                    </svg>
                    <span>위치 가져오는 중...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>현재 위치 가져오기</span>
                  </>
                )}
              </button>
              
              {/* Display coordinates when GPS is used */}
              {formData.latitude && formData.longitude && (
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-white/70 text-sm mb-1">설정된 좌표:</p>
                  <p className="text-white text-sm font-mono">
                    위도: {parseFloat(formData.latitude).toFixed(6)}, 경도: {parseFloat(formData.longitude).toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Manual Input Option */}
          {locationInputMethod === 'manual' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="latitude" className="block text-xs font-light text-white/80 mb-1">
                  위도 *
                </label>
                <input
                  type="number"
                  step="any"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300/60"
                  placeholder="37.5665"
                  required
                />
              </div>
              <div>
                <label htmlFor="longitude" className="block text-xs font-light text-white/80 mb-1">
                  경도 *
                </label>
                <input
                  type="number"
                  step="any"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300/60"
                  placeholder="126.9780"
                  required
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-light text-white mb-2">
            비밀번호 *
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 pr-12 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300/60"
              placeholder="비밀번호를 입력하세요 (최소 6자)"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-light text-white mb-2">
            비밀번호 확인 *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 pr-12 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300/60"
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
            >
              {showConfirmPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
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
              <p className="text-green-100 text-sm">{message}</p>
            </div>
          )}

          <div className="mt-12">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-blue-600 font-light py-3 px-4 rounded-lg hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-300/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLoading ? '등록 중...' : '등록하기'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 mb-8 text-center w-full">
          <p className="text-sm text-white/80">
            이미 계정이 있으신가요?{' '}
            <a href="/merchant/login" className="text-white hover:text-white/80 underline transition-colors duration-300">
              로그인하기
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
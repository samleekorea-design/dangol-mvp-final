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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="latitude" className="block text-sm font-light text-white mb-2">
              위도 *
            </label>
            <input
              type="number"
              step="any"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300/60"
              placeholder="위도"
              required
            />
          </div>
          <div>
            <label htmlFor="longitude" className="block text-sm font-light text-white mb-2">
              경도 *
            </label>
            <input
              type="number"
              step="any"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300/60"
              placeholder="경도"
              required
            />
          </div>
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
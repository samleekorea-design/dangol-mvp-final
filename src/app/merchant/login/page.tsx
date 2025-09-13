'use client'

import { useState } from 'react'

export default function MerchantLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  const validateForm = () => {
    const newErrors: string[] = []
    
    if (!formData.email.trim()) newErrors.push('Email is required')
    if (!formData.email.includes('@')) newErrors.push('Valid email is required')
    if (!formData.password) newErrors.push('Password is required')
    
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
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('Login successful!')
        // Store merchant data in localStorage for session management
        localStorage.setItem('merchant', JSON.stringify(data.merchant))
        localStorage.setItem('merchantId', data.merchant.id.toString())
        setFormData({
          email: '',
          password: ''
        })
        // Redirect to dashboard after successful login
        setTimeout(() => {
          window.location.href = '/merchant/dashboard'
        }, 1000)
      } else {
        setErrors([data.error || 'Login failed'])
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
          <h1 className="text-3xl font-light text-white mb-2">상점 로그인</h1>
          <p className="text-sm text-white/80">고객과 연결하여 매출을 증대하세요</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 w-full">
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

          <div>
            <label htmlFor="password" className="block text-sm font-light text-white mb-2">
              비밀번호 *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300/60"
              placeholder="비밀번호를 입력하세요"
              required
            />
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-blue-600 font-light py-3 px-4 rounded-lg hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-300/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="mt-6 mb-8 text-center w-full">
          <p className="text-sm text-white/80">
            계정이 없으신가요?{' '}
            <a href="/merchant/register" className="text-white hover:text-white/80 underline transition-colors duration-300">
              회원가입하기
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
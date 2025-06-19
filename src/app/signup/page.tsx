'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserPlus, Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [step, setStep] = useState<'form' | 'verification' | 'success'>('form')
  const [verificationCode, setVerificationCode] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')

  // 비밀번호 강도 검사
  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
    
    const strength = Object.values(requirements).filter(Boolean).length
    return { requirements, strength }
  }

  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // 이메일 검사
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.'
    } else if (!formData.email.endsWith('@kentech.ac.kr')) {
      newErrors.email = 'KENTECH 이메일 주소만 사용 가능합니다. (@kentech.ac.kr)'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.'
    }

    // 기존 계정 확인
    const existingAccounts = JSON.parse(localStorage.getItem('userAccounts') || '[]')
    if (existingAccounts.some((account: any) => account.email === formData.email)) {
      newErrors.email = '이미 가입된 이메일입니다.'
    }

    // 비밀번호 검사
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.'
    } else {
      const { strength } = validatePassword(formData.password)
      if (strength < 3) {
        newErrors.password = '비밀번호가 너무 약합니다. 대문자, 소문자, 숫자, 특수문자 중 최소 3가지를 포함해주세요.'
      }
    }

    // 비밀번호 확인 검사
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 인증 코드 생성 및 전송
  const sendVerificationCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setGeneratedCode(code)
    
    // 실제로는 이메일 전송 API를 호출하겠지만, 여기서는 시뮬레이션
    console.log(`인증 코드가 ${formData.email}로 전송되었습니다: ${code}`)
    
    // 개발용: 사용자에게 코드를 보여줌
    alert(`개발 모드: 인증 코드는 "${code}" 입니다.`)
    
    setStep('verification')
  }

  // 회원가입 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (validateForm()) {
      // 인증 단계로 이동
      sendVerificationCode()
    }

    setLoading(false)
  }

  // 인증 코드 확인
  const handleVerification = () => {
    if (verificationCode.toUpperCase() === generatedCode) {
      // 계정 생성
      const existingAccounts = JSON.parse(localStorage.getItem('userAccounts') || '[]')
      const newAccount = {
        id: Date.now().toString(),
        email: formData.email,
        password: formData.password,
        createdAt: new Date().toISOString(),
        isVerified: true
      }
      
      existingAccounts.push(newAccount)
      localStorage.setItem('userAccounts', JSON.stringify(existingAccounts))
      
      setStep('success')
    } else {
      setErrors({ verification: '인증 코드가 올바르지 않습니다.' })
    }
  }

  // 인증 코드 재전송
  const resendCode = () => {
    sendVerificationCode()
    setVerificationCode('')
    setErrors({})
  }

  // 로그인으로 이동
  const goToLogin = () => {
    router.push('/login')
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 실시간 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const passwordValidation = validatePassword(formData.password)

  // 회원가입 폼
  if (step === 'form') {
    return (
      <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 min-h-screen">
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto bg-green-500 text-white p-3 rounded-full w-fit">
                <UserPlus className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                회원가입
              </CardTitle>
              <p className="text-gray-600">
                KENTECH 학생 계정을 만들어보세요
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 이메일 입력 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    이메일 주소 *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="your-id@kentech.ac.kr"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* 비밀번호 입력 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    비밀번호 *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="8자 이상, 대소문자, 숫자, 특수문자 포함"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {/* 비밀번호 강도 표시 */}
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-2 w-4 rounded-full ${
                                level <= passwordValidation.strength
                                  ? level <= 2 ? 'bg-red-400' : level <= 3 ? 'bg-yellow-400' : level <= 4 ? 'bg-blue-400' : 'bg-green-400'
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">
                          {passwordValidation.strength <= 2 && '약함'}
                          {passwordValidation.strength === 3 && '보통'}
                          {passwordValidation.strength === 4 && '강함'}
                          {passwordValidation.strength === 5 && '매우 강함'}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        {Object.entries(passwordValidation.requirements).map(([key, met]) => (
                          <div key={key} className={`text-xs flex items-center ${met ? 'text-green-600' : 'text-gray-400'}`}>
                            {met ? <CheckCircle className="h-3 w-3 mr-1" /> : <div className="h-3 w-3 mr-1 rounded-full border border-gray-300" />}
                            {key === 'length' && '8자 이상'}
                            {key === 'uppercase' && '대문자 포함'}
                            {key === 'lowercase' && '소문자 포함'}
                            {key === 'number' && '숫자 포함'}
                            {key === 'special' && '특수문자 포함'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {errors.password && (
                    <p className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* 비밀번호 확인 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    비밀번호 확인 *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="비밀번호를 다시 입력하세요"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {formData.confirmPassword && (
                    <div className={`text-xs flex items-center ${
                      formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {formData.password === formData.confirmPassword ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          비밀번호가 일치합니다
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          비밀번호가 일치하지 않습니다
                        </>
                      )}
                    </div>
                  )}
                  
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* 회원가입 버튼 */}
                <Button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      처리 중...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <UserPlus className="h-4 w-4 mr-2" />
                      회원가입
                    </div>
                  )}
                </Button>
              </form>

              {/* 로그인 링크 */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  이미 계정이 있으신가요?{' '}
                  <Link href="/login" className="text-green-500 hover:text-green-600 font-medium">
                    로그인
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // 이메일 인증 단계
  if (step === 'verification') {
    return (
      <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 min-h-screen">
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto bg-blue-500 text-white p-3 rounded-full w-fit">
                <Mail className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                이메일 인증
              </CardTitle>
              <p className="text-gray-600">
                <span className="font-medium">{formData.email}</span>로<br />
                인증 코드를 전송했습니다.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    인증 코드 *
                  </label>
                  <Input
                    type="text"
                    placeholder="6자리 인증 코드를 입력하세요"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                    className={`text-center text-lg tracking-widest ${errors.verification ? 'border-red-500' : ''}`}
                    maxLength={6}
                  />
                  {errors.verification && (
                    <p className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.verification}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleVerification}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={verificationCode.length !== 6}
                >
                  인증 확인
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    인증 코드를 받지 못하셨나요?
                  </p>
                  <Button
                    onClick={resendCode}
                    variant="outline"
                    size="sm"
                  >
                    인증 코드 재전송
                  </Button>
                </div>

                <Button
                  onClick={() => setStep('form')}
                  variant="ghost"
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  이전 단계로
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // 가입 완료 단계
  if (step === 'success') {
    return (
      <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 min-h-screen">
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto bg-green-500 text-white p-3 rounded-full w-fit">
                <CheckCircle className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                회원가입 완료!
              </CardTitle>
              <p className="text-gray-600">
                <span className="font-medium">{formData.email}</span><br />
                계정이 성공적으로 생성되었습니다.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">다음 단계</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• 로그인하여 프로필을 완성하세요</li>
                  <li>• 관심 분야와 트랙을 설정하세요</li>
                  <li>• KENTECH 커뮤니티에 참여하세요</li>
                </ul>
              </div>

              <Button
                onClick={goToLogin}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                로그인하러 가기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null
} 
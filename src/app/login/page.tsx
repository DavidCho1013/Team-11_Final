'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 하드코딩된 계정 정보 (기존 계정)
  const VALID_ACCOUNTS = [
    { email: 'whalswns1013@kentech.ac.kr', password: 'alswnsdl1013' },
    { email: 'flrud15@kentech.ac.kr', password: '12345678' },
    { email: 'sdw1013@kentech.ac.kr', password: '12345678' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // 간단한 유효성 검사
    if (!email || !password) {
      setError('아이디와 비밀번호를 모두 입력해주세요.')
      setLoading(false)
      return
    }

    // 기존 하드코딩된 계정 검증
    const validHardcodedAccount = VALID_ACCOUNTS.find(account => 
      account.email === email && account.password === password
    )
    
    // 회원가입으로 생성된 계정 검증
    const userAccounts = JSON.parse(localStorage.getItem('userAccounts') || '[]')
    const validUserAccount = userAccounts.find((account: any) => 
      account.email === email && account.password === password && account.isVerified
    )
    
    if (validHardcodedAccount || validUserAccount) {
      // 로그인 성공
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userEmail', email)
      
      // 네비게이션 바 업데이트를 위한 이벤트 발생
      window.dispatchEvent(new Event('storage'))
      
      // 메인 페이지로 리다이렉트
      router.push('/')
    } else {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.')
    }

    setLoading(false)
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 min-h-screen">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto bg-blue-500 text-white p-3 rounded-full w-fit">
              <LogIn className="h-8 w-8" />
            </div>

            <p className="text-gray-600">
              KENTECH 학생 계정으로 로그인하세요
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 이메일 입력 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  이메일 주소
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="kentech.ac.kr 이메일을 입력하세요"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* 비밀번호 입력 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* 로그인 버튼 */}
              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    로그인 중...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="h-4 w-4 mr-2" />
                    로그인
                  </div>
                )}
              </Button>
            </form>



            {/* 추가 링크들 */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                계정이 없으신가요?{' '}
                <Link href="/signup" className="text-blue-500 hover:text-blue-600 font-medium">
                  회원가입
                </Link>
              </p>
              <p className="text-xs text-gray-500">
                비밀번호를 잊으셨나요?{' '}
                <button className="text-blue-500 hover:text-blue-600">
                  비밀번호 찾기
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
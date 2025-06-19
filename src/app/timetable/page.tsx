'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Bot } from 'lucide-react'
import Link from 'next/link'

export default function TimetablePage() {
  const router = useRouter()

  useEffect(() => {
    // 로그인 상태 확인
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (isLoggedIn !== 'true') {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }
  }, [router])
  return (
    <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📅 시간표 설계</h1>
          <p className="text-gray-600">원하는 시간표 설계 방식을 선택하세요</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link href="/timetable/manual">
            <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
                <Calendar className="h-16 w-16 text-blue-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">나만의 시간표 만들기</h2>
                <p className="text-gray-600">
                  개설된 과목들을 직접 선택하여<br />
                  나만의 시간표를 자유롭게 설계해보세요
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/timetable/ai">
            <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
                <Bot className="h-16 w-16 text-purple-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">AI 시간표 만들기</h2>
                <p className="text-gray-600">
                  AI가 선호도와 시간을 분석하여<br />
                  최적의 시간표를 추천해드립니다
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
} 
'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bot, Sparkles, ArrowRight, CheckCircle, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AISettings {
  grade: string
  espLevel: string
  mnLevel: string
  credits: string
  track: string
}



export default function AITimetablePage() {
  const [settings, setSettings] = useState<AISettings>({
    grade: '',
    espLevel: '',
    mnLevel: '',
    credits: '',
    track: ''
  })
  const router = useRouter()

  const gradeOptions = ['1학년', '2학년', '3학년', '4학년']
  const espLevelOptions = [
    'Foundation 1', 
    'Foundation 2', 
    'Inter. Speaking', 
    'Inter. Writing', 
    'Advanced Speaking', 
    'Advanced Writing',
    '수료'
  ]
  const mnLevelOptions = [
    'Strategic Learning and Leadership', 
    'Systems and Society',
    '수료'
  ]
  const creditOptions = ['12-13학점', '16-17학점', '20-21학점', '24학점 이상']
  const trackOptions = [
    '수소 에너지',
    '스마트 그리드',
    '핵융합',
    '에너지 AI',
    '에너지 신소재',
    '환경·기후 기술'
  ]

  const handleSelection = (category: keyof AISettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: value
    }))
  }

  const isAllSelected = () => {
    return settings.grade && settings.espLevel && settings.mnLevel && settings.credits && settings.track
  }

  const resetSettings = () => {
    setSettings({
      grade: '',
      espLevel: '',
      mnLevel: '',
      credits: '',
      track: ''
    })
  }

  const generateTimetable = () => {
    // URL 파라미터로 설정을 전달하면서 결과 페이지로 이동
    const params = new URLSearchParams({
      grade: settings.grade,
      espLevel: settings.espLevel,
      mnLevel: settings.mnLevel,
      credits: settings.credits,
      track: settings.track
    })
    
    router.push(`/timetable/ai/result?${params.toString()}`)
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Bot className="h-12 w-12 text-purple-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">AI 시간표 만들기</h1>
          </div>
          <p className="text-gray-600 text-lg">
            몇 가지 질문에 답하면 AI가 최적의 시간표를 추천해드려요!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 왼쪽: 설정 영역 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. 학년 선택 */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">학년을 선택해주세요</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {gradeOptions.map((grade) => (
                    <button
                      key={grade}
                      onClick={() => handleSelection('grade', grade)}
                      className={`px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 border-2 ${
                        settings.grade === grade
                          ? 'bg-blue-500 text-white border-blue-500 shadow-md transform scale-105'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 2. ESP Level 선택 */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">ESP Level을 선택해주세요</h3>
                  <Badge variant="outline" className="ml-2 text-xs">English for Specific Purposes</Badge>
                </div>
                <div className="space-y-3">
                  {/* 첫 번째 줄: 4개 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {espLevelOptions.slice(0, 4).map((level) => (
                      <button
                        key={level}
                        onClick={() => handleSelection('espLevel', level)}
                        className={`px-3 py-2.5 rounded-full text-xs font-medium transition-all duration-200 border-2 ${
                          settings.espLevel === level
                            ? 'bg-green-500 text-white border-green-500 shadow-md transform scale-105'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  {/* 두 번째 줄: 3개 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {espLevelOptions.slice(4).map((level) => (
                      <button
                        key={level}
                        onClick={() => handleSelection('espLevel', level)}
                        className={`px-3 py-2.5 rounded-full text-xs font-medium transition-all duration-200 border-2 ${
                          settings.espLevel === level
                            ? 'bg-green-500 text-white border-green-500 shadow-md transform scale-105'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. MN Level 선택 */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    3
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">MN Level을 선택해주세요</h3>
                  <Badge variant="outline" className="ml-2 text-xs">Minerva Schools</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {mnLevelOptions.map((level) => (
                    <button
                      key={level}
                      onClick={() => handleSelection('mnLevel', level)}
                      className={`px-4 py-3 rounded-full font-medium transition-all duration-200 border-2 ${
                        level === 'Strategic Learning and Leadership' ? 'text-xs' : 'text-sm'
                      } ${
                        settings.mnLevel === level
                          ? 'bg-purple-500 text-white border-purple-500 shadow-md transform scale-105'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 4. 학점 설정 */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    4
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">원하는 학점을 선택해주세요</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {creditOptions.map((credit) => (
                    <button
                      key={credit}
                      onClick={() => handleSelection('credits', credit)}
                      className={`px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 border-2 ${
                        settings.credits === credit
                          ? 'bg-orange-500 text-white border-orange-500 shadow-md transform scale-105'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      {credit}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 5. 트랙 선택 */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    5
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">트랙을 선택해주세요</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {trackOptions.map((track) => (
                    <button
                      key={track}
                      onClick={() => handleSelection('track', track)}
                      className={`px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 border-2 ${
                        settings.track === track
                          ? 'bg-pink-500 text-white border-pink-500 shadow-md transform scale-105'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                      }`}
                    >
                      {track}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽: 선택 사항 요약 */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm sticky top-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Sparkles className="h-6 w-6 text-purple-600 mr-2" />
                    <h3 className="text-xl font-bold text-gray-900">선택 현황</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetSettings}
                    className="text-xs"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    초기화
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* 학년 */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">학년</span>
                    <div className="flex items-center">
                      {settings.grade ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm font-semibold text-gray-900">{settings.grade}</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">미선택</span>
                      )}
                    </div>
                  </div>

                  {/* ESP Level */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">ESP Level</span>
                    <div className="flex items-center">
                      {settings.espLevel ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm font-semibold text-gray-900">{settings.espLevel}</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">미선택</span>
                      )}
                    </div>
                  </div>

                  {/* MN Level */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">MN Level</span>
                    <div className="flex items-center">
                      {settings.mnLevel ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm font-semibold text-gray-900">{settings.mnLevel}</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">미선택</span>
                      )}
                    </div>
                  </div>

                  {/* 학점 */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">학점</span>
                    <div className="flex items-center">
                      {settings.credits ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm font-semibold text-gray-900">{settings.credits}</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">미선택</span>
                      )}
                    </div>
                  </div>

                  {/* 트랙 */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">트랙</span>
                    <div className="flex items-center">
                      {settings.track ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm font-semibold text-gray-900">{settings.track}</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">미선택</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI 시간표 생성 버튼 */}
                <Button
                  onClick={generateTimetable}
                  disabled={!isAllSelected()}
                  className={`w-full mt-6 py-3 text-base font-semibold transition-all duration-200 ${
                    isAllSelected()
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Bot className="h-5 w-5 mr-2" />
                  AI 시간표 생성하기
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>

                {!isAllSelected() && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    모든 항목을 선택해주세요 (5개)
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>


      </div>
    </div>
  )
} 
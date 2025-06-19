'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Search, Star, Users, BookOpen, GraduationCap, Target, Zap, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Target className="h-8 w-8 text-blue-600" />,
      title: "맞춤형 필터링",
      description: "학년, 전공, 영어/Minerva 레벨에 따른 스마트 과목 추천"
    },
    {
      icon: <Calendar className="h-8 w-8 text-green-600" />,
      title: "자동 시간표 생성",
      description: "시간 충돌 없는 최적의 시간표를 자동으로 생성"
    },
    {
      icon: <Star className="h-8 w-8 text-yellow-600" />,
      title: "과목 리뷰",
      description: "학생들의 생생한 수강 후기와 평점 시스템"
    },
    {
      icon: <BookOpen className="h-8 w-8 text-purple-600" />,
      title: "상세 정보",
      description: "교수, 강의실, 선수과목 등 모든 과목 정보 제공"
    }
  ]

  const stats = [
    { number: "6", label: "전공 분야", color: "text-blue-600" },
    { number: "100+", label: "개설 과목", color: "text-green-600" },
    { number: "24/7", label: "언제든 접근", color: "text-purple-600" },
    { number: "0", label: "로그인 필요", color: "text-orange-600" }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 mt-12">
            KENTECH 학생을 위한
            <br />
            <span className="text-blue-500">
              맞춤형 시간표 설계
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            에너지 특성화 대학 KENTECH의 모든 학부생을 위한 스마트한 시간표 솔루션입니다. 
            <br />
            학년과 레벨에 맞는 과목을 찾고, 충돌 없는 완벽한 시간표를 만들어보세요.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/timetable">
              <div className="bg-blue-500/80 backdrop-blur-sm text-white px-8 py-4 text-lg rounded-full hover:bg-blue-600/80 transition-all duration-300 cursor-pointer flex items-center shadow-lg">
                <Calendar className="h-5 w-5 mr-2" />
                시간표 만들기
                <ArrowRight className="h-5 w-5 ml-2" />
              </div>
            </Link>
            <Link href="/courses">
              <div className="bg-white/80 backdrop-blur-sm text-blue-600 px-8 py-4 text-lg rounded-full hover:bg-white/90 transition-all duration-300 cursor-pointer flex items-center shadow-lg">
                <Search className="h-5 w-5 mr-2" />
                과목 둘러보기
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-4xl md:text-5xl font-bold ${stat.color} mb-2`}>
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              WHY KENTA?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              복잡한 시간표 작성과 과목 선택의 고민을 해결하는 똑똑한 솔루션
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardHeader className="text-center pb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-2xl mb-4 mx-auto">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              간단한 3단계로 완성
            </h2>
            <p className="text-xl text-gray-600">
              복잡한 시간표 작성이 이제는 쉬워집니다
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-2xl font-bold mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">조건 설정</h3>
              <p className="text-gray-600">
                학년, 전공 바탕으로 나에게 맞는 과목을 필터링
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full text-2xl font-bold mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">과목 선택</h3>
              <p className="text-gray-600">
                원하는 과목들을 선택하고 상세 정보와 리뷰를 확인
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full text-2xl font-bold mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">자동 생성</h3>
              <p className="text-gray-600">
                AI가 시간 충돌을 방지하고 최적의 시간표를 자동 생성
              </p>
            </div>
          </div>
        </div>
      </section>


    </div>
  )
}

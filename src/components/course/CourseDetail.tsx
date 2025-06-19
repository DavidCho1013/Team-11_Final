'use client'

import React, { useState } from 'react'
import { Course } from '@/types/course'
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Star, Clock, MapPin, User, BookOpen, Calendar, Heart } from 'lucide-react'

interface CourseDetailProps {
  course: Course
  onClose: () => void
}

const MAJOR_LABELS = {
  'materials': '에너지 소재',
  'systems': '에너지 시스템',
  'environmental': '환경공학',
  'policy': '에너지 정책',
  'ai': 'AI 에너지'
}

const LEVEL_LABELS = {
  'basic': '기초',
  'intermediate': '중급',
  'advanced': '고급'
}

const DAY_LABELS = {
  'monday': '월',
  'tuesday': '화',
  'wednesday': '수',
  'thursday': '목',
  'friday': '금',
  'saturday': '토',
  'sunday': '일'
}

// 샘플 리뷰 데이터
const sampleReviews = [
  {
    id: '1',
    rating: 5,
    comment: '교수님이 정말 친절하시고 강의 내용도 알차요. 실습 위주의 수업이라 이해하기 쉽습니다.',
    semester: '2024-1',
    helpful: 12,
    anonymous: true,
    createdAt: new Date('2024-06-15')
  },
  {
    id: '2',
    rating: 4,
    comment: '과제가 조금 많은 편이지만 확실히 실력이 늘어나는 느낌입니다. 추천해요!',
    semester: '2024-1',
    helpful: 8,
    anonymous: true,
    createdAt: new Date('2024-06-10')
  }
]

export default function CourseDetail({ course, onClose }: CourseDetailProps) {
  const [isFavorite, setIsFavorite] = useState(course.isFavorite)
  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info')

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  return (
    <>
      <DialogHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
              {course.name}
            </DialogTitle>
            <DialogDescription className="text-base">
              {course.code} • {course.professor} • {course.credit}학점
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFavorite}
            className={isFavorite ? 'text-red-500' : 'text-gray-400'}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </DialogHeader>

      <div className="space-y-6">
        {/* 기본 정보 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-500">전공 분야</div>
            <Badge className="mt-1">
              {MAJOR_LABELS[course.major as keyof typeof MAJOR_LABELS]}
            </Badge>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">수강 학년</div>
            <div className="font-medium mt-1">
              {course.grade.join(', ')}학년
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">영어 레벨</div>
            <div className="font-medium mt-1">
              {LEVEL_LABELS[course.englishLevel as keyof typeof LEVEL_LABELS]}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Minerva</div>
            <div className="font-medium mt-1">
              {LEVEL_LABELS[course.minervaLevel as keyof typeof LEVEL_LABELS]}
            </div>
          </div>
        </div>

        {/* 평점 */}
        <div className="flex items-center justify-center space-x-4 py-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span className="text-2xl font-bold text-gray-900">{course.rating}</span>
            </div>
            <div className="text-sm text-gray-500">{course.reviewCount}개 리뷰</div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              과목 정보
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              수강 후기
            </button>
          </nav>
        </div>

        {/* 탭 콘텐츠 */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* 과목 설명 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                과목 설명
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {course.description}
              </p>
            </div>

            {/* 수업 시간 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                수업 시간
              </h4>
              <div className="space-y-2">
                {course.schedule.map((schedule, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">
                        {DAY_LABELS[schedule.day as keyof typeof DAY_LABELS]}요일
                      </span>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {schedule.room}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 선수 과목 */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">선수 과목</h4>
                                 <div className="flex flex-wrap gap-2">
                   {course.prerequisites.map((prereq, index) => (
                     <Badge key={index}>
                       {prereq}
                     </Badge>
                   ))}
                 </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {sampleReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">{review.semester}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      도움됨 {review.helpful}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {review.comment}
                  </p>
                </CardContent>
              </Card>
            ))}
            
            {sampleReviews.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                아직 작성된 후기가 없습니다.
              </div>
            )}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex space-x-3 pt-4 border-t">
          <Button 
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            시간표에 추가
          </Button>
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </>
  )
} 
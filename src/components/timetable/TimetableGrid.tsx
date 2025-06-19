'use client'

import React from 'react'
import { Course } from '@/types/course'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin } from 'lucide-react'

interface TimetableGridProps {
  courses: Course[]
}

const DAYS = ['월', '화', '수', '목', '금']
const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
]

const DAY_MAP = {
  'monday': 0,
  'tuesday': 1,
  'wednesday': 2,
  'thursday': 3,
  'friday': 4,
  'saturday': 5,
  'sunday': 6
}

const MAJOR_COLORS = {
  'materials': 'bg-blue-100 border-blue-300 text-blue-800',
  'systems': 'bg-green-100 border-green-300 text-green-800',
  'environmental': 'bg-cyan-100 border-cyan-300 text-cyan-800',
  'policy': 'bg-purple-100 border-purple-300 text-purple-800',
  'ai': 'bg-orange-100 border-orange-300 text-orange-800'
}

export default function TimetableGrid({ courses }: TimetableGridProps) {
  // 시간을 30분 단위 인덱스로 변환
  const timeToIndex = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const baseIndex = (hours - 9) * 2
    return baseIndex + (minutes >= 30 ? 1 : 0)
  }

  // 시간표 그리드 데이터 생성
  const timetableData: (Course | null)[][][] = Array(DAYS.length)
    .fill(null)
    .map(() => Array(TIME_SLOTS.length).fill(null).map(() => []))

  // 과목을 그리드에 배치
  courses.forEach(course => {
    course.schedule.forEach(schedule => {
      const dayIndex = DAY_MAP[schedule.day as keyof typeof DAY_MAP]
      if (dayIndex < DAYS.length) {
        const startIndex = timeToIndex(schedule.startTime)
        const endIndex = timeToIndex(schedule.endTime)
        
        for (let i = startIndex; i < endIndex && i < TIME_SLOTS.length; i++) {
          if (timetableData[dayIndex][i]) {
            timetableData[dayIndex][i].push(course)
          }
        }
      }
    })
  })

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        {/* 헤더 */}
        <div className="grid grid-cols-6 gap-px bg-gray-200 mb-2">
          <div className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700">
            시간
          </div>
          {DAYS.map(day => (
            <div key={day} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700">
              {day}요일
            </div>
          ))}
        </div>

        {/* 시간표 그리드 */}
        <div className="space-y-px bg-gray-200">
          {TIME_SLOTS.map((time, timeIndex) => (
            <div key={time} className="grid grid-cols-6 gap-px">
              {/* 시간 열 */}
              <div className="bg-white p-2 text-xs text-gray-600 text-center flex items-center justify-center">
                {time}
              </div>
              
              {/* 요일별 열 */}
              {DAYS.map((day, dayIndex) => {
                const coursesInSlot = timetableData[dayIndex][timeIndex]
                
                return (
                  <div key={`${day}-${time}`} className="bg-white p-1 min-h-[60px] relative">
                    {coursesInSlot.map((course, courseIndex) => (
                      <div
                        key={`${course.id}-${courseIndex}`}
                        className={`
                          absolute inset-1 rounded-md border-2 p-2 
                          ${MAJOR_COLORS[course.major as keyof typeof MAJOR_COLORS]}
                          hover:shadow-md transition-shadow cursor-pointer
                        `}
                        style={{
                          zIndex: courseIndex + 1
                        }}
                      >
                        <div className="text-xs font-medium mb-1 truncate">
                          {course.name}
                        </div>
                        <div className="text-xs text-gray-600 mb-1 truncate">
                          {course.code}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          {course.schedule.find(s => DAY_MAP[s.day as keyof typeof DAY_MAP] === dayIndex)?.room}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* 범례 */}
        <div className="mt-6 flex flex-wrap gap-4">
          {Object.entries(MAJOR_COLORS).map(([major, colorClass]) => {
            const majorLabels = {
              'materials': '에너지 소재',
              'systems': '에너지 시스템', 
              'environmental': '환경공학',
              'policy': '에너지 정책',
              'ai': 'AI 에너지'
            }
            
            return (
              <div key={major} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded border-2 ${colorClass}`} />
                <span className="text-sm text-gray-600">
                  {majorLabels[major as keyof typeof majorLabels]}
                </span>
              </div>
            )
          })}
        </div>

        {/* 요약 정보 */}
        {courses.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {courses.length}
                  </div>
                  <div className="text-sm text-gray-600">과목 수</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {courses.reduce((sum, course) => sum + course.credit, 0)}
                  </div>
                  <div className="text-sm text-gray-600">총 학점</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {courses.reduce((sum, course) => sum + course.schedule.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">총 수업 시간</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {(courses.reduce((sum, course) => sum + course.rating, 0) / courses.length).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">평균 평점</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 
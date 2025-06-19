'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar, ArrowLeft, Save, Clock, User, MapPin } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
// AI 시간표용 그리드 컴포넌트
const AITimetableGrid = ({ timeSlots }: { timeSlots: TimeSlot[] }) => {
  const DAYS = ['월', '화', '수', '목', '금']
  const TIME_SLOTS = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ]

  // 시간표 그리드 데이터 생성
  const grid: TimeSlot[][][] = DAYS.map(() => TIME_SLOTS.map(() => []))

  // TimeSlot을 그리드에 배치
  timeSlots.forEach(slot => {
    const dayIndex = DAYS.indexOf(slot.day)
    if (dayIndex === -1) return

    const startHour = parseInt(slot.startTime.split(':')[0])
    const startMin = parseInt(slot.startTime.split(':')[1])
    const endHour = parseInt(slot.endTime.split(':')[0])
    const endMin = parseInt(slot.endTime.split(':')[1])

    const startIndex = (startHour - 9) * 2 + (startMin >= 30 ? 1 : 0)
    const endIndex = (endHour - 9) * 2 + (endMin >= 30 ? 1 : 0)

    for (let i = Math.max(0, startIndex); i < Math.min(TIME_SLOTS.length, endIndex); i++) {
      grid[dayIndex][i].push(slot)
    }
  })

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        {/* 헤더 */}
        <div className="grid grid-cols-6 gap-px bg-gray-200 mb-2">
          <div className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700">시간</div>
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
                const slotsInCell = grid[dayIndex][timeIndex]
                
                return (
                  <div key={`${day}-${time}`} className="bg-white p-1 min-h-[60px] relative">
                    {slotsInCell.map((slot, slotIndex) => (
                      <div
                        key={`${slot.courseName}-${slotIndex}`}
                        className="absolute inset-1 rounded-md border-2 p-2 hover:shadow-md transition-shadow cursor-pointer"
                        style={{
                          backgroundColor: slot.color + '20',
                          borderColor: slot.color,
                          zIndex: slotIndex + 1
                        }}
                      >
                        <div className="text-xs font-medium mb-1 text-gray-900 break-words">
                          {slot.courseName.length > 15 ? slot.courseName.substring(0, 15) + '...' : slot.courseName}
                        </div>
                        {slot.location && (
                          <div className="flex items-center text-xs text-gray-600">
                            <MapPin className="h-3 w-3 mr-1" />
                            {slot.location}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface Course {
  [key: string]: string
}

interface GeneratedTimetable {
  id: number
  name: string
  courses: Course[]
  totalCredits: number
  benefits: string[]
}

interface TimeSlot {
  day: string
  startTime: string
  endTime: string
  courseName: string
  location?: string
  professor?: string
  color?: string
}

export default function AITimetableDetailPage() {
  const [timetable, setTimetable] = useState<GeneratedTimetable | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [timetableName, setTimetableName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    try {
      const savedTimetable = localStorage.getItem('selectedAITimetable')
      if (savedTimetable) {
        const timetableData: GeneratedTimetable = JSON.parse(savedTimetable)
        setTimetable(timetableData)
        setTimetableName(`${timetableData.name} - 저장본`)
        
        const slots = convertToTimeSlots(timetableData.courses)
        setTimeSlots(slots)
      }
    } catch (error) {
      console.error('시간표 데이터 로드 오류:', error)
      // 오류 발생 시 localStorage 클리어
      localStorage.removeItem('selectedAITimetable')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getCourseInfo = (course: Course) => {
    const courseKeys = Object.keys(course)
    return {
      name: courseKeys[2] ? course[courseKeys[2]] : '',
      code: courseKeys[1] ? course[courseKeys[1]] : '',
      professor: courseKeys[5] ? course[courseKeys[5]] : '',
      time: courseKeys[7] ? course[courseKeys[7]] : '',
      location: courseKeys[6] ? course[courseKeys[6]] : '',
      area: courseKeys[4] ? course[courseKeys[4]] : '',
      credits: courseKeys[8] ? parseInt(course[courseKeys[8]]) || 0 : 0
    }
  }

  const convertToTimeSlots = (courses: Course[]): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ]

    courses.forEach((course, index) => {
      const courseInfo = getCourseInfo(course)
      if (courseInfo.time && courseInfo.time !== '시간 미정') {
        const parsedTimes = parseTimeString(courseInfo.time)
        parsedTimes.forEach(timeSlot => {
          slots.push({
            ...timeSlot,
            courseName: courseInfo.name,
            location: courseInfo.location,
            professor: courseInfo.professor,
            color: colors[index % colors.length]
          })
        })
      }
    })

    return slots
  }

  const parseTimeString = (timeString: string): Omit<TimeSlot, 'courseName' | 'location' | 'professor' | 'color'>[] => {
    const slots: Omit<TimeSlot, 'courseName' | 'location' | 'professor' | 'color'>[] = []
    
    try {
      const dayParts = timeString.split('/')?.map(part => part.trim())
      
      dayParts?.forEach(dayPart => {
        const dayMatch = dayPart.match(/(월|화|수|목|금|토|일)/)
        const timeMatch = dayPart.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/)
        
        if (dayMatch && timeMatch) {
          const day = dayMatch[1]
          const startHour = parseInt(timeMatch[1])
          const startMin = parseInt(timeMatch[2])
          const endHour = parseInt(timeMatch[3])
          const endMin = parseInt(timeMatch[4])
          
          const startTime = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`
          const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`
          
          slots.push({
            day,
            startTime,
            endTime
          })
        }
      })
    } catch (error) {
      console.error('Time parsing error:', error)
    }
    
    return slots
  }

  const handleSaveTimetable = () => {
    if (!timetable || !timetableName.trim()) {
      alert('시간표 이름을 입력해주세요.')
      return
    }

    const totalCredits = timetable.courses.reduce((sum, course) => {
      const courseInfo = getCourseInfo(course)
      return sum + courseInfo.credits
    }, 0)

    if (totalCredits < 10) {
      alert('최소 학점은 10학점입니다.')
      return
    }
    if (totalCredits > 23) {
      alert('최대 학점은 23학점입니다.')
      return
    }

    try {
      const savedTimetables = JSON.parse(localStorage.getItem('savedTimetables') || '[]')
      
      const newTimetable = {
        id: Date.now(),
        name: timetableName,
        courses: timetable.courses,
        totalCredits: totalCredits,
        createdAt: new Date().toISOString(),
        timeSlots: timeSlots,
        semester: '2025-1학기'
      }
      
      savedTimetables.push(newTimetable)
      localStorage.setItem('savedTimetables', JSON.stringify(savedTimetables))
    } catch (error) {
      console.error('시간표 저장 오류:', error)
      alert('시간표 저장 중 오류가 발생했습니다.')
      return
    }
    
    setShowSaveDialog(false)
    alert('시간표가 저장되었습니다!')
    
    router.push('/mypage')
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">시간표를 불러오고 있습니다...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!timetable) {
    return (
      <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">시간표를 찾을 수 없습니다</h3>
            <p className="text-gray-500 mb-4">다시 시간표를 생성해주세요.</p>
            <Link href="/timetable/ai">
              <Button variant="outline">AI 시간표 만들기</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">{timetable.name}</h1>
            </div>
            <div className="flex gap-3">
              <Link href="/timetable/ai/result">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  목록으로
                </Button>
              </Link>
              <Button 
                onClick={() => setShowSaveDialog(true)}
                className="bg-purple-600 hover:bg-purple-700"
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                시간표 저장
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <Badge className="bg-purple-100 text-purple-800">
              총 {timetable.totalCredits}학점
            </Badge>
            <Badge variant="outline">
              {timetable.courses.length}과목
            </Badge>
          </div>

          {timetable.benefits && timetable.benefits.length > 0 && (
            <div className="flex gap-2 mb-6">
              {timetable.benefits.map((benefit, index) => (
                <div key={index} className="bg-blue-50 text-blue-800 text-sm px-4 py-2 rounded-full font-medium">
                  {benefit}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">시간표</h3>
                <AITimetableGrid timeSlots={timeSlots} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">수강 과목</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {timetable.courses.map((course, index) => {
                    const courseInfo = getCourseInfo(course)
                    return (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-sm text-gray-900 mb-2">
                          {courseInfo.name}
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-center">
                            <span className="font-medium">과목코드:</span>
                            <span className="ml-2">{courseInfo.code}</span>
                          </div>
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            <span>{courseInfo.professor}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{courseInfo.time || '시간 미정'}</span>
                          </div>
                          {courseInfo.location && (
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{courseInfo.location}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="outline" className="text-xs">
                              {courseInfo.area}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {courseInfo.credits}학점
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>시간표 저장</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700">시간표 이름</label>
                <Input
                  value={timetableName}
                  onChange={(e) => setTimetableName(e.target.value)}
                  placeholder="시간표 이름을 입력하세요"
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  취소
                </Button>
                <Button onClick={handleSaveTimetable}>
                  저장
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
 
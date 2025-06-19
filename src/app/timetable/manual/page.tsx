'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Star, User, Clock, Search, Plus, X, Save } from 'lucide-react'

interface Course {
  [key: string]: string
}

interface TimeSlot {
  day: string
  startTime: string
  endTime: string
  course: Course
}

const DAYS = ['월', '화', '수', '목', '금']
const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', 
  '18:00', '18:30', '19:00'
]

export default function ManualTimetablePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [favoriteCourses, setFavoriteCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArea, setSelectedArea] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [selectedTrack, setSelectedTrack] = useState<string>('all')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [timetableName, setTimetableName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const tracks = [
    '에너지 AI',
    '에너지 신소재', 
    '핵융합',
    '수소 에너지',
    '환경·기후 기술',
    '스마트 그리드'
  ]

  useEffect(() => {
    fetchCourses()
    loadFavorites()
  }, [])

  useEffect(() => {
    filterCourses()
  }, [courses, searchQuery, selectedArea, selectedYear, selectedTrack])

  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem('favoriteCourses')
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)))
    }
  }

  const loadFavoriteCourses = (allCourses: Course[]) => {
    const savedFavorites = localStorage.getItem('favoriteCourses')
    if (savedFavorites) {
      const favoriteIds = JSON.parse(savedFavorites)
      const filteredFavorites = allCourses.filter((course: Course) => {
        const courseKeys = Object.keys(course)
        const courseId = `${courseKeys[1] ? course[courseKeys[1]] : ''}-${courseKeys[3] ? course[courseKeys[3]] : ''}`
        return favoriteIds.includes(courseId)
      })
      setFavoriteCourses(filteredFavorites)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.courses && Array.isArray(data.courses)) {
        setCourses(data.courses)
        loadFavoriteCourses(data.courses)
      }
    } catch (error) {
      console.error('과목 데이터 로드 중 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCourses = () => {
    let filtered = courses

    // 검색어 필터링
    if (searchQuery.trim()) {
      filtered = filtered.filter(course => {
        const courseKeys = Object.keys(course)
        const courseName = courseKeys[2] ? course[courseKeys[2]].toLowerCase() : ''
        const courseCode = courseKeys[1] ? course[courseKeys[1]].toLowerCase() : ''
        const professor = courseKeys[5] ? course[courseKeys[5]].toLowerCase() : ''
        const searchLower = searchQuery.toLowerCase()
        
        return courseName.includes(searchLower) || 
               courseCode.includes(searchLower) || 
               professor.includes(searchLower)
      })
    }

    // 영역 구분 필터링
    if (selectedArea !== 'all') {
      filtered = filtered.filter(course => {
        const courseKeys = Object.keys(course)
        const area = courseKeys[4] ? course[courseKeys[4]] : ''
        return area === selectedArea
      })
    }

    // 수강학년 필터링
    if (selectedYear !== 'all') {
      filtered = filtered.filter(course => {
        const courseKeys = Object.keys(course)
        const year = courseKeys[0] ? course[courseKeys[0]] : ''
        return year === selectedYear
      })
    }

    // 트랙 필터링
    if (selectedTrack !== 'all') {
      filtered = filtered.filter(course => {
        const values = Object.values(course).join(' ')
        return values.includes(selectedTrack)
      })
    }

    setFilteredCourses(filtered)
    setShowSearchResults(searchQuery.trim() !== '' || selectedArea !== 'all' || selectedYear !== 'all' || selectedTrack !== 'all')
  }

  const getUniqueValues = (keyIndex: number) => {
    const values = new Set<string>()
    courses.forEach(course => {
      const courseKeys = Object.keys(course)
      if (courseKeys[keyIndex] && course[courseKeys[keyIndex]]) {
        values.add(course[courseKeys[keyIndex]])
      }
    })
    return Array.from(values).sort()
  }

  const checkTimeConflictForCourse = (newCourse: Course): boolean => {
    const courseKeys = Object.keys(newCourse)
    const newTimeString = courseKeys[7] ? newCourse[courseKeys[7]] : ''
    const newTimeSlots = parseTimeString(newTimeString)
    
    const existingTimeSlots = getSelectedCourseTimeSlots()
    
    for (const newSlot of newTimeSlots) {
      for (const existingSlot of existingTimeSlots) {
        if (newSlot.day === existingSlot.day) {
          const newStart = parseInt(newSlot.startTime.replace(':', ''))
          const newEnd = parseInt(newSlot.endTime.replace(':', ''))
          const existingStart = parseInt(existingSlot.startTime.replace(':', ''))
          const existingEnd = parseInt(existingSlot.endTime.replace(':', ''))
          
          // 시간 겹침 체크
          if ((newStart < existingEnd && newEnd > existingStart)) {
            return true
          }
        }
      }
    }
    return false
  }

  const addCourseToTimetable = (course: Course) => {
    const courseId = getCourseId(course)
    const courseKeys = Object.keys(course)
    const courseName = courseKeys[2] ? course[courseKeys[2]] : ''
    
    // 이미 선택된 과목인지 체크
    if (selectedCourses.has(courseId)) {
      alert('이미 선택된 과목입니다.')
      return
    }
    
    // 시간 중복 체크
    if (checkTimeConflictForCourse(course)) {
      alert('해당 시간에 다른 수업이 존재합니다.')
      return
    }
    
    const newSelected = new Set(selectedCourses)
    newSelected.add(courseId)
    setSelectedCourses(newSelected)
  }

  const removeCourseFromTimetable = (courseId: string) => {
    const newSelected = new Set(selectedCourses)
    newSelected.delete(courseId)
    setSelectedCourses(newSelected)
  }

  const toggleCourse = (courseId: string) => {
    const newSelected = new Set(selectedCourses)
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId)
    } else {
      newSelected.add(courseId)
    }
    setSelectedCourses(newSelected)
  }

  const getCourseId = (course: Course) => {
    const courseKeys = Object.keys(course)
    return `${courseKeys[1] ? course[courseKeys[1]] : ''}-${courseKeys[3] ? course[courseKeys[3]] : ''}`
  }

  const parseTimeString = (timeString: string): TimeSlot[] => {
    if (!timeString || timeString === '-') return []
    
    const slots: TimeSlot[] = []
    
    // 여러 시간대를 슬래시(/) 또는 쉼표(,)로 구분하여 처리
    const parts = timeString.split(/[,/]/).map(p => p.trim()).filter(p => p.length > 0)
    
    parts.forEach(part => {
      // 다양한 형태의 시간 문자열 매칭
      // 예: "화요일 11:00-13:00", "금요일 11:00-13:00", "화목 13:00-15:00"
      const patterns = [
        /([월화수목금토일]+)요일\s*(\d{1,2}):(\d{2})[-~](\d{1,2}):(\d{2})/,
        /([월화수목금토일]+)\s*(\d{1,2}):(\d{2})[-~](\d{1,2}):(\d{2})/
      ]
      
      let match = null
      for (const pattern of patterns) {
        match = part.match(pattern)
        if (match) break
      }
      
      if (match) {
        const [, dayStr, startHour, startMin, endHour, endMin] = match
        const startTime = `${startHour.padStart(2, '0')}:${startMin}`
        const endTime = `${endHour.padStart(2, '0')}:${endMin}`
        
                // 각 요일 문자를 개별적으로 처리
        for (const day of dayStr) {
          if (DAYS.includes(day)) {
            slots.push({
              day,
              startTime,
              endTime,
              course: {} // 여기서는 빈 객체로 초기화, 나중에 실제 course 객체로 대체
            })
          }
        }
      }
    })
    
    return slots
  }

  const getCourseFromTimeSlot = (timeSlot: string): Course => {
    return courses.find(course => {
      const courseKeys = Object.keys(course)
      const courseId = getCourseId(course)
      return selectedCourses.has(courseId) && courseKeys[7] && course[courseKeys[7]].includes(timeSlot.split(' ')[0])
    }) || {}
  }

  const getSelectedCourseTimeSlots = (): TimeSlot[] => {
    const allSlots: TimeSlot[] = []
    
    courses.forEach(course => {
      const courseKeys = Object.keys(course)
      const courseId = getCourseId(course)
      
      if (selectedCourses.has(courseId)) {
        const timeString = courseKeys[7] ? course[courseKeys[7]] : ''
        const slots = parseTimeString(timeString)
        slots.forEach(slot => {
          slot.course = course
        })
        allSlots.push(...slots)
      }
    })
    
    return allSlots
  }

  const getTimeSlotHeight = (startTime: string, endTime: string): number => {
    const start = TIME_SLOTS.indexOf(startTime)
    const end = TIME_SLOTS.indexOf(endTime)
    if (start === -1 || end === -1) return 1
    return end - start
  }

  const getTimeSlotPosition = (startTime: string): number => {
    const index = TIME_SLOTS.indexOf(startTime)
    return index === -1 ? 0 : index
  }

  const getColorByArea = (area: string): string => {
    const areaColors: { [key: string]: string } = {
      // 기존 전공 영역들
      '교양': 'bg-gradient-to-br from-blue-100 to-blue-200 border-l-blue-500 text-blue-800',
      'EF': 'bg-gradient-to-br from-green-100 to-green-200 border-l-green-500 text-green-800',
      'MSE': 'bg-gradient-to-br from-purple-100 to-purple-200 border-l-purple-500 text-purple-800',
      'EE': 'bg-gradient-to-br from-orange-100 to-orange-200 border-l-orange-500 text-orange-800',
      'CS': 'bg-gradient-to-br from-pink-100 to-pink-200 border-l-pink-500 text-pink-800',
      'ME': 'bg-gradient-to-br from-red-100 to-red-200 border-l-red-500 text-red-800',
      'ChE': 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-l-yellow-500 text-yellow-800',
      
      // 영어/국제 관련 영역들
      'EN': 'bg-gradient-to-br from-indigo-100 to-indigo-200 border-l-indigo-500 text-indigo-800',
      'English': 'bg-gradient-to-br from-indigo-100 to-indigo-200 border-l-indigo-500 text-indigo-800',
      '영어': 'bg-gradient-to-br from-indigo-100 to-indigo-200 border-l-indigo-500 text-indigo-800',
      
      // ESP & EL 영역들 (서로 다른 색상)
      'ESP': 'bg-gradient-to-br from-rose-100 to-rose-200 border-l-rose-500 text-rose-800',
      'EL': 'bg-gradient-to-br from-cyan-100 to-cyan-200 border-l-cyan-500 text-cyan-800',
      
      // Minerva 관련
      'MN': 'bg-gradient-to-br from-teal-100 to-teal-200 border-l-teal-500 text-teal-800',
      'Minerva': 'bg-gradient-to-br from-teal-100 to-teal-200 border-l-teal-500 text-teal-800',
      '미네르바': 'bg-gradient-to-br from-teal-100 to-teal-200 border-l-teal-500 text-teal-800',
      
      // 기타 일반적인 영역들
      '전공': 'bg-gradient-to-br from-emerald-100 to-emerald-200 border-l-emerald-500 text-emerald-800',
      '선택': 'bg-gradient-to-br from-amber-100 to-amber-200 border-l-amber-500 text-amber-800',
      '필수': 'bg-gradient-to-br from-rose-100 to-rose-200 border-l-rose-500 text-rose-800',
      '실습': 'bg-gradient-to-br from-violet-100 to-violet-200 border-l-violet-500 text-violet-800',
      '이론': 'bg-gradient-to-br from-sky-100 to-sky-200 border-l-sky-500 text-sky-800',
      '세미나': 'bg-gradient-to-br from-lime-100 to-lime-200 border-l-lime-500 text-lime-800',
      
      // 기본값
      'default': 'bg-gradient-to-br from-gray-100 to-gray-200 border-l-gray-500 text-gray-800'
    }
    return areaColors[area] || areaColors['default']
  }



  const calculateTotalCredits = (): number => {
    let totalCredits = 0
    courses.forEach(course => {
      const courseKeys = Object.keys(course)
      const courseId = getCourseId(course)
      if (selectedCourses.has(courseId)) {
        const credits = courseKeys[8] ? parseInt(course[courseKeys[8]]) || 0 : 0
        totalCredits += credits
      }
    })
    return totalCredits
  }

  const handleSaveTimetable = () => {
    console.log('저장 버튼 클릭됨, 선택된 과목 수:', selectedCourses.size)
    if (selectedCourses.size === 0) {
      alert('저장할 과목이 없습니다.')
      return
    }
    
    // 총 학점 계산 및 검증
    const totalCredits = calculateTotalCredits()
    console.log('총 학점:', totalCredits)
    
    if (totalCredits <= 10) {
      alert('최소 학점은 10학점입니다.')
      return
    }
    
    if (totalCredits >= 23) {
      alert('최대 학점은 23학점입니다.')
      return
    }
    
    console.log('저장 다이얼로그 표시')
    setShowSaveDialog(true)
  }

  const handleConfirmSave = () => {
    console.log('확인 버튼 클릭됨, 시간표 이름:', timetableName)
    if (!timetableName.trim()) {
      alert('시간표 이름을 입력해주세요.')
      return
    }

    try {
      const now = new Date()
      const timetableData = {
        id: Date.now(),
        name: timetableName,
        semester: '2025-1학기',
        courses: Array.from(selectedCourses).map(courseId => {
          const course = courses.find(c => getCourseId(c) === courseId)
          return course
        }).filter(Boolean),
        totalCredits: calculateTotalCredits(),
        createdAt: now.toISOString(),
        selectedCourseIds: Array.from(selectedCourses)
      }

      console.log('저장될 시간표 데이터:', timetableData)

      // 기존 저장된 시간표들 불러오기
      const savedTimetables = JSON.parse(localStorage.getItem('savedTimetables') || '[]')
      savedTimetables.push(timetableData)
      localStorage.setItem('savedTimetables', JSON.stringify(savedTimetables))

      console.log('시간표 저장 완료')
      alert('시간표가 저장되었습니다! 나의 페이지에서 확인하실 수 있습니다.')
      setShowSaveDialog(false)
      setTimetableName('')
    } catch (error) {
      console.error('시간표 저장 중 오류:', error)
      alert('시간표 저장 중 오류가 발생했습니다.')
    }
  }

  const handleCancelSave = () => {
    setShowSaveDialog(false)
    setTimetableName('')
  }

  const renderTimetableGrid = () => {
    const timeSlots = getSelectedCourseTimeSlots()
    
    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
        {/* 헤더 */}
        <div className="grid grid-cols-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="p-4 text-sm font-semibold text-gray-700 text-center border-r border-gray-200 bg-gray-100">
            시간
          </div>
          {DAYS.map(day => (
            <div key={day} className="p-4 text-sm font-semibold text-gray-700 text-center border-r border-gray-200 last:border-r-0">
              {day}요일
            </div>
          ))}
        </div>
        
        {/* 시간표 그리드 */}
        <div className="relative bg-white">
          {TIME_SLOTS.map((time, timeIndex) => (
            <div key={time} className="grid grid-cols-6 border-b border-gray-100 last:border-b-0" style={{ height: '48px' }}>
              <div className="px-3 py-2 text-sm font-medium text-gray-600 text-center border-r border-gray-200 bg-gray-50/50 flex items-center justify-center">
                {time}
              </div>
              {DAYS.map(day => (
                <div key={`${day}-${time}`} className="border-r border-gray-100 last:border-r-0 relative hover:bg-blue-50/30 transition-colors">
                </div>
              ))}
            </div>
          ))}
          
          {/* 과목 블록들 */}
          {timeSlots.map((slot, index) => {
            const dayIndex = DAYS.indexOf(slot.day)
            const position = getTimeSlotPosition(slot.startTime)
            const height = getTimeSlotHeight(slot.startTime, slot.endTime)
            const courseKeys = Object.keys(slot.course)
            const courseName = courseKeys[2] ? slot.course[courseKeys[2]] : ''
            const professor = courseKeys[5] ? slot.course[courseKeys[5]] : ''
            const area = courseKeys[4] ? slot.course[courseKeys[4]] : 'default'
            const courseId = getCourseId(slot.course)
            
            if (dayIndex === -1 || position === -1) return null
            
            const colorClass = getColorByArea(area)
            
            return (
              <div
                key={`${courseId}-${slot.day}-${slot.startTime}-${slot.endTime}`}
                className={`absolute border-l-4 p-3 m-1 rounded-lg shadow-sm overflow-hidden ${colorClass} hover:shadow-md transition-shadow group`}
                style={{
                  left: `${(dayIndex + 1) * (100 / 6)}%`,
                  top: `${position * 48}px`,
                  width: `${100 / 6 - 1}%`,
                  height: `${height * 48 - 8}px`,
                  zIndex: 10
                }}
              >
                {/* X 버튼 */}
                <button
                  onClick={() => removeCourseFromTimetable(courseId)}
                  className="absolute top-1 right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  style={{ zIndex: 20 }}
                >
                  ×
                </button>
                
                <div className="font-semibold text-sm leading-tight mb-1">
                  {courseName.length > 10 ? `${courseName.substring(0, 10)}...` : courseName}
                </div>
                <div className="text-xs opacity-80 mb-1">
                  {area} | {professor.length > 6 ? `${professor.substring(0, 6)}...` : professor}
                </div>
                <div className="text-xs font-medium">
                  {slot.startTime}-{slot.endTime}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">과목 데이터를 불러오는 중...</p>
            </div>
          </div>

        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">📝 나만의 시간표 만들기</h1>
          <p className="text-sm text-gray-600">원하는 과목을 검색하여 시간표를 만들어보세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* 왼쪽: 검색 및 필터 */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <h2 className="text-lg font-bold text-gray-900 mb-3">📚 과목 검색</h2>
                
                {/* 검색창 */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="과목명, 과목코드, 교수명으로 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9 text-sm"
                  />
                </div>

                {/* 즐겨찾기 버튼 */}
                <div className="mb-3">
                  <Button 
                    variant={showFavorites ? "default" : "outline"}
                    onClick={() => setShowFavorites(!showFavorites)}
                    className="w-full h-8 text-xs"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    즐겨찾기 한 과목 보기 ({favoriteCourses.length}개)
                  </Button>
                </div>

                {/* 검색 결과 개수 및 필터 초기화 */}
                <div className="flex justify-between items-center mb-3 text-xs">
                  <span className="text-gray-600">
                    총 {showFavorites ? favoriteCourses.length : filteredCourses.length}개 과목
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedArea('all')
                      setSelectedYear('all')
                      setSelectedTrack('all')
                      setShowFavorites(false)
                    }}
                    className="h-6 px-2 text-xs"
                  >
                    필터 초기화
                  </Button>
                </div>

                {/* 필터 */}
                <div className="mb-3">
                  <div className="mb-3">
                    <label className="text-xs font-medium text-gray-700 mb-2 block">영역 구분</label>
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => setSelectedArea('all')}
                        className={`px-2 py-1 rounded-full text-xs transition-colors ${
                          selectedArea === 'all'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        전체
                      </button>
                      {getUniqueValues(4).map(area => (
                        <button
                          key={area}
                          onClick={() => setSelectedArea(area)}
                          className={`px-2 py-1 rounded-full text-xs transition-colors ${
                            selectedArea === area
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="text-xs font-medium text-gray-700 mb-2 block">수강학년</label>
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => setSelectedYear('all')}
                        className={`px-2 py-1 rounded-full text-xs transition-colors ${
                          selectedYear === 'all'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        전체
                      </button>
                      {getUniqueValues(0).map(year => (
                        <button
                          key={year}
                          onClick={() => setSelectedYear(year)}
                          className={`px-2 py-1 rounded-full text-xs transition-colors ${
                            selectedYear === year
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="text-xs font-medium text-gray-700 mb-2 block">트랙</label>
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => setSelectedTrack('all')}
                        className={`px-2 py-1 rounded-full text-xs transition-colors ${
                          selectedTrack === 'all'
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        전체
                      </button>
                      {tracks.map(track => (
                        <button
                          key={track}
                          onClick={() => setSelectedTrack(track)}
                          className={`px-2 py-1 rounded-full text-xs transition-colors ${
                            selectedTrack === track
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {track}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 즐겨찾기 과목 */}
            {showFavorites && (
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4">
                    ⭐ 즐겨찾기 과목 ({favoriteCourses.length}개)
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {favoriteCourses.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">즐겨찾기한 과목이 없습니다.</p>
                    ) : (
                      favoriteCourses.map((course, index) => {
                        const courseKeys = Object.keys(course)
                        const courseId = getCourseId(course)
                        const isSelected = selectedCourses.has(courseId)
                        
                        return (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors min-h-[100px]"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {courseKeys[2] ? course[courseKeys[2]] : ''}
                                </h4>
                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                  {courseKeys[8] ? course[courseKeys[8]] : ''}학점
                                </Badge>
                              </div>
                              <Button
                                size="sm"
                                variant={isSelected ? "destructive" : "default"}
                                onClick={() => {
                                  if (isSelected) {
                                    removeCourseFromTimetable(courseId)
                                  } else {
                                    addCourseToTimetable(course)
                                  }
                                }}
                                className="ml-2 flex-shrink-0"
                              >
                                {isSelected ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                              </Button>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">
                              {courseKeys[1] ? course[courseKeys[1]] : ''} | {courseKeys[5] ? course[courseKeys[5]] : ''}
                            </p>
                            <p className="text-xs text-gray-500">
                              {courseKeys[7] ? course[courseKeys[7]] : ''}
                            </p>
                          </div>
                        )
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 검색 결과 */}
            {showSearchResults && !showFavorites && (
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4">
                    검색 결과 ({filteredCourses.length}개)
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredCourses.map((course, index) => {
                      const courseKeys = Object.keys(course)
                      const courseId = getCourseId(course)
                      const isSelected = selectedCourses.has(courseId)
                      
                      return (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors min-h-[100px]"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {courseKeys[2] ? course[courseKeys[2]] : ''}
                              </h4>
                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                {courseKeys[8] ? course[courseKeys[8]] : ''}학점
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant={isSelected ? "destructive" : "default"}
                              onClick={() => {
                                if (isSelected) {
                                  removeCourseFromTimetable(courseId)
                                } else {
                                  addCourseToTimetable(course)
                                }
                              }}
                              className="ml-2 flex-shrink-0"
                            >
                              {isSelected ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            </Button>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">
                            {courseKeys[1] ? course[courseKeys[1]] : ''} | {courseKeys[5] ? course[courseKeys[5]] : ''}
                          </p>
                          <p className="text-xs text-gray-500">
                            {courseKeys[7] ? course[courseKeys[7]] : ''}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 오른쪽: 시간표 */}
          <div className="lg:col-span-3">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">🗓️ 시간표</h2>
                  <div className="flex items-center gap-4">
                  <div className="text-right">
                      <div className="text-base font-semibold text-blue-600">
                      총 {calculateTotalCredits()}학점
                    </div>
                      <div className="text-xs text-gray-600">
                      선택된 과목: {selectedCourses.size}개
                      </div>
                    </div>
                    <Button
                      onClick={handleSaveTimetable}
                      variant="default"
                      size="sm"
                      disabled={selectedCourses.size === 0}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      저장
                    </Button>
                  </div>
                </div>
                
                <div className="mb-4">
                  {renderTimetableGrid()}
                </div>

                {selectedCourses.size > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">선택된 과목</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                      {Array.from(selectedCourses).map(courseId => {
                        const course = courses.find(c => getCourseId(c) === courseId)
                        if (!course) return null
                        const courseKeys = Object.keys(course)
                        return (
                          <div key={courseId} className="flex items-center justify-between bg-white/50 rounded px-2 py-1">
                            <span className="text-xs text-blue-700 font-medium truncate">
                              {courseKeys[2] ? course[courseKeys[2]] : ''}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeCourseFromTimetable(courseId)}
                              className="h-5 w-5 p-0 text-blue-600 hover:text-red-600 ml-1"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 시간표 저장 다이얼로그 */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">시간표 저장</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시간표 이름
                  </label>
                  <Input
                    value={timetableName}
                    onChange={(e) => setTimetableName(e.target.value)}
                    placeholder="예: 2025학년도 1학기 시간표"
                    className="w-full"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={handleCancelSave}
                    variant="outline"
                    size="sm"
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleConfirmSave}
                    variant="default"
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    저장
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}


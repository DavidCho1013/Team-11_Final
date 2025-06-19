'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Star, BookOpen, User, Clock, Filter, ChevronDown, MapPin, Users } from 'lucide-react'

interface Course {
  [key: string]: string
}

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedTrack, setSelectedTrack] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const tracks = [
    '에너지 AI',
    '에너지 신소재', 
    '핵융합',
    '수소 에너지',
    '환경·기후 기술',
    '스마트 그리드'
  ]

  const grades = ['1학년', '2학년', '3학년', '4학년']
  
  // 영역 구분 목록 (실제 데이터에서 추출)
  const areas = ['EF', 'EL', 'MN', 'ESP', 'RC', 'VC', 'EN', 'HASS']

  useEffect(() => {
    // 로그인 상태 확인
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (isLoggedIn !== 'true') {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    fetchCourses()
    loadFavorites()
  }, [router])

  useEffect(() => {
    filterCourses()
  }, [courses, searchTerm, selectedGrade, selectedTrack, selectedArea])

  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem('favoriteCourses')
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)))
    }
  }

  const saveFavorites = (newFavorites: Set<string>) => {
    localStorage.setItem('favoriteCourses', JSON.stringify(Array.from(newFavorites)))
  }

  const toggleFavorite = (courseId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(courseId)) {
      newFavorites.delete(courseId)
    } else {
      newFavorites.add(courseId)
    }
    setFavorites(newFavorites)
    saveFavorites(newFavorites)
  }

  const getCourseId = (course: Course) => {
    const courseKeys = Object.keys(course)
    return `${courseKeys[1] ? course[courseKeys[1]] : ''}-${courseKeys[3] ? course[courseKeys[3]] : ''}` // 과목코드-분반
  }

  const fetchCourses = async () => {
    try {
      console.log('Fetching courses from API...')
      const response = await fetch('/api/courses')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Full API Response:', data)
      
      if (data.success && data.courses && Array.isArray(data.courses)) {
        console.log('✅ Courses loaded successfully:', data.courses.length)
        console.log('Sample course:', data.courses[0])
        console.log('Headers available:', data.headers)
        console.log('Course keys:', Object.keys(data.courses[0] || {}))
        console.log('First few courses:', data.courses.slice(0, 3))
        
        setCourses(data.courses)
        setFilteredCourses(data.courses)
      } else {
        console.error('❌ API response format error:', data)
        console.error('Expected: { success: true, courses: [...] }')
        console.error('Received:', Object.keys(data))
      }
    } catch (error) {
      console.error('❌ Network or parsing error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCourses = () => {
    let filtered = courses

    if (searchTerm) {
      filtered = filtered.filter(course => {
        const values = Object.values(course).join(' ').toLowerCase()
        return values.includes(searchTerm.toLowerCase())
      })
    }

    if (selectedGrade) {
      filtered = filtered.filter(course => {
        const courseKeys = Object.keys(course)
        const gradeValue = course[courseKeys[0]] // 첫 번째 컬럼이 수강학년
        return gradeValue === selectedGrade
      })
    }

    if (selectedTrack) {
      filtered = filtered.filter(course => {
        const values = Object.values(course).join(' ')
        return values.includes(selectedTrack)
      })
    }

    if (selectedArea) {
      filtered = filtered.filter(course => {
        const courseKeys = Object.keys(course)
        const areaValue = course[courseKeys[4]] // 5번째 컬럼이 영역 구분
        return areaValue === selectedArea
      })
    }

    setFilteredCourses(filtered)
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
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📖 개설 과목 조회</h1>
          <p className="text-gray-600">2025학년도 1학기 개설 과목 목록입니다. 과목명을 클릭하면 상세 정보를 확인할 수 있습니다.</p>
        </div>

        {/* 검색 및 필터 */}
        <Card className="bg-white/80 backdrop-blur-sm mb-6">
          <CardContent className="p-6">
            {/* 검색 */}
            <div className="mb-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="과목명, 교수명, 과목코드로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* 검색 결과 개수 및 필터 초기화 */}
            <div className="flex justify-between items-center mb-4 text-sm">
              <span className="text-gray-600">
                총 {filteredCourses.length}개의 과목이 검색되었습니다.
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedGrade('')
                  setSelectedTrack('')
                  setSelectedArea('')
                }}
              >
                필터 초기화
              </Button>
            </div>

            {/* 필터 버튼들 */}
            <div className="space-y-3">
              {/* 수강학년 필터 */}
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-2">수강학년</h4>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setSelectedGrade('')}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                      selectedGrade === '' 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    전체
                  </button>
                  {grades.map(grade => (
                    <button
                      key={grade}
                      onClick={() => setSelectedGrade(grade)}
                      className={`px-3 py-1 text-xs rounded-full border transition-all ${
                        selectedGrade === grade 
                          ? 'bg-blue-500 text-white border-blue-500' 
                          : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>

              {/* 영역 구분 필터 */}
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-2">영역 구분</h4>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setSelectedArea('')}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                      selectedArea === '' 
                        ? 'bg-green-500 text-white border-green-500' 
                        : 'bg-white text-gray-600 border-gray-300 hover:border-green-300'
                    }`}
                  >
                    전체
                  </button>
                  {areas.map(area => (
                    <button
                      key={area}
                      onClick={() => setSelectedArea(area)}
                      className={`px-3 py-1 text-xs rounded-full border transition-all ${
                        selectedArea === area 
                          ? 'bg-green-500 text-white border-green-500' 
                          : 'bg-white text-gray-600 border-gray-300 hover:border-green-300'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              {/* 트랙 필터 */}
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-2">트랙</h4>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setSelectedTrack('')}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                      selectedTrack === '' 
                        ? 'bg-purple-500 text-white border-purple-500' 
                        : 'bg-white text-gray-600 border-gray-300 hover:border-purple-300'
                    }`}
                  >
                    전체
                  </button>
                  {tracks.map(track => (
                    <button
                      key={track}
                      onClick={() => setSelectedTrack(track)}
                      className={`px-3 py-1 text-xs rounded-full border transition-all ${
                        selectedTrack === track 
                          ? 'bg-purple-500 text-white border-purple-500' 
                          : 'bg-white text-gray-600 border-gray-300 hover:border-purple-300'
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

                {/* 과목 리스트 */}
        <div className="space-y-4">
          {filteredCourses.map((course, index) => {
            const courseKeys = Object.keys(course)
            return (
             <Card key={index} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
               <CardContent className="p-6">
                 <div className="flex items-center justify-between">
                   {/* 왼쪽: 과목 정보 */}
                                        <div className="flex-1">
                       <div className="mb-3">
                         <div className="flex items-center gap-3 mb-1">
                           <h3 className="text-lg font-bold text-gray-900">
                             {courseKeys[2] ? course[courseKeys[2]] : ''} {/* 과목명 */}
                           </h3>
                           <div className="flex items-center gap-2">
                             <Badge variant="outline" className="text-xs">
                               {courseKeys[0] ? course[courseKeys[0]] : ''} {/* 수강학년 */}
                             </Badge>
                             <Badge variant="outline" className="text-xs">
                               {courseKeys[4] ? course[courseKeys[4]] : ''} {/* 영역 구분 */}
                             </Badge>
                           </div>
                         </div>
                         <p className="text-sm text-gray-600">
                           {courseKeys[1] ? course[courseKeys[1]] : ''} | {courseKeys[3] ? course[courseKeys[3]] : ''} {/* 과목코드 | 분반 */}
                         </p>
                       </div>
                       
                       <div className="flex items-center space-x-6">
                         <div className="flex items-center space-x-2">
                           <User className="h-4 w-4 text-gray-500" />
                           <span className="text-sm text-gray-700">{courseKeys[5] ? course[courseKeys[5]] : ''}</span> {/* 담당교수 */}
                         </div>
                         
                         <div className="flex items-center space-x-2">
                           <Clock className="h-4 w-4 text-gray-500" />
                           <span className="text-sm text-gray-700">{courseKeys[7] ? course[courseKeys[7]] : ''}</span> {/* 강의시간 */}
                         </div>
                       </div>
                     </div>
                   
                   {/* 오른쪽: 즐겨찾기 + 학점 */}
                   <div className="ml-6 flex flex-col items-center space-y-2">
                     <button
                       onClick={() => toggleFavorite(getCourseId(course))}
                       className="transition-colors duration-200 hover:scale-110"
                     >
                       <Star 
                         className={`h-5 w-5 ${
                           favorites.has(getCourseId(course))
                             ? 'fill-yellow-400 text-yellow-400' 
                             : 'text-gray-400 hover:text-yellow-400'
                         }`}
                       />
                     </button>
                     <Badge variant="secondary" className="text-sm px-3 py-1">
                       {courseKeys[8] ? course[courseKeys[8]] : ''}학점 {/* 학점 */}
                     </Badge>
                   </div>
                 </div>
               </CardContent>
             </Card>
            )
          })}
        </div>

        {filteredCourses.length === 0 && !loading && (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center py-20">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">검색 결과가 없습니다</h2>
                <p className="text-gray-600 mb-6">
                  다른 검색어나 필터 조건을 시도해보세요.
                </p>
                <Button onClick={() => {
                  setSearchTerm('')
                  setSelectedGrade('')
                  setSelectedTrack('')
                }}>
                  필터 초기화
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Mail, 
  GraduationCap, 
  Target, 
  Edit3, 
  Save, 
  LogOut, 
  Settings,
  MessageSquare,
  Calendar,
  Users,
  Activity,
  TrendingUp,
  BookOpen,
  Clock,
  Eye,
  X,
  Star,
  MapPin,
  Trash2,
  ThumbsUp,
  MessageCircle,
  Heart
} from 'lucide-react'

interface UserProfile {
  email: string
  nickname: string
  track: string
  grade: string
  isSetupComplete: boolean
}

interface UserActivity {
  posts: any[]
  savedTimetables: any[]
  studyGroups: any[]
  reviews: any[]
  totalViews: number
  totalLikes: number
}

export default function MyPage() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile>({
    email: '',
    nickname: '',
    track: '',
    grade: '',
    isSetupComplete: false
  })
  const [userActivity, setUserActivity] = useState<UserActivity>({
    posts: [],
    savedTimetables: [],
    studyGroups: [],
    reviews: [],
    totalViews: 0,
    totalLikes: 0
  })
  const [isInitialSetup, setIsInitialSetup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedActivityTab, setSelectedActivityTab] = useState<'posts' | 'timetables' | 'groups' | 'reviews' | 'favorites'>('posts')
  const [selectedTimetable, setSelectedTimetable] = useState<any>(null)
  const [showTimetableDetail, setShowTimetableDetail] = useState(false)
  const [favoriteCourses, setFavoriteCourses] = useState<any[]>([])
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

  useEffect(() => {
    // 로그인 상태 확인
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (isLoggedIn !== 'true') {
      router.push('/login')
      return
    }

    // 사용자 정보 및 활동 로드
    loadUserData()
  }, [router])

  const loadUserData = () => {
    const email = localStorage.getItem('userEmail') || ''
    const savedProfile = localStorage.getItem('userProfile')
    
    if (savedProfile) {
      const profile = JSON.parse(savedProfile)
      setUserProfile({ 
        ...profile, 
        email,
        isSetupComplete: !!(profile.nickname && profile.track && profile.grade)
      })
      
      // 프로필이 완성되었으면 활동 데이터 로드
      if (profile.nickname && profile.track && profile.grade) {
        loadUserActivity(profile.nickname)
        loadFavoriteCourses()
      } else {
        setIsInitialSetup(true)
      }
    } else {
      setUserProfile({
        email,
        nickname: '',
        track: '',
        grade: '',
        isSetupComplete: false
      })
      setIsInitialSetup(true)
    }
  }

  const loadUserActivity = (nickname: string) => {
    // 커뮤니티 게시글 로드
    const allPosts = JSON.parse(localStorage.getItem('userPosts') || '[]')
    const userPosts = allPosts.filter((post: any) => post.author === nickname)

    // 저장된 시간표 로드 및 정리
    const savedTimetables = JSON.parse(localStorage.getItem('savedTimetables') || '[]')
    
    // 데이터 정리: 잘못된 날짜 데이터 수정
    const cleanedTimetables = savedTimetables.map((timetable: any) => {
      if (!timetable.createdAt || isNaN(new Date(timetable.createdAt).getTime())) {
        timetable.createdAt = timetable.savedAt || new Date().toISOString()
      }
      if (!timetable.semester) {
        timetable.semester = '2025-1학기'
      }
      return timetable
    })
    
    // 정리된 데이터를 다시 저장
    if (cleanedTimetables.length > 0) {
      localStorage.setItem('savedTimetables', JSON.stringify(cleanedTimetables))
    }
    // 최신 순으로 정렬 (정리된 데이터 사용)
    cleanedTimetables.sort((a: any, b: any) => {
      try {
        const dateA = new Date(a.createdAt)
        const dateB = new Date(b.createdAt)
        
        return dateB.getTime() - dateA.getTime()
      } catch (error) {
        return 0 // 오류 발생 시 순서 변경 안함
      }
    })

    // 참여 중인 스터디 그룹 로드
    const allGroups = JSON.parse(localStorage.getItem('userStudyGroups') || '[]')
    // userStudyGroups에 저장된 그룹들은 이미 해당 사용자가 참여한 그룹들이므로 모두 가져옴
    const userGroups = allGroups

    // 수강 후기 로드 - 커뮤니티와 동일한 데이터 소스 사용
    const allReviews = JSON.parse(localStorage.getItem('userReviews') || '[]')
    // 커뮤니티 페이지에서 생성된 기본 샘플 데이터도 포함
    const sampleReviews = [
      {
        id: 1,
        title: "[예시] 인공지능 기초 수강 후기",
        content: "처음 접하는 AI 분야였는데, 교수님이 차근차근 설명해주셔서 이해하기 쉬웠습니다. 과제는 적당했고, 실습 위주라 재미있었어요. 추천합니다!",
        author: "예시사용자1",
        date: "2024-01-15",
        likes: 24,
        comments: 0,
        views: 142,
        tags: ["A1001", "김교수", "추천"],
        rating: 5
      }
    ]
    const allCombinedReviews = [...sampleReviews, ...allReviews]
    const userReviews = allCombinedReviews.filter((review: any) => review.author === nickname)

    // 총 조회수, 좋아요 계산
    const totalViews = userPosts.reduce((sum: number, post: any) => sum + (post.views || 0), 0)
    const totalLikes = userPosts.reduce((sum: number, post: any) => sum + (post.likes || 0), 0)

    setUserActivity({
      posts: userPosts,
      savedTimetables: cleanedTimetables,
      studyGroups: userGroups,
      reviews: userReviews,
      totalViews,
      totalLikes
    })
  }

  const loadFavoriteCourses = async () => {
    try {
      const savedFavorites = localStorage.getItem('favoriteCourses')
      if (!savedFavorites) {
        return
      }

      const favoriteIds = JSON.parse(savedFavorites)
      setFavorites(new Set(favoriteIds))

      const response = await fetch('/api/courses')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.courses && Array.isArray(data.courses)) {
        const filteredCourses = data.courses.filter((course: any) => {
          const courseKeys = Object.keys(course)
          const courseId = `${courseKeys[1] ? course[courseKeys[1]] : ''}-${courseKeys[3] ? course[courseKeys[3]] : ''}`
          return favoriteIds.includes(courseId)
        })
        
        setFavoriteCourses(filteredCourses)
      }
    } catch (error) {
      console.error('즐겨찾기 과목 로드 중 오류:', error)
    }
  }

  const toggleFavorite = (courseId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(courseId)) {
      newFavorites.delete(courseId)
      setFavoriteCourses(prev => {
        const courseKeys = Object.keys(prev[0] || {})
        return prev.filter(course => {
          const id = `${courseKeys[1] ? course[courseKeys[1]] : ''}-${courseKeys[3] ? course[courseKeys[3]] : ''}`
          return id !== courseId
        })
      })
    }
    setFavorites(newFavorites)
    localStorage.setItem('favoriteCourses', JSON.stringify(Array.from(newFavorites)))
  }

  const getCourseId = (course: any) => {
    const courseKeys = Object.keys(course)
    return `${courseKeys[1] ? course[courseKeys[1]] : ''}-${courseKeys[3] ? course[courseKeys[3]] : ''}`
  }

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCompleteSetup = async () => {
    setLoading(true)
    
    // 유효성 검사
    if (!userProfile.nickname.trim()) {
      alert('별명을 입력해주세요.')
      setLoading(false)
      return
    }

    if (!userProfile.track) {
      alert('트랙을 선택해주세요.')
      setLoading(false)
      return
    }

    if (!userProfile.grade) {
      alert('학년을 선택해주세요.')
      setLoading(false)
      return
    }

    try {
      // 프로필 저장
      const profileToSave = {
        nickname: userProfile.nickname,
        track: userProfile.track,
        grade: userProfile.grade,
        isSetupComplete: true
      }
      
      localStorage.setItem('userProfile', JSON.stringify(profileToSave))
      
      setUserProfile(prev => ({ ...prev, isSetupComplete: true }))
      setIsInitialSetup(false)
      
      // 활동 데이터 로드
      loadUserActivity(userProfile.nickname)
      
      alert('프로필 설정이 완료되었습니다!')
    } catch (error) {
      alert('프로필 저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('userEmail')
      
      // 네비게이션 바 업데이트를 위한 이벤트 발생
      window.dispatchEvent(new Event('storage'))
      
      router.push('/')
    }
  }

  const handlePostClick = (post: any) => {
    // 커뮤니티 페이지로 이동하면서 해당 글 ID를 전달
    router.push(`/community?postId=${post.id}&tab=board`)
  }

  const handleTimetableClick = (timetable: any) => {
    setSelectedTimetable(timetable)
    setShowTimetableDetail(true)
  }

  const handleCloseTimetableDetail = () => {
    setShowTimetableDetail(false)
    setSelectedTimetable(null)
  }

  const handleDeleteTimetable = (timetableId: number) => {
    if (window.confirm('정말로 이 시간표를 삭제하시겠습니까?')) {
      const savedTimetables = JSON.parse(localStorage.getItem('savedTimetables') || '[]')
      const updatedTimetables = savedTimetables.filter((t: any) => t.id !== timetableId)
      localStorage.setItem('savedTimetables', JSON.stringify(updatedTimetables))
      
      // 만약 현재 상세 보기 중인 시간표가 삭제된 시간표라면 모달 닫기
      if (selectedTimetable && selectedTimetable.id === timetableId) {
        setShowTimetableDetail(false)
        setSelectedTimetable(null)
      }
      
      // 활동 데이터 새로고침
      loadUserActivity(userProfile.nickname)
      alert('시간표가 삭제되었습니다.')
    }
  }

  const handleDeletePost = (postId: number) => {
    if (window.confirm('정말로 이 글을 삭제하시겠습니까?')) {
      const allPosts = JSON.parse(localStorage.getItem('userPosts') || '[]')
      const updatedPosts = allPosts.filter((post: any) => post.id !== postId)
      localStorage.setItem('userPosts', JSON.stringify(updatedPosts))
      
      // 활동 데이터 새로고침
      loadUserActivity(userProfile.nickname)
      alert('글이 삭제되었습니다.')
    }
  }

  const handleDeleteReview = (reviewId: number) => {
    if (window.confirm('정말로 이 수강 후기를 삭제하시겠습니까?')) {
      const allReviews = JSON.parse(localStorage.getItem('userReviews') || '[]')
      const updatedReviews = allReviews.filter((review: any) => review.id !== reviewId)
      localStorage.setItem('userReviews', JSON.stringify(updatedReviews))
      
      // 활동 데이터 새로고침
      loadUserActivity(userProfile.nickname)
      alert('수강 후기가 삭제되었습니다.')
    }
  }

  const handleLeaveStudyGroup = (groupId: number) => {
    if (window.confirm('정말로 이 스터디 그룹에서 탈퇴하시겠습니까?')) {
      // userStudyGroups에서 해당 그룹 제거
      const userStudyGroups = JSON.parse(localStorage.getItem('userStudyGroups') || '[]')
      const updatedGroups = userStudyGroups.filter((group: any) => group.id !== groupId)
      localStorage.setItem('userStudyGroups', JSON.stringify(updatedGroups))
      
      // 현재 상태 업데이트
      loadUserActivity(userProfile.nickname)
      alert('스터디 그룹에서 탈퇴되었습니다.')
    }
  }

  const renderTimetableGrid = (timetable: any) => {
    const DAYS = ['월', '화', '수', '목', '금']
    const TIME_SLOTS = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', 
      '18:00', '18:30', '19:00'
    ]

    const parseTimeString = (timeString: string) => {
      if (!timeString || timeString === '-') return []
      
      const slots: any[] = []
      
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
                endTime
              })
            }
          }
        }
      })
      
      return slots
    }

    const getTimeSlotPosition = (startTime: string): number => {
      return TIME_SLOTS.indexOf(startTime)
    }

    const getTimeSlotHeight = (startTime: string, endTime: string): number => {
      const startIndex = TIME_SLOTS.indexOf(startTime)
      const endIndex = TIME_SLOTS.indexOf(endTime)
      return endIndex - startIndex
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

    // 모든 과목의 시간 슬롯 정보를 수집
    const allTimeSlots: any[] = []
    if (timetable.courses) {
      console.log('시간표 데이터:', timetable)
      timetable.courses.forEach((course: any, index: number) => {
        const courseKeys = Object.keys(course)
        const timeString = courseKeys[7] ? course[courseKeys[7]] : ''
        console.log(`과목 ${index + 1} 시간 문자열:`, timeString)
        const timeSlots = parseTimeString(timeString)
        console.log(`과목 ${index + 1} 파싱된 시간 슬롯:`, timeSlots)
        
        timeSlots.forEach(slot => {
          allTimeSlots.push({
            ...slot,
            course
          })
        })
      })
      console.log('전체 시간 슬롯:', allTimeSlots)
    }

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
                <div key={`${day}-${time}`} className="border-r border-gray-100 last:border-r-0 relative">
                </div>
              ))}
            </div>
          ))}
          
          {/* 과목 블록들 */}
          {allTimeSlots.map((slot, index) => {
            const dayIndex = DAYS.indexOf(slot.day)
            const position = getTimeSlotPosition(slot.startTime)
            const height = getTimeSlotHeight(slot.startTime, slot.endTime)
            const courseKeys = Object.keys(slot.course)
            const courseName = courseKeys[2] ? slot.course[courseKeys[2]] : ''
            const professor = courseKeys[5] ? slot.course[courseKeys[5]] : ''
            const area = courseKeys[4] ? slot.course[courseKeys[4]] : 'default'
            
            console.log(`블록 ${index}: day=${slot.day}, dayIndex=${dayIndex}, position=${position}, height=${height}`)
            
            if (dayIndex === -1 || position === -1) {
              console.log(`블록 ${index} 스킵됨: dayIndex=${dayIndex}, position=${position}`)
              return null
            }
            
            const colorClass = getColorByArea(area)
            
            return (
              <div
                key={`${index}-${slot.day}-${slot.startTime}-${slot.endTime}`}
                className={`absolute border-l-4 p-2 m-1 rounded-lg shadow-sm overflow-hidden ${colorClass} flex flex-col justify-between`}
                style={{
                  left: `${(dayIndex + 1) * (100 / 6)}%`,
                  top: `${position * 48}px`,
                  width: `${100 / 6 - 1}%`,
                  height: `${height * 48 - 8}px`,
                  zIndex: 10
                }}
              >
                {/* 긴 시간 블록(2시간 이상)에서는 더 많은 정보 표시 */}
                {height >= 4 ? (
                  <>
                    <div className="font-semibold text-sm leading-tight mb-2 break-words">
                      {courseName}
                    </div>
                    <div className="text-xs opacity-80 mb-2 break-words">
                      {area} | {professor}
                    </div>
                    <div className="text-xs font-medium mt-auto">
                      {slot.startTime}-{slot.endTime}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-semibold text-xs leading-tight mb-1 break-words overflow-hidden">
                      {courseName.length > 15 ? `${courseName.substring(0, 15)}...` : courseName}
                    </div>
                    <div className="text-xs opacity-80 mb-1 break-words">
                      {area} | {professor.length > 6 ? `${professor.substring(0, 6)}...` : professor}
                    </div>
                    <div className="text-xs font-medium mt-auto">
                      {slot.startTime}-{slot.endTime}
                    </div>
                  </>
                )}
              </div>
            )
          })}
          
          {/* 디버그 정보 - 개발 중에만 표시 */}
          {allTimeSlots.length === 0 && (
            <div className="absolute top-4 left-4 bg-red-100 border border-red-300 text-red-800 p-2 rounded text-xs">
              시간 슬롯이 없습니다. 콘솔을 확인하세요.
            </div>
          )}
        </div>
      </div>
    )
  }

  // 초기 설정 화면 렌더링
  const renderInitialSetup = () => (
    <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 min-h-screen">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <Card className="w-full max-w-2xl bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto bg-blue-500 text-white p-3 rounded-full w-fit">
              <Settings className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              프로필 설정
            </CardTitle>
            <p className="text-gray-600">
              KENTA를 시작하기 위해 기본 정보를 입력해주세요
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* 이메일 (읽기 전용) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                이메일 주소
              </label>
              <Input
                value={userProfile.email}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* 별명 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                별명 (커뮤니티 활동명) *
              </label>
              <Input
                value={userProfile.nickname}
                onChange={(e) => handleInputChange('nickname', e.target.value)}
                placeholder="커뮤니티에서 사용할 별명을 입력하세요"
              />
              <p className="text-xs text-gray-500">
                게시글, 댓글, 스터디 그룹에서 이 별명이 표시됩니다.
              </p>
            </div>

            {/* 트랙 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Target className="h-4 w-4 mr-2 text-gray-500" />
                전공 트랙 *
              </label>
              <select
                value={userProfile.track}
                onChange={(e) => handleInputChange('track', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">트랙을 선택하세요</option>
                {tracks.map((track) => (
                  <option key={track} value={track}>{track}</option>
                ))}
              </select>
            </div>

            {/* 학년 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <GraduationCap className="h-4 w-4 mr-2 text-gray-500" />
                학년 *
              </label>
              <select
                value={userProfile.grade}
                onChange={(e) => handleInputChange('grade', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">학년을 선택하세요</option>
                {grades.map((grade) => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            {/* 완료 버튼 */}
            <div className="pt-4">
              <Button
                onClick={handleCompleteSetup}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    설정 중...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    설정 완료
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // 대시보드 화면 렌더링
  const renderDashboard = () => (
    <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                👋 안녕하세요, {userProfile.nickname}님!
              </h1>
              <p className="text-gray-600">
                {userProfile.track} | {userProfile.grade}
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>

        {/* 활동 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card 
            className={`backdrop-blur-sm cursor-pointer transition-all hover:shadow-lg ${
              selectedActivityTab === 'posts' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/80 hover:bg-gray-50'
            }`}
            onClick={() => setSelectedActivityTab('posts')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${selectedActivityTab === 'posts' ? 'text-blue-100' : 'text-gray-600'}`}>
                    작성한 글
                  </p>
                  <p className={`text-2xl font-bold ${selectedActivityTab === 'posts' ? 'text-white' : 'text-blue-600'}`}>
                    {userActivity.posts.length}
                  </p>
                </div>
                <MessageSquare className={`h-8 w-8 ${selectedActivityTab === 'posts' ? 'text-blue-200' : 'text-blue-500'}`} />
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`backdrop-blur-sm cursor-pointer transition-all hover:shadow-lg ${
              selectedActivityTab === 'timetables' 
                ? 'bg-green-500 text-white' 
                : 'bg-white/80 hover:bg-gray-50'
            }`}
            onClick={() => setSelectedActivityTab('timetables')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${selectedActivityTab === 'timetables' ? 'text-green-100' : 'text-gray-600'}`}>
                    저장한 시간표
                  </p>
                  <p className={`text-2xl font-bold ${selectedActivityTab === 'timetables' ? 'text-white' : 'text-green-600'}`}>
                    {userActivity.savedTimetables.length}
                  </p>
                </div>
                <Calendar className={`h-8 w-8 ${selectedActivityTab === 'timetables' ? 'text-green-200' : 'text-green-500'}`} />
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`backdrop-blur-sm cursor-pointer transition-all hover:shadow-lg ${
              selectedActivityTab === 'groups' 
                ? 'bg-purple-500 text-white' 
                : 'bg-white/80 hover:bg-gray-50'
            }`}
            onClick={() => setSelectedActivityTab('groups')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${selectedActivityTab === 'groups' ? 'text-purple-100' : 'text-gray-600'}`}>
                    참여 스터디
                  </p>
                  <p className={`text-2xl font-bold ${selectedActivityTab === 'groups' ? 'text-white' : 'text-purple-600'}`}>
                    {userActivity.studyGroups.length}
                  </p>
                </div>
                <Users className={`h-8 w-8 ${selectedActivityTab === 'groups' ? 'text-purple-200' : 'text-purple-500'}`} />
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`backdrop-blur-sm cursor-pointer transition-all hover:shadow-lg ${
              selectedActivityTab === 'reviews' 
                ? 'bg-orange-500 text-white' 
                : 'bg-white/80 hover:bg-gray-50'
            }`}
            onClick={() => setSelectedActivityTab('reviews')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${selectedActivityTab === 'reviews' ? 'text-orange-100' : 'text-gray-600'}`}>
                    작성한 후기
                  </p>
                  <p className={`text-2xl font-bold ${selectedActivityTab === 'reviews' ? 'text-white' : 'text-orange-600'}`}>
                    {userActivity.reviews.length}
                  </p>
                </div>
                <BookOpen className={`h-8 w-8 ${selectedActivityTab === 'reviews' ? 'text-orange-200' : 'text-orange-500'}`} />
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`backdrop-blur-sm cursor-pointer transition-all hover:shadow-lg ${
              selectedActivityTab === 'favorites' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-white/80 hover:bg-gray-50'
            }`}
            onClick={() => setSelectedActivityTab('favorites')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${selectedActivityTab === 'favorites' ? 'text-yellow-100' : 'text-gray-600'}`}>
                    나의 즐겨찾기
                  </p>
                  <p className={`text-2xl font-bold ${selectedActivityTab === 'favorites' ? 'text-white' : 'text-yellow-600'}`}>
                    {favoriteCourses.length}
                  </p>
                </div>
                <Star className={`h-8 w-8 ${selectedActivityTab === 'favorites' ? 'text-yellow-200' : 'text-yellow-500'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 선택된 활동 상세 정보 */}
        <div className="w-full">
          {selectedActivityTab === 'posts' && (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-600">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  최근 작성한 글
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {userActivity.posts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">작성한 글이 없습니다.</p>
                ) : (
                  userActivity.posts.slice(0, 10).map((post, index) => (
                    <div 
                      key={index} 
                      className="border-b border-gray-100 pb-3 last:border-b-0 p-3 rounded-lg transition-colors hover:bg-blue-50 group"
                    >
                      <div className="flex items-start justify-between">
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => handlePostClick(post)}
                        >
                          <h4 className="font-medium text-gray-900 mb-1 hover:text-blue-600 transition-colors">
                            {post.title}
                          </h4>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{post.category}</span>
                            <span className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {post.views}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {post.date}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeletePost(post.id)
                          }}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {selectedActivityTab === 'timetables' && (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-green-600">
                  <Calendar className="h-5 w-5 mr-2" />
                  저장된 시간표
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {userActivity.savedTimetables.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">저장된 시간표가 없습니다.</p>
                    <Button 
                      onClick={() => router.push('/timetable/manual')}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      시간표 만들기
                    </Button>
                  </div>
                ) : (
                  userActivity.savedTimetables.map((timetable, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => handleTimetableClick(timetable)}
                        >
                          <h4 className="font-medium text-gray-900 mb-1 hover:text-green-600 transition-colors">
                            {timetable.name || `시간표 ${index + 1}`}
                          </h4>
                          <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                            <span>{timetable.semester || '2025-1학기'}</span>
                            <span>{timetable.courses?.length || 0}개 과목</span>
                            <span>{timetable.totalCredits || 0}학점</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            생성일: {timetable.createdAt ? (() => {
                              try {
                                const date = new Date(timetable.createdAt)
                                if (isNaN(date.getTime())) {
                                  return '날짜 정보 없음'
                                }
                                const year = date.getFullYear()
                                const month = String(date.getMonth() + 1).padStart(2, '0')
                                const day = String(date.getDate()).padStart(2, '0')
                                return `${year}년 ${month}월 ${day}일`
                              } catch (error) {
                                return '날짜 정보 없음'
                              }
                            })() : '날짜 정보 없음'}
                          </div>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteTimetable(timetable.id)
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {selectedActivityTab === 'groups' && (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-600">
                  <Users className="h-5 w-5 mr-2" />
                  참여 중인 스터디 그룹
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {userActivity.studyGroups.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">참여 중인 스터디 그룹이 없습니다.</p>
                    <p className="text-sm text-gray-400 mb-6">
                      커뮤니티 페이지에서 스터디 그룹에 참여해보세요.
                    </p>
                    <Button 
                      onClick={() => router.push('/community?tab=study')}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      스터디 그룹 찾기
                    </Button>
                  </div>
                ) : (
                  userActivity.studyGroups.map((group, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">{group.title}</h4>
                          {group.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{group.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">{group.subject}</Badge>
                              <span>{group.members}/{group.maxMembers}명</span>
                            </div>
                            {group.leader === userProfile.nickname ? (
                              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">리더</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">멤버</Badge>
                            )}
                          </div>
                          {group.schedule && (
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                              <Clock className="h-3 w-3" />
                              <span>{group.schedule}</span>
                            </div>
                          )}
                          {group.location && (
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                              <MapPin className="h-3 w-3" />
                              <span>{group.location}</span>
                            </div>
                          )}
                          {group.joinedAt && (
                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                              <Calendar className="h-3 w-3" />
                              <span>참여일: {(() => {
                                try {
                                  const date = new Date(group.joinedAt)
                                  if (isNaN(date.getTime())) {
                                    return '날짜 정보 없음'
                                  }
                                  const year = date.getFullYear()
                                  const month = String(date.getMonth() + 1).padStart(2, '0')
                                  const day = String(date.getDate()).padStart(2, '0')
                                  return `${year}년 ${month}월 ${day}일`
                                } catch (error) {
                                  return '날짜 정보 없음'
                                }
                              })()}</span>
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLeaveStudyGroup(group.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                        >
                          <X className="h-4 w-4 mr-1" />
                          탈퇴하기
                        </Button>
                      </div>
                      {group.tags && group.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {group.tags.map((tag: string, tagIndex: number) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {selectedActivityTab === 'reviews' && (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-600">
                  <BookOpen className="h-5 w-5 mr-2" />
                  작성한 수강 후기
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {userActivity.reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">작성한 수강 후기가 없습니다.</p>
                    <p className="text-sm text-gray-400 mb-6">
                      커뮤니티의 수강 후기 탭에서 후기를 작성해보세요.
                    </p>
                    <Button 
                      onClick={() => router.push('/community?tab=review')}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      후기 작성하기
                    </Button>
                  </div>
                ) : (
                  userActivity.reviews.map((review, index) => (
                    <Card key={review.id || index} className="bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-medium text-gray-900">{review.title}</h4>
                              </div>
                            </div>
                            
                            {/* 별점 표시 */}
                            {review.rating && (
                              <div className="mb-2">
                                <div className="flex items-center">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                      key={star}
                                      className={`text-sm ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                  <span className="ml-1 text-xs text-gray-600">({review.rating}/5)</span>
                                </div>
                              </div>
                            )}
                            
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{review.content}</p>
                            
                            {review.tags && (
                              <div className="flex gap-1 mb-2">
                                {review.tags.map((tag: string, tagIndex: number) => (
                                  <Badge key={tagIndex} variant="secondary" className="text-xs px-2 py-0">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center space-x-3">
                                <span className="flex items-center">
                                  <User className="h-3 w-3 mr-1" />
                                  {review.author}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {review.date}
                                </span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="flex items-center">
                                  <Heart className="h-3 w-3 mr-1" />
                                  {review.likes || 0}
                                </span>
                                <span className="flex items-center">
                                  <MessageCircle className="h-3 w-3 mr-1" />
                                  {review.comments || 0}
                                </span>
                                <span className="flex items-center">
                                  <Eye className="h-3 w-3 mr-1" />
                                  {review.views || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteReview(review.id)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 ml-2"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {selectedActivityTab === 'favorites' && (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-yellow-600">
                  <Star className="h-5 w-5 mr-2" />
                  나의 즐겨찾기
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {favoriteCourses.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">즐겨찾기한 과목이 없습니다.</p>
                    <p className="text-sm text-gray-400 mb-6">
                      개설 과목 조회 페이지에서 관심 있는 과목에 별표를 클릭하여 즐겨찾기에 추가해보세요.
                    </p>
                    <Button 
                      onClick={() => router.push('/courses')}
                      className="bg-yellow-500 hover:bg-yellow-600"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      과목 탐색하기
                    </Button>
                  </div>
                ) : (
                  favoriteCourses.map((course, index) => {
                    const courseKeys = Object.keys(course)
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="mb-3">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-bold text-gray-900">
                                  {courseKeys[2] ? course[courseKeys[2]] : ''}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {courseKeys[0] ? course[courseKeys[0]] : ''}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {courseKeys[4] ? course[courseKeys[4]] : ''}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">
                                {courseKeys[1] ? course[courseKeys[1]] : ''} | {courseKeys[3] ? course[courseKeys[3]] : ''}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-6">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-700">{courseKeys[5] ? course[courseKeys[5]] : ''}</span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-700">{courseKeys[7] ? course[courseKeys[7]] : ''}</span>
                              </div>
                            </div>
                          </div>
                          
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
                              {courseKeys[8] ? course[courseKeys[8]] : ''}학점
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )

  // 로딩 중이거나 초기 설정이 필요한 경우
  if (isInitialSetup) {
    return renderInitialSetup()
  }

  // 프로필 설정이 완료된 경우 대시보드 표시
  if (showTimetableDetail && selectedTimetable) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                📅 {selectedTimetable.name}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{selectedTimetable.semester || '2025-1학기'}</span>
                <span>{selectedTimetable.courses?.length || 0}개 과목</span>
                <span>{selectedTimetable.totalCredits || 0}학점</span>
                <span>생성일: {selectedTimetable.createdAt ? (() => {
                  try {
                    const date = new Date(selectedTimetable.createdAt)
                    if (isNaN(date.getTime())) {
                      return '날짜 정보 없음'
                    }
                    const year = date.getFullYear()
                    const month = String(date.getMonth() + 1).padStart(2, '0')
                    const day = String(date.getDate()).padStart(2, '0')
                    return `${year}년 ${month}월 ${day}일`
                  } catch (error) {
                    return '날짜 정보 없음'
                  }
                })() : '날짜 정보 없음'}</span>
              </div>
            </div>
            <Button
              onClick={handleCloseTimetableDetail}
              variant="outline"
              className="text-gray-600"
            >
              <X className="h-4 w-4 mr-2" />
              닫기
            </Button>
          </div>

          {/* 시간표 그리드 */}
          <div className="mb-6">
            {renderTimetableGrid(selectedTimetable)}
          </div>

          {/* 과목 목록 */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <BookOpen className="h-5 w-5 mr-2" />
                수강 과목 목록
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTimetable.courses && selectedTimetable.courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTimetable.courses.map((course: any, index: number) => {
                    const courseKeys = Object.keys(course)
                    const courseName = courseKeys[2] ? course[courseKeys[2]] : ''
                    const courseCode = courseKeys[1] ? course[courseKeys[1]] : ''
                    const professor = courseKeys[5] ? course[courseKeys[5]] : ''
                    const area = courseKeys[4] ? course[courseKeys[4]] : ''
                    const credit = courseKeys[6] ? course[courseKeys[6]] : ''
                    const timeString = courseKeys[7] ? course[courseKeys[7]] : ''

                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{courseName}</h4>
                          <Badge variant="outline" className="text-xs">{area}</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>과목코드: {courseCode}</div>
                          <div>교수: {professor}</div>
                          <div>학점: {credit}</div>
                          <div>시간: {timeString}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">등록된 과목이 없습니다.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return renderDashboard()
} 
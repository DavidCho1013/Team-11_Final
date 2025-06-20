'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Bot, ArrowLeft, RefreshCw, Save, X, Eye, GraduationCap, BookOpen, Calculator, Target, Users } from 'lucide-react'

// 기본 인터페이스 정의
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

interface AISettings {
  grade: string
  espLevel: string
  mnLevel: string
  credits: string
  track: string
}

function AITimetableResultContent() {
  // 상태 관리
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [generatedTimetables, setGeneratedTimetables] = useState<GeneratedTimetable[]>([])
  const [selectedTimetable, setSelectedTimetable] = useState<GeneratedTimetable | null>(null)
  const [showDetailView, setShowDetailView] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [customTimetableName, setCustomTimetableName] = useState('')
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())
  
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const settings: AISettings = {
    grade: searchParams.get('grade') || '',
    espLevel: searchParams.get('espLevel') || '',
    mnLevel: searchParams.get('mnLevel') || '',
    credits: searchParams.get('credits') || '',
    track: searchParams.get('track') || ''
  }

  // 기본 유틸리티 함수들
    const getCourseInfo = (course: Course) => {
      const courseKeys = Object.keys(course)
      return {
        grade: courseKeys[0] ? course[courseKeys[0]] : '',
        code: courseKeys[1] ? course[courseKeys[1]] : '',
        name: courseKeys[2] ? course[courseKeys[2]] : '',
        professor: courseKeys[5] ? course[courseKeys[5]] : '',
        location: courseKeys[6] ? course[courseKeys[6]] : '',
        time: courseKeys[7] ? course[courseKeys[7]] : '',
        credits: courseKeys[8] ? course[courseKeys[8]] : '0',
      area: courseKeys[4] ? course[courseKeys[4]] : '',
      track: courseKeys[9] ? course[courseKeys[9]] : ''
    }
  }

  const getCreditFromCourse = (course: Course): number => {
    const courseKeys = Object.keys(course)
    const creditsStr = courseKeys[8] ? course[courseKeys[8]] : '0'
    return parseInt(creditsStr) || 0
  }

  // 1번: 시간 파싱 함수
    const parseTimeSlots = (timeString: string) => {
      const slots: { day: string, startTime: string, endTime: string }[] = []
      
      if (!timeString || timeString.trim() === '' || timeString === '시간 미정' || timeString === '-') {
        return slots
      }
      
      try {
        const timeStr = timeString.trim()
        
      // 형식 1: "월요일 09:30-11:00" 또는 "월 09:30-11:00"
        const pattern1 = /(월요일|화요일|수요일|목요일|금요일|토요일|일요일|월|화|수|목|금|토|일)\s*(\d{1,2})[:：](\d{2})\s*[-~]\s*(\d{1,2})[:：](\d{2})/g
        let match1
        while ((match1 = pattern1.exec(timeStr)) !== null) {
          const fullDay = match1[1]
          const day = fullDay.includes('요일') ? fullDay.replace('요일', '') : fullDay
          const startTime = `${match1[2].padStart(2, '0')}:${match1[3]}`
          const endTime = `${match1[4].padStart(2, '0')}:${match1[5]}`
          
          slots.push({ day, startTime, endTime })
        }
        
      // 형식 2: "화목 13:00-15:00" (다중 요일)
        const pattern2 = /([월화수목금토일]{2,})\s*(\d{1,2})[:：](\d{2})\s*[-~]\s*(\d{1,2})[:：](\d{2})/g
        let match2
        while ((match2 = pattern2.exec(timeStr)) !== null) {
          const dayChars = match2[1]
          const startTime = `${match2[2].padStart(2, '0')}:${match2[3]}`
          const endTime = `${match2[4].padStart(2, '0')}:${match2[5]}`
          
          for (const dayChar of dayChars) {
            slots.push({ day: dayChar, startTime, endTime })
          }
        }
        
      } catch (error) {
        console.error('시간 파싱 오류:', error)
      }
      
      return slots
    }

  // 1번: 시간 충돌 체크 함수
  const hasTimeConflict = (newCourse: Course, selectedCourses: Course[]): boolean => {
    const newCourseInfo = getCourseInfo(newCourse)
    if (!newCourseInfo.time || newCourseInfo.time === '시간 미정' || newCourseInfo.time === '-') {
      return false
    }

    const newTimeSlots = parseTimeSlots(newCourseInfo.time)
    
    for (const selectedCourse of selectedCourses) {
      const selectedCourseInfo = getCourseInfo(selectedCourse)
      if (!selectedCourseInfo.time || selectedCourseInfo.time === '시간 미정' || selectedCourseInfo.time === '-') {
        continue
      }

      const selectedTimeSlots = parseTimeSlots(selectedCourseInfo.time)
      
      for (const newSlot of newTimeSlots) {
        for (const selectedSlot of selectedTimeSlots) {
          if (newSlot.day === selectedSlot.day) {
            const newStart = parseInt(newSlot.startTime.replace(':', ''))
            const newEnd = parseInt(newSlot.endTime.replace(':', ''))
            const selectedStart = parseInt(selectedSlot.startTime.replace(':', ''))
            const selectedEnd = parseInt(selectedSlot.endTime.replace(':', ''))
            
            if ((newStart < selectedEnd && newEnd > selectedStart)) {
              return true
            }
          }
        }
      }
    }
    return false
  }

  // 1번: 중복 과목명 체크 함수 (강화됨)
  const isDuplicateCourseName = (newCourse: Course, selectedCourses: Course[]): boolean => {
    const newCourseInfo = getCourseInfo(newCourse)
    // 과목명에서 괄호와 분반 정보 제거 (예: "Systems and Society (A분반)" -> "Systems and Society")
    const newCourseName = newCourseInfo.name
      .replace(/\s*\([^)]*\)$/, '')  // 끝의 괄호 제거
      .replace(/\s*\([^)]*분반\)/, '') // 분반 정보 제거
      .replace(/\s+/g, ' ')          // 연속된 공백을 하나로
      .trim()
    
    const isDuplicate = selectedCourses.some(selectedCourse => {
      const selectedCourseInfo = getCourseInfo(selectedCourse)
      const selectedCourseName = selectedCourseInfo.name
        .replace(/\s*\([^)]*\)$/, '')  // 끝의 괄호 제거
        .replace(/\s*\([^)]*분반\)/, '') // 분반 정보 제거
        .replace(/\s+/g, ' ')          // 연속된 공백을 하나로
        .trim()
      
      const isMatch = newCourseName === selectedCourseName
      if (isMatch) {
        console.log(`   ⚠️ 중복 과목명 감지: "${newCourseInfo.name}" (이미 선택된: "${selectedCourseInfo.name}")`)
      }
      return isMatch
    })
    
    return isDuplicate
  }

  // 2번: 학점 범위 계산 함수
  const getCreditRange = (credits: string, grade: number): { min: number; max: number; target: number } => {
      const gradeNum = parseInt(grade.toString())
      
      // 1학년은 무조건 17학점 고정 (커리큘럼 고정)
      if (gradeNum === 1) {
      return { min: 17, max: 17, target: 17 }
      }
      
    // 학점 범위 매핑
        switch (credits) {
          case '12-13학점':
        return { 
          min: 12, 
          max: 13, 
          target: gradeNum <= 3 ? 12 : 13 
        }
          case '16-17학점':
        return { 
          min: 16, 
          max: 17, 
          target: gradeNum <= 3 ? 16 : 17 
        }
        case '20-21학점':
          return {
          min: 20, 
          max: 21, 
          target: gradeNum <= 3 ? 20 : 21 
        }
      case '24학점 이상':
          return {
          min: 24, 
          max: 28, 
          target: gradeNum <= 3 ? 24 : 26 
          }
        default:
          return {
          min: 16, 
          max: 17, 
          target: gradeNum <= 3 ? 16 : 17
        }
    }
  }

  // 3번: 학년별 과목 수강 가능성 검사
  const isEligibleGradeForCourse = (course: Course, studentGrade: string): boolean => {
        const courseInfo = getCourseInfo(course)
    const courseGrade = courseInfo.grade
    const studentGradeNum = parseInt(studentGrade)
    
    // 1. 영역별 학년 제한 검사
    // VC는 1학년만 수강 가능
    if (courseInfo.area === 'VC' && studentGradeNum !== 1) {
      return false
    }
    
    // RC는 1학년만 수강 가능
    if (courseInfo.area === 'RC' && studentGradeNum !== 1) {
      return false
    }
    
    // EN/HASS는 3, 4학년만 수강 가능
    if ((courseInfo.area === 'EN' || courseInfo.area === 'HASS') && 
        (studentGradeNum !== 3 && studentGradeNum !== 4)) {
      return false
    }
    
    // 2. 공통 과목은 모든 학년이 수강 가능
    if (!courseGrade || courseGrade === '공통' || courseGrade === 'common') {
      return true
    }
    
    // 3. N학년인 학생은 'N학년' & '공통' 수업만 수강 가능
    const courseGradeNum = parseInt(courseGrade)
    
    // 정확한 학년 매칭 확인 (문자열 포함 여러 형태 고려)
    const isMatchingGrade = 
      courseGradeNum === studentGradeNum ||                    // 숫자 비교
      courseGrade === studentGradeNum.toString() ||            // 문자열 비교
      courseGrade === `${studentGradeNum}학년` ||              // "N학년" 형태
      courseGrade.includes(studentGradeNum.toString())         // 포함 관계
    
    if (isMatchingGrade) {
      return true
    }
    
    return false
  }

  // 4번: ESP 레벨별 과목코드 매핑 함수
  const getESPCourseCode = (espLevel: string): string | null => {
    const espLevelMapping: { [key: string]: string } = {
      'Foundation 1': 'ES1001',
      'Foundation 2': 'ES1002',
      'Inter. Speaking': 'ES2002',
      'Inter. Writing': 'ES2001',
      'Advanced Speaking': 'ES3002',
      'Advanced Writing': 'ES3001'
    }
    
    return espLevelMapping[espLevel] || null
  }

  // 4번: ESP 수료 확인 함수
  const isESPCompleted = (espLevel: string): boolean => {
    return espLevel === '수료'
  }

  // 4번: MN 레벨별 과목코드 매핑 함수
  const getMNCourseCode = (mnLevel: string): string | null => {
    const mnLevelMapping: { [key: string]: string } = {
      'Strategic Learning and Leadership': 'MN1001',
      'Systems and Society': 'MN2001'
    }
    
    return mnLevelMapping[mnLevel] || null
  }

  // 4번: MN 수료 확인 함수
  const isMNCompleted = (mnLevel: string): boolean => {
    return mnLevel === '수료'
  }

  // 5번: EL 과목 트랙 매칭 함수
  const getELCoursesByTrack = (track: string, elCourses: Course[]): Course[] => {
    if (!track || track === '선택안함') {
      return elCourses
    }

    console.log(`🎯 EL 과목 트랙 매칭: ${track} (완전 일치만 반환)`)
    
    const trackMatchedCourses: Course[] = []

    elCourses.forEach(course => {
      const courseInfo = getCourseInfo(course)
      
      // 트랙 정확 매칭: 선택한 트랙 이름이 과목 트랙에 완전히 포함되어야 함
      const isTrackMatch = courseInfo.track && 
        courseInfo.track.split(',').map(t => t.trim()).includes(track.trim())
      
      if (isTrackMatch) {
        trackMatchedCourses.push(course)
        console.log(`   ✅ 트랙 일치: ${courseInfo.name} (과목트랙: ${courseInfo.track}, 선택트랙: ${track})`)
      } else {
        console.log(`   ❌ 트랙 불일치: ${courseInfo.name} (과목트랙: ${courseInfo.track || '없음'}, 선택트랙: ${track}) - 제외`)
      }
    })

    console.log(`   📊 트랙 매칭 결과: ${trackMatchedCourses.length}개 과목만 반환`)

    // 트랙 일치 과목만 반환 (기타 과목 제외)
    return trackMatchedCourses
  }

  // 5번: 적합한 과목 필터링 함수
    const getEligibleCourses = (selectedCourses: Course[] = []) => {
    console.log(`🔍 적합한 과목을 찾는 중... (총 ${courses.length}개 과목 검토)`)
      
    const eligible = courses.filter(course => {
        const courseInfo = getCourseInfo(course)
        
        // 1. 이미 선택된 과목 제외
        if (selectedCourses.includes(course)) {
          return false
        }
        
        // 2. 중복 과목명 제외
        if (isDuplicateCourseName(course, selectedCourses)) {
          return false
        }
        
        // 3. 시간 충돌 제외
        if (hasTimeConflict(course, selectedCourses)) {
          return false
        }
        
        // 4. 학점이 0인 과목 제외
        if (getCreditFromCourse(course) <= 0) {
          return false
        }
        
        // 5. 빈 과목명 제외
        if (!courseInfo.name || courseInfo.name.trim() === '') {
          return false
        }
      
      // 6. 학년별 수강 가능성 검사
      if (!isEligibleGradeForCourse(course, settings.grade)) {
          return false
        }
        
        return true
      })
      
      console.log(`   - 적합한 과목: ${eligible.length}개`)
      return eligible
    }

  // URL에서 설정값들을 가져오기
  useEffect(() => {
    const grade = searchParams.get('grade') || ''
    const espLevel = searchParams.get('espLevel') || ''
    const mnLevel = searchParams.get('mnLevel') || ''
    const credits = searchParams.get('credits') || ''
    const track = searchParams.get('track') || ''
    
    if (grade && espLevel && mnLevel && credits && track) {
      loadCoursesAndGenerate(grade, espLevel, mnLevel, credits, track)
    }
  }, [searchParams])

  // 과목 데이터 로드 및 시간표 생성
  const loadCoursesAndGenerate = async (grade: string, espLevel: string, mnLevel: string, credits: string, track: string) => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/courses')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.courses && Array.isArray(data.courses)) {
        setCourses(data.courses)
        generateTimetables(data.courses, { grade, espLevel, mnLevel, credits, track })
      }
    } catch (error) {
      console.error('과목 데이터 로드 중 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  // 시도별 영역 우선순위 설정 - 더 극명한 차이 만들기
  const getAreaPriorities = (attempt: number): string[] => {
    switch (attempt) {
      case 1: 
        // 트랙 전공 집중형 - EL과 관련 과목 우선
        return ['EL', 'EF', 'MN', 'GE', 'MS', 'VC', 'ESP']
      case 2: 
        // 균형 잡힌 교양형 - GE, MS 우선
        return ['GE', 'MS', 'VC', 'EF', 'EL', 'MN', 'ESP']
      case 3: 
        // 실용 중심형 - 실무/취업 관련 과목 우선
        return ['MS', 'EF', 'GE', 'EL', 'VC', 'MN', 'ESP']
      default: 
        return ['GE', 'EL', 'MS', 'EF', 'VC', 'ESP', 'MN']
    }
  }

  // 카드 확장/축소 토글
  const toggleCardExpansion = (timetableId: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(timetableId)) {
        newSet.delete(timetableId)
      } else {
        newSet.add(timetableId)
      }
      return newSet
    })
  }

  // 2번: 5가지 질문 우선 시간표 생성 함수
  const generateTimetables = (allCourses: Course[], settings: AISettings) => {
    console.log('🎯 AI 시간표 생성 시작:', settings)
    
    const creditRange = getCreditRange(settings.credits, parseInt(settings.grade))
    const gradeNum = parseInt(settings.grade)
    const timetables: GeneratedTimetable[] = []

    // 5가지 질문 우선 시간표 생성 (학년별 조건은 보완적 적용)
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`\n📝 시간표 ${attempt} 생성 중...`)
      
      const selectedCourses: Course[] = []
      let currentCredits = 0
      
      // 1단계: 5가지 질문 기반 영역 우선순위 설정
      const areaPriorities = getAreaPriorities(attempt)
      console.log(`   🎯 영역 우선순위:`, areaPriorities.join(' → '))
      
      // 2단계: 학년별 상세 필수 조건 적용
      console.log('   📚 학년별 상세 필수 조건 적용 중...')
        const mandatoryCourses = getMandatoryCourses(allCourses, settings)
      
        for (const course of mandatoryCourses) {
          if (!selectedCourses.includes(course) && 
            !isDuplicateCourseName(course, selectedCourses) &&
            !hasTimeConflict(course, selectedCourses)) {
            selectedCourses.push(course)
            currentCredits += getCreditFromCourse(course)
          const courseInfo = getCourseInfo(course)
          console.log(`   ✅ 필수: ${courseInfo.name} (${getCreditFromCourse(course)}학점) [${courseInfo.area}]`)
        }
      }
      
      // 3단계: 각 영역별 과목 선택 (남은 학점 채우기)
      console.log(`   📋 현재 ${currentCredits}학점, 목표 ${creditRange.target}학점`)
      
      if (currentCredits < creditRange.target) {
        console.log('   🎯 5가지 질문 우선순위로 남은 과목 선택 중...')
        
        for (const area of areaPriorities) {
          if (currentCredits >= creditRange.target) break
          
          // 2학년의 경우 EF는 이미 4학점 필수로 선택했으므로 추가 선택 금지
          if (gradeNum === 2 && area === 'EF') {
            const currentEFCredits = selectedCourses
              .filter(course => getCourseInfo(course).area === 'EF')
              .reduce((sum, course) => sum + getCreditFromCourse(course), 0)
            
            if (currentEFCredits >= 4) {
              console.log(`   ⚠️ 2학년 EF는 이미 ${currentEFCredits}학점 선택됨 (4학점 충족) - 추가 선택 스킵`)
              continue
            }
          }
          
          // 3학년의 경우 EL은 이미 8학점 필수로 선택했으므로 추가 선택 금지 (20학점 제외)
          if (gradeNum === 3 && area === 'EL' && creditRange.target < 20) {
            const currentELCredits = selectedCourses
              .filter(course => getCourseInfo(course).area === 'EL')
              .reduce((sum, course) => sum + getCreditFromCourse(course), 0)
            
            if (currentELCredits >= 8) {
              console.log(`   ⚠️ 3학년 EL은 이미 ${currentELCredits}학점 선택됨 (8학점 충족) - 추가 선택 스킵 (16학점)`)
              continue
            }
          }
          
          // 3학년의 경우 EN/HASS는 이미 4학점 필수로 선택했으므로 추가 선택 금지
          if (gradeNum === 3 && (area === 'EN' || area === 'HASS')) {
            const currentENHASSCredits = selectedCourses
              .filter(course => {
                const courseInfo = getCourseInfo(course)
                return courseInfo.area === 'EN' || courseInfo.area === 'HASS'
              })
              .reduce((sum, course) => sum + getCreditFromCourse(course), 0)
            
            if (currentENHASSCredits >= 4) {
              console.log(`   ⚠️ 3학년 EN/HASS는 이미 ${currentENHASSCredits}학점 선택됨 (4학점 충족) - 추가 선택 스킵`)
              continue
            }
          }
          
          // 3학년의 경우 EF는 필수가 아니므로 기본 16학점에서는 선택 금지 (20학점에서만 허용)
          if (gradeNum === 3 && area === 'EF' && creditRange.target < 20) {
            console.log(`   ⚠️ 3학년 EF는 16학점에서 필수가 아님 - 추가 선택 스킵 (20학점에서만 허용)`)
            continue
          }
          
          // 4학년의 경우 EF는 필수가 아니므로 선택 금지
          if (gradeNum === 4 && area === 'EF') {
            console.log(`   ⚠️ 4학년 EF는 필수가 아님 - 추가 선택 스킵 (ESP+MN수료+CAPS+EL 구성)`)
            continue
          }
          
          // 4학년의 경우 MN은 수료 상태이므로 추가 선택 금지
          if (gradeNum === 4 && area === 'MN') {
            console.log(`   ⚠️ 4학년 MN은 수료 상태 - 추가 선택 스킵 (MN 과목 불필요)`)
            continue
          }
          
          // 4학년의 경우 MN은 이미 1개 필수로 선택했으므로 추가 선택 금지
          if (gradeNum === 4 && area === 'MN') {
            const currentMNCredits = selectedCourses
              .filter(course => getCourseInfo(course).area === 'MN')
              .reduce((sum, course) => sum + getCreditFromCourse(course), 0)
            
            if (currentMNCredits >= 4) {
              console.log(`   ⚠️ 4학년 MN은 이미 ${currentMNCredits}학점 선택됨 (4학점 충족) - 추가 선택 스킵`)
              continue
            }
          }
          
          const areaCourses = allCourses.filter(course => {
            const courseInfo = getCourseInfo(course)
            return courseInfo.area === area &&
                   !selectedCourses.includes(course) &&
                   !isDuplicateCourseName(course, selectedCourses) &&
                   !hasTimeConflict(course, selectedCourses) &&
                   isEligibleGradeForCourse(course, settings.grade) &&
                   getCreditFromCourse(course) > 0
          })
          
          // EL 영역은 트랙 우선, 학년별 필터링 적용
          let prioritizedCourses = areaCourses
          if (area === 'EL') {
            prioritizedCourses = getELCoursesByTrack(settings.track, areaCourses)
            
            // 학년별 필터링 적용
            if (gradeNum <= 3) {
              // 1-3학년: 해당 학년만
              prioritizedCourses = prioritizedCourses.filter(course => {
                const courseInfo = getCourseInfo(course)
                return courseInfo.grade === gradeNum.toString()
              })
            } else if (gradeNum === 4) {
              // 4학년: 3-4학년만
              prioritizedCourses = prioritizedCourses.filter(course => {
                const courseInfo = getCourseInfo(course)
                return courseInfo.grade === '3' || courseInfo.grade === '4'
              })
            }
          }
          
          for (const course of prioritizedCourses) {
          const courseCredits = getCreditFromCourse(course)
            if (currentCredits + courseCredits <= creditRange.max) {
            selectedCourses.push(course)
            currentCredits += courseCredits
              console.log(`   ✅ ${area}: ${getCourseInfo(course).name} (${courseCredits}학점)`)
              
              if (currentCredits >= creditRange.target) break
            }
          }
        }
      }
      
      // 4단계: 미달시 추가 과목 선택
      if (currentCredits < creditRange.min) {
        console.log(`   ⚠️ 학점 미달 (${currentCredits}/${creditRange.min}), 추가 과목 선택 중...`)
        
        const remainingCourses = allCourses.filter(course => {
          const courseInfo = getCourseInfo(course)
          
          // 2학년의 경우 EF는 4학점 제한
          if (gradeNum === 2 && courseInfo.area === 'EF') {
            const currentEFCredits = selectedCourses
              .filter(c => getCourseInfo(c).area === 'EF')
              .reduce((sum, c) => sum + getCreditFromCourse(c), 0)
            
            if (currentEFCredits >= 4) {
              return false
            }
          }
          
          // 3학년의 경우 EF는 16학점에서 필수가 아니므로 제한 (20학점에서만 허용)
          if (gradeNum === 3 && courseInfo.area === 'EF' && creditRange.target < 20) {
            return false
          }
          
          // 4학년의 경우 EF는 필수가 아니므로 제한
          if (gradeNum === 4 && courseInfo.area === 'EF') {
            return false
          }
          
          // 4학년의 경우 MN은 수료 상태이므로 제한
          if (gradeNum === 4 && courseInfo.area === 'MN') {
            return false
          }
          
          return !selectedCourses.includes(course) &&
                 !isDuplicateCourseName(course, selectedCourses) &&
                 !hasTimeConflict(course, selectedCourses) &&
                 isEligibleGradeForCourse(course, settings.grade) &&
                 getCreditFromCourse(course) > 0
        })
        
        for (const course of remainingCourses) {
          const courseCredits = getCreditFromCourse(course)
          if (currentCredits + courseCredits <= creditRange.max) {
            selectedCourses.push(course)
            currentCredits += courseCredits
            console.log(`   ✅ 추가: ${getCourseInfo(course).name} (${courseCredits}학점)`)
            
            if (currentCredits >= creditRange.min) break
          }
        }
      }
      
      // 시간표 생성
      const benefits = getTimetableBenefits(selectedCourses, settings)
      
        timetables.push({
        id: attempt,
        name: `AI 시간표 ${attempt}`,
        courses: selectedCourses,
        totalCredits: currentCredits,
        benefits: benefits
      })
      
      console.log(`   ✅ 시간표 ${attempt} 완료: ${selectedCourses.length}개 과목, ${currentCredits}학점`)
    }

    console.log(`\n✅ 총 ${timetables.length}개의 시간표 생성 완료!`)
    setGeneratedTimetables(timetables)
  }

  // 학년별 상세 필수 과목 선택 함수
  const getMandatoryCourses = (allCourses: Course[], settings: AISettings): Course[] => {
    const mandatory: Course[] = []
    const gradeNum = parseInt(settings.grade)
    const creditRange = getCreditRange(settings.credits, gradeNum)
    
    console.log(`📚 ${gradeNum}학년 필수 과목 선택 시작`)

    if (gradeNum === 1) {
      // 1학년: RC(1) + ESP Foundation 1(0) + MN1001(4) + VC(4) + EF(8: Data Literacy + Calculus) = 17학점 고정
      console.log('   🎯 1학년 필수 과목 구성 (17학점 고정)')
      
      // RC 과목 (1학점)
      const rcCourse = allCourses.find(course => {
        const courseInfo = getCourseInfo(course)
        return courseInfo.area === 'RC' || courseInfo.code?.includes('RC')
      })
      if (rcCourse) {
        mandatory.push(rcCourse)
        console.log(`   ✅ RC: ${getCourseInfo(rcCourse).name}`)
      }

      // ESP Foundation 1 (0학점)
      const espFoundation = allCourses.find(course => {
        const courseInfo = getCourseInfo(course)
        return courseInfo.name.includes('ESP Foundation 1') || courseInfo.code?.includes('ESP Foundation 1')
      })
      if (espFoundation) {
        mandatory.push(espFoundation)
        console.log(`   ✅ ESP Foundation 1: ${getCourseInfo(espFoundation).name}`)
      }

      // MN1001 (4학점)
      const mn1001 = allCourses.find(course => {
        const courseInfo = getCourseInfo(course)
        return courseInfo.code === 'MN1001'
      })
      if (mn1001) {
        mandatory.push(mn1001)
        console.log(`   ✅ MN1001: ${getCourseInfo(mn1001).name}`)
      }

      // VC 과목 (4학점)
      const vcCourse = allCourses.find(course => {
        const courseInfo = getCourseInfo(course)
        return courseInfo.area === 'VC'
      })
      if (vcCourse) {
        mandatory.push(vcCourse)
        console.log(`   ✅ VC: ${getCourseInfo(vcCourse).name}`)
      }

      // EF 과목 2개 (Data Literacy Foundations + Calculus for engineers, 각 4학점)
      const dataLiteracy = allCourses.find(course => {
        const courseInfo = getCourseInfo(course)
        return courseInfo.name.includes('Data Literacy') || courseInfo.name.includes('Data')
      })
      if (dataLiteracy) {
        mandatory.push(dataLiteracy)
        console.log(`   ✅ EF-Data: ${getCourseInfo(dataLiteracy).name}`)
      }

      const calculus = allCourses.find(course => {
        const courseInfo = getCourseInfo(course)
        return courseInfo.name.includes('Calculus') || courseInfo.name.includes('calculus')
      })
      if (calculus) {
        mandatory.push(calculus)
        console.log(`   ✅ EF-Calculus: ${getCourseInfo(calculus).name}`)
      }

    } else if (gradeNum === 2) {
      // 2학년: ESP 선택 레벨(0) + MN 선택(4) + EL(8, 2학년만, 트랙 우선) + EF 선택(4)
      console.log('   🎯 2학년 필수 과목 구성')
    
    // ESP 과목 (수료가 아닌 경우)
    if (!isESPCompleted(settings.espLevel)) {
      const espCourseCode = getESPCourseCode(settings.espLevel)
      if (espCourseCode) {
        const espCourse = allCourses.find(course => {
      const courseInfo = getCourseInfo(course)
          return courseInfo.code === espCourseCode
        })
        if (espCourse) {
          mandatory.push(espCourse)
            console.log(`   ✅ ESP: ${getCourseInfo(espCourse).name}`)
          } else {
            console.log(`   ❌ ESP 과목 찾을 수 없음: ${espCourseCode}`)
        }
        } else {
          console.log(`   ⚠️ ESP 레벨에 해당하는 과목코드 없음: ${settings.espLevel}`)
      }
    }
    
      // MN 과목 (수료가 아닌 경우, 선택한 레벨)
    if (!isMNCompleted(settings.mnLevel)) {
      const mnCourseCode = getMNCourseCode(settings.mnLevel)
      if (mnCourseCode) {
        const mnCourse = allCourses.find(course => {
      const courseInfo = getCourseInfo(course)
          return courseInfo.code === mnCourseCode
        })
        if (mnCourse) {
          mandatory.push(mnCourse)
            console.log(`   ✅ MN: ${getCourseInfo(mnCourse).name}`)
          } else {
            console.log(`   ❌ MN 과목 찾을 수 없음: ${mnCourseCode}`)
          }
        } else {
          console.log(`   ⚠️ MN 레벨에 해당하는 과목코드 없음: ${settings.mnLevel}`)
        }
      }

      // EL 과목 8학점 (2학년 과목만, 트랙 우선) - 디버깅 강화
      console.log(`   🔍 2학년 EL 과목 검색 중... (선택 트랙: ${settings.track})`)
      const all2GradeELCourses = allCourses.filter(course => {
        const courseInfo = getCourseInfo(course)
        return courseInfo.area === 'EL'
      })
      
      console.log(`   📊 전체 EL 과목: ${all2GradeELCourses.length}개`)
      
      // 2학년 과목 필터링 (학년 정보 디버깅)
      const grade2ELCourses = all2GradeELCourses.filter(course => {
        const courseInfo = getCourseInfo(course)
        console.log(`   🔍 EL 과목 학년 검사: ${courseInfo.name} - 학년값: "${courseInfo.grade}"`)
        return courseInfo.grade === '2' || courseInfo.grade === '2학년' || courseInfo.grade.includes('2')
      })

      console.log(`   📊 2학년 EL 과목: ${grade2ELCourses.length}개`)

      // 트랙 우선 선택 (트랙 정보 디버깅)
      let trackFilteredELCourses = grade2ELCourses
      if (settings.track !== '선택안함') {
        trackFilteredELCourses = grade2ELCourses.filter(course => {
          const courseInfo = getCourseInfo(course)
          console.log(`   🔍 트랙 검사: ${courseInfo.name} - 트랙값: "${courseInfo.track}"`)
          return !courseInfo.track || courseInfo.track.includes(settings.track)
        })
        console.log(`   📊 트랙 필터링 후 EL 과목: ${trackFilteredELCourses.length}개`)
      }

      let elCredits = 0
      for (const course of trackFilteredELCourses) {
        if (elCredits >= 8) break
        mandatory.push(course)
        elCredits += getCreditFromCourse(course)
        console.log(`   ✅ EL(2학년): ${getCourseInfo(course).name} (${getCreditFromCourse(course)}학점)`)
      }

      // EF 과목 중 하나 선택 (EF2007, EF2008, EF2039) - 디버깅 강화
      console.log(`   🔍 EF 과목 검색 중...`)
      const efCodes = ['EF2007', 'EF2008', 'EF2039']
      let efFound = false
      for (const efCode of efCodes) {
        const efCourse = allCourses.find(course => {
          const courseInfo = getCourseInfo(course)
          console.log(`   🔍 EF 코드 검사: ${courseInfo.name} - 코드: "${courseInfo.code}"`)
          return courseInfo.code === efCode
        })
        if (efCourse) {
          mandatory.push(efCourse)
          console.log(`   ✅ EF: ${getCourseInfo(efCourse).name}`)
          efFound = true
          break
        }
      }
      if (!efFound) {
        console.log(`   ❌ EF 과목 찾을 수 없음: ${efCodes.join(', ')}`)
      }

      // 20학점인 경우 추가 과목
      if (creditRange.target >= 20) {
        console.log('   🎯 20학점 - 추가 과목 선택')
        // 추가 EF 또는 EL 과목 하나 더
      }

    } else if (gradeNum === 3) {
      // 3학년: ESP 선택 레벨(0) + IR1(4) + EL(8, 3학년만, 트랙 우선) + EN/HASS(4, 둘 중 하나)
      console.log('   🎯 3학년 필수 과목 구성')

      // ESP 과목 (수료가 아닌 경우)
      if (!isESPCompleted(settings.espLevel)) {
        const espCourseCode = getESPCourseCode(settings.espLevel)
        if (espCourseCode) {
          const espCourse = allCourses.find(course => {
            const courseInfo = getCourseInfo(course)
            return courseInfo.code === espCourseCode
          })
          if (espCourse) {
            mandatory.push(espCourse)
            console.log(`   ✅ ESP: ${getCourseInfo(espCourse).name}`)
          } else {
            console.log(`   ❌ ESP 과목 찾을 수 없음: ${espCourseCode}`)
          }
        }
      }

      // IR1 필수 (4학점) - 디버깅 강화
      console.log(`   🔍 IR1 과목 검색 중...`)
      const ir1Course = allCourses.find(course => {
        const courseInfo = getCourseInfo(course)
        console.log(`   🔍 IR1 검사: ${courseInfo.name} - 코드: "${courseInfo.code}"`)
        return courseInfo.name.includes('IR1') || 
               courseInfo.code?.includes('IR1') ||
               courseInfo.name.includes('Individual Research 1') ||
               courseInfo.code === 'IR1'
      })
      if (ir1Course) {
        mandatory.push(ir1Course)
        console.log(`   ✅ IR1(필수): ${getCourseInfo(ir1Course).name}`)
      } else {
        console.log(`   ❌ IR1 과목 찾을 수 없음`)
      }

      // EL 과목 8학점 (3학년 과목만, 트랙 우선, 필수) - 디버깅 강화
      console.log(`   🔍 3학년 EL 과목 검색 중... (선택 트랙: ${settings.track})`)
      const all3GradeELCourses = allCourses.filter(course => {
        const courseInfo = getCourseInfo(course)
        return courseInfo.area === 'EL'
      })
      
      console.log(`   📊 전체 EL 과목: ${all3GradeELCourses.length}개`)
      
      const grade3ELCourses = all3GradeELCourses.filter(course => {
        const courseInfo = getCourseInfo(course)
        console.log(`   🔍 EL 과목 학년 검사: ${courseInfo.name} - 학년값: "${courseInfo.grade}"`)
        return courseInfo.grade === '3' || courseInfo.grade === '3학년' || courseInfo.grade.includes('3')
      })

      console.log(`   📊 3학년 EL 과목: ${grade3ELCourses.length}개`)

      // 트랙 우선 선택
      let trackFiltered3ELCourses = grade3ELCourses
      if (settings.track !== '선택안함') {
        trackFiltered3ELCourses = grade3ELCourses.filter(course => {
          const courseInfo = getCourseInfo(course)
          console.log(`   🔍 트랙 검사: ${courseInfo.name} - 트랙값: "${courseInfo.track}"`)
          return !courseInfo.track || courseInfo.track.includes(settings.track)
        })
        console.log(`   📊 트랙 필터링 후 EL 과목: ${trackFiltered3ELCourses.length}개`)
      }

      let elCredits = 0
      for (const course of trackFiltered3ELCourses) {
        if (elCredits >= 8) break
        mandatory.push(course)
        elCredits += getCreditFromCourse(course)
        console.log(`   ✅ EL(3학년,필수): ${getCourseInfo(course).name} (${getCreditFromCourse(course)}학점)`)
      }

      // EN 또는 HASS 중 하나 필수 (4학점) - 디버깅 강화
      console.log(`   🔍 EN/HASS 과목 검색 중...`)
      const enCourse = allCourses.find(course => {
        const courseInfo = getCourseInfo(course)
        console.log(`   🔍 EN 검사: ${courseInfo.name} - 영역: "${courseInfo.area}"`)
        return courseInfo.area === 'EN'
      })
      const hassCourse = allCourses.find(course => {
        const courseInfo = getCourseInfo(course)
        console.log(`   🔍 HASS 검사: ${courseInfo.name} - 영역: "${courseInfo.area}"`)
        return courseInfo.area === 'HASS'
      })

      if (enCourse) {
        mandatory.push(enCourse)
        console.log(`   ✅ EN(필수): ${getCourseInfo(enCourse).name}`)
      } else if (hassCourse) {
        mandatory.push(hassCourse)
        console.log(`   ✅ HASS(필수): ${getCourseInfo(hassCourse).name}`)
      } else {
        console.log(`   ❌ EN/HASS 과목 찾을 수 없음`)
      }

      // 20학점인 경우 추가 과목
      if (creditRange.target >= 20) {
        console.log('   🎯 20학점 - 추가 EL 또는 EF 선택')
        // 추가 3학년 EL 또는 EF(EF2007/EF2008/EF2039) 중 하나
      }

    } else if (gradeNum === 4) {
      // 4학년: ESP 선택 레벨 + MN X + CAPS 필수 + EL(최소 8학점, 3-4학년)
      console.log('   🎯 4학년 필수 과목 구성')

      // ESP 과목 (수료가 아닌 경우)
      if (!isESPCompleted(settings.espLevel)) {
        const espCourseCode = getESPCourseCode(settings.espLevel)
        if (espCourseCode) {
          const espCourse = allCourses.find(course => {
            const courseInfo = getCourseInfo(course)
            return courseInfo.code === espCourseCode
          })
          if (espCourse) {
            mandatory.push(espCourse)
            console.log(`   ✅ ESP: ${getCourseInfo(espCourse).name}`)
          } else {
            console.log(`   ❌ ESP 과목 찾을 수 없음: ${espCourseCode}`)
          }
        }
      }

      // CAPS 필수 - 디버깅 강화
      console.log(`   🔍 CAPS 과목 검색 중...`)
      const capsCourse = allCourses.find(course => {
        const courseInfo = getCourseInfo(course)
        console.log(`   🔍 CAPS 검사: ${courseInfo.name} - 영역: "${courseInfo.area}", 코드: "${courseInfo.code}"`)
        return courseInfo.area === 'CAPS' || 
               courseInfo.code?.includes('CAPS') ||
               courseInfo.name.includes('CAPS') ||
               courseInfo.name.includes('Capstone')
      })
      if (capsCourse) {
        mandatory.push(capsCourse)
        console.log(`   ✅ CAPS(필수): ${getCourseInfo(capsCourse).name}`)
      } else {
        console.log(`   ❌ CAPS 과목 찾을 수 없음`)
      }

      // EL 과목 최소 8학점 (3-4학년 과목만) - 디버깅 강화
      console.log(`   🔍 4학년 EL 과목 검색 중... (선택 트랙: ${settings.track})`)
      const all4GradeELCourses = allCourses.filter(course => {
        const courseInfo = getCourseInfo(course)
        return courseInfo.area === 'EL'
      })
      
      console.log(`   📊 전체 EL 과목: ${all4GradeELCourses.length}개`)
      
      const grade34ELCourses = all4GradeELCourses.filter(course => {
        const courseInfo = getCourseInfo(course)
        console.log(`   🔍 EL 과목 학년 검사: ${courseInfo.name} - 학년값: "${courseInfo.grade}"`)
        return courseInfo.grade === '3' || courseInfo.grade === '4' || 
               courseInfo.grade === '3학년' || courseInfo.grade === '4학년' ||
               courseInfo.grade.includes('3') || courseInfo.grade.includes('4')
      })

      console.log(`   📊 3-4학년 EL 과목: ${grade34ELCourses.length}개`)

      // 트랙 우선 선택
      let trackFiltered34ELCourses = grade34ELCourses
      if (settings.track !== '선택안함') {
        trackFiltered34ELCourses = grade34ELCourses.filter(course => {
          const courseInfo = getCourseInfo(course)
          console.log(`   🔍 트랙 검사: ${courseInfo.name} - 트랙값: "${courseInfo.track}"`)
          return !courseInfo.track || courseInfo.track.includes(settings.track)
        })
        console.log(`   📊 트랙 필터링 후 EL 과목: ${trackFiltered34ELCourses.length}개`)
      }

      let elCredits = 0
      for (const course of trackFiltered34ELCourses) {
        if (elCredits >= 8) break
        mandatory.push(course)
        elCredits += getCreditFromCourse(course)
        console.log(`   ✅ EL(3-4학년,필수): ${getCourseInfo(course).name} (${getCreditFromCourse(course)}학점)`)
      }

      console.log('   ⚠️ 4학년은 MN 과목 제외 (수료 상태)')
    }

    console.log(`📚 ${gradeNum}학년 필수 과목 선택 완료: ${mandatory.length}개 과목`)
    return mandatory
  }

  // 시간표 혜택 분석
  const getTimetableBenefits = (courses: Course[], settings: AISettings): string[] => {
    const benefits: string[] = []
    
    // 각 요일별 시간 분석을 위한 데이터 구조
    const dailySchedule: { [day: string]: { startTime: string, endTime: string }[] } = {
      '월': [],
      '화': [],
      '수': [],
      '목': [],
      '금': []
    }
    
    // 과목별 시간 정보를 요일별로 분류
    courses.forEach(course => {
      const courseInfo = getCourseInfo(course)
      const timeSlots = parseTimeSlots(courseInfo.time)
      
      timeSlots.forEach(slot => {
        if (dailySchedule[slot.day]) {
          dailySchedule[slot.day].push({
            startTime: slot.startTime,
            endTime: slot.endTime
          })
        }
      })
    })
    
    // 요일별로 정렬
    Object.keys(dailySchedule).forEach(day => {
      dailySchedule[day].sort((a, b) => a.startTime.localeCompare(b.startTime))
    })
    
    // 1. 아침 수업 분석 (매일 11시 전에 수업이 없는지)
    const hasEarlyClasses = Object.values(dailySchedule).some(dayClasses => 
      dayClasses.some(timeSlot => {
        const startHour = parseInt(timeSlot.startTime.split(':')[0])
        return startHour < 11
      })
    )
    
    if (!hasEarlyClasses) {
      benefits.push('🛏️ 아침에 일어나기 힘든 학생들을 위한 시간표!')
    }
    
    // 2. 점심시간 분석 (11시~13시 사이에 매일 수업이 없는지)
    const hasLunchTimeClasses = Object.values(dailySchedule).some(dayClasses =>
      dayClasses.some(timeSlot => {
        const startHour = parseInt(timeSlot.startTime.split(':')[0])
        const endHour = parseInt(timeSlot.endTime.split(':')[0])
        const endMinute = parseInt(timeSlot.endTime.split(':')[1])
        
        // 11시~13시 사이에 겹치는 수업이 있는지 확인
        return (startHour >= 11 && startHour < 13) || 
               (endHour > 11 && (endHour < 13 || (endHour === 13 && endMinute === 0)))
      })
    )
    
    if (!hasLunchTimeClasses) {
      benefits.push('🍽️ 매일 학식을 챙겨먹을 수 있어요!')
    }
    
    // 3. 공강일 분석
    const freeDays = Object.keys(dailySchedule).filter(day => dailySchedule[day].length === 0)
    if (freeDays.length > 0) {
      benefits.push(`📅 ${freeDays.join(', ')}요일 완전 공강!`)
    }
    
    // 4. 연강 분석
    let hasConsecutiveClasses = false
    Object.values(dailySchedule).forEach(dayClasses => {
      for (let i = 0; i < dayClasses.length - 1; i++) {
        const currentEnd = dayClasses[i].endTime
        const nextStart = dayClasses[i + 1].startTime
        
        // 시간이 바로 이어지는 경우 (연강)
        if (currentEnd === nextStart) {
          hasConsecutiveClasses = true
          break
        }
      }
    })
    
    if (hasConsecutiveClasses) {
      benefits.push('⚡ 연강으로 효율적인 시간 활용!')
    }
    
    // 5. 오후 수업 분석
    const hasAfternoonOnly = Object.values(dailySchedule).every(dayClasses => {
      if (dayClasses.length === 0) return true // 공강일은 제외
      return dayClasses.every(timeSlot => {
        const startHour = parseInt(timeSlot.startTime.split(':')[0])
        return startHour >= 13
      })
    })
    
    if (hasAfternoonOnly && !freeDays.includes('월') && !freeDays.includes('화') && !freeDays.includes('수') && !freeDays.includes('목') && !freeDays.includes('금')) {
      benefits.push('🌅 오후에만 수업이 있어 여유로운 오전!')
    }
    
    // 6. 저녁 수업 분석
    const hasEveningClasses = Object.values(dailySchedule).some(dayClasses =>
      dayClasses.some(timeSlot => {
        const startHour = parseInt(timeSlot.startTime.split(':')[0])
        return startHour >= 18
      })
    )
    
    if (hasEveningClasses) {
      benefits.push('🌙 저녁 수업 포함 - 야간 학습 스타일!')
    }
    
    // 7. 주 3일 이하 등교
    const activeDays = Object.keys(dailySchedule).filter(day => dailySchedule[day].length > 0)
    if (activeDays.length <= 3) {
      benefits.push(`📚 주 ${activeDays.length}일만 등교하면 OK!`)
    }
    
    // 8. 균등한 학습 분산
    const coursesPerDay = Object.values(dailySchedule).map(dayClasses => dayClasses.length)
    const maxCoursesPerDay = Math.max(...coursesPerDay)
    const minCoursesPerDay = Math.min(...coursesPerDay.filter(count => count > 0))
    
    if (maxCoursesPerDay - minCoursesPerDay <= 1 && activeDays.length >= 4) {
      benefits.push('⚖️ 요일별 수업량이 고르게 분산!')
    }
    
    // 9. 트랙 전공 집중도
    if (settings.track && settings.track !== '선택안함') {
      const trackCourses = courses.filter(course => {
      const courseInfo = getCourseInfo(course)
        return courseInfo.area === 'EL' && courseInfo.track?.includes(settings.track)
      })
      
      const trackCredits = trackCourses.reduce((sum, course) => sum + getCreditFromCourse(course), 0)
      
      if (trackCredits >= 8) {
        benefits.push(`🎯 ${settings.track} 트랙 집중 편성!`)
      }
    }
    
    // 10. 학점 범위 분석
    const totalCredits = courses.reduce((sum, course) => sum + getCreditFromCourse(course), 0)
    const creditRange = getCreditRange(settings.credits, parseInt(settings.grade))
    
    if (totalCredits === creditRange.target) {
      benefits.push('💯 목표 학점에 딱 맞는 구성!')
    } else if (totalCredits >= creditRange.min && totalCredits <= creditRange.max) {
      benefits.push('✅ 적정 학점 범위 내 완벽 구성!')
    }
    
    return benefits
  }

  // 6번: 시간표 상세보기 함수
  const handleTimetableSelect = (timetable: GeneratedTimetable) => {
    setSelectedTimetable(timetable)
    setShowDetailView(true)
    setCustomTimetableName(timetable.name)
    console.log(`🔍 시간표 ${timetable.id} 상세보기 열림`)
  }

  // 6번: 시간표 상세보기 닫기
  const closeDetailView = () => {
    setShowDetailView(false)
    setSelectedTimetable(null)
    setCustomTimetableName('')
  }

  // 7번: 시간표 저장 다이얼로그 열기
  const openSaveDialog = () => {
    setShowSaveDialog(true)
  }

  // 7번: 시간표 저장 다이얼로그 닫기
  const closeSaveDialog = () => {
    setShowSaveDialog(false)
    setCustomTimetableName(selectedTimetable?.name || '')
  }

  // 7번: 시간표 저장 함수
  const handleSaveTimetable = async () => {
    if (!selectedTimetable) return
    
    try {
      console.log(`💾 시간표 저장 중: ${customTimetableName}`)
      
      // localStorage에 저장
    const savedTimetables = JSON.parse(localStorage.getItem('savedTimetables') || '[]')
      const newSavedTimetable = {
        ...selectedTimetable,
        name: customTimetableName,
        savedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        semester: '2025-1학기',
        settings: settings
      }
      
      savedTimetables.push(newSavedTimetable)
    localStorage.setItem('savedTimetables', JSON.stringify(savedTimetables))

      console.log(`✅ 시간표 저장 완료: ${customTimetableName}`)
      
      // 저장 날짜를 포함한 성공 메시지 표시 후 다이얼로그 닫기
      try {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const savedDate = `${year}년 ${month}월 ${day}일`
        
        alert(`나의 페이지에 시간표가 저장되었습니다 (${savedDate})`)
      } catch (dateError) {
        console.error('날짜 형식 오류:', dateError)
        alert('나의 페이지에 시간표가 저장되었습니다')
      }
      closeSaveDialog()
      
    } catch (error) {
      console.error('시간표 저장 중 오류:', error)
      alert('시간표 저장 중 오류가 발생했습니다.')
    }
  }

  // 6번: 시간표 격자 생성 함수
  const generateTimetableGrid = (courses: Course[]) => {
    const days = ['월', '화', '수', '목', '금']
    const timeSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', 
      '18:00', '18:30', '19:00'
    ]
    
    // 시간 슬롯별 과목 정보 생성
    const courseTimeSlots: { day: string, startTime: string, endTime: string, course: Course }[] = []
    
    courses.forEach(course => {
      const courseInfo = getCourseInfo(course)
      const slots = parseTimeSlots(courseInfo.time)
      
      slots.forEach(slot => {
        courseTimeSlots.push({
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          course: course
        })
      })
    })
    
    // 시간 슬롯 위치 계산 함수
    const getTimeSlotPosition = (startTime: string): number => {
      const index = timeSlots.indexOf(startTime)
      return index === -1 ? 0 : index
    }
    
    // 시간 슬롯 높이 계산 함수
    const getTimeSlotHeight = (startTime: string, endTime: string): number => {
      const start = timeSlots.indexOf(startTime)
      const end = timeSlots.indexOf(endTime)
      if (start === -1 || end === -1) return 1
      return end - start
    }
    
    // 영역별 색상 함수
    const getColorByArea = (area: string): string => {
      const areaColors: { [key: string]: string } = {
        'GE': 'bg-gradient-to-br from-blue-100 to-blue-200 border-l-blue-500 text-blue-800',
        'EF': 'bg-gradient-to-br from-green-100 to-green-200 border-l-green-500 text-green-800',
        'EL': 'bg-gradient-to-br from-cyan-100 to-cyan-200 border-l-cyan-500 text-cyan-800',
        'MS': 'bg-gradient-to-br from-purple-100 to-purple-200 border-l-purple-500 text-purple-800',
        'VC': 'bg-gradient-to-br from-orange-100 to-orange-200 border-l-orange-500 text-orange-800',
        'ESP': 'bg-gradient-to-br from-rose-100 to-rose-200 border-l-rose-500 text-rose-800',
        'MN': 'bg-gradient-to-br from-teal-100 to-teal-200 border-l-teal-500 text-teal-800',
        'EN': 'bg-gradient-to-br from-indigo-100 to-indigo-200 border-l-indigo-500 text-indigo-800',
        'HASS': 'bg-gradient-to-br from-pink-100 to-pink-200 border-l-pink-500 text-pink-800',
        'RC': 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-l-yellow-500 text-yellow-800',
        'CAPS': 'bg-gradient-to-br from-red-100 to-red-200 border-l-red-500 text-red-800',
        'default': 'bg-gradient-to-br from-gray-100 to-gray-200 border-l-gray-500 text-gray-800'
      }
      return areaColors[area] || areaColors['default']
    }
    
    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
        {/* 헤더 */}
        <div className="grid grid-cols-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="p-4 text-sm font-semibold text-gray-700 text-center border-r border-gray-200 bg-gray-100">
            시간
          </div>
          {days.map(day => (
            <div key={day} className="p-4 text-sm font-semibold text-gray-700 text-center border-r border-gray-200 last:border-r-0">
              {day}요일
            </div>
          ))}
        </div>
        
        {/* 시간표 그리드 */}
        <div className="relative bg-white">
          {timeSlots.map((time, timeIndex) => (
            <div key={time} className="grid grid-cols-6 border-b border-gray-100 last:border-b-0" style={{ height: '60px' }}>
              <div className="px-3 py-2 text-sm font-medium text-gray-600 text-center border-r border-gray-200 bg-gray-50/50 flex items-center justify-center">
                {time}
              </div>
              {days.map(day => (
                <div key={`${day}-${time}`} className="border-r border-gray-100 last:border-r-0 relative hover:bg-blue-50/30 transition-colors">
                </div>
              ))}
            </div>
          ))}
          
          {/* 과목 블록들 */}
          {courseTimeSlots.map((slot, index) => {
            const dayIndex = days.indexOf(slot.day)
            const position = getTimeSlotPosition(slot.startTime)
            const height = getTimeSlotHeight(slot.startTime, slot.endTime)
            const courseInfo = getCourseInfo(slot.course)
            
            if (dayIndex === -1 || position === -1) return null
            
            const colorClass = getColorByArea(courseInfo.area)
            
            return (
              <div
                key={`${courseInfo.code}-${slot.day}-${slot.startTime}-${slot.endTime}-${index}`}
                className={`absolute border-l-4 p-3 m-1 rounded-lg shadow-sm overflow-hidden ${colorClass} hover:shadow-md transition-shadow`}
                style={{
                  left: `${(dayIndex + 1) * (100 / 6)}%`,
                  top: `${position * 60}px`,
                  width: `${100 / 6 - 1}%`,
                  height: `${height * 60 - 8}px`,
                  zIndex: 10
                }}
              >
                <div className="font-semibold text-sm leading-tight mb-1">
                  {courseInfo.name.length > 10 ? `${courseInfo.name.substring(0, 10)}...` : courseInfo.name}
                </div>
                <div className="text-xs opacity-80 mb-1">
                  {courseInfo.area} | {courseInfo.professor.length > 6 ? `${courseInfo.professor.substring(0, 6)}...` : courseInfo.professor}
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

  // 로딩 화면
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">AI가 최적의 시간표를 생성하고 있습니다...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-purple-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">AI 추천 시간표</h1>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => loadCoursesAndGenerate(settings.grade, settings.espLevel, settings.mnLevel, settings.credits, settings.track)}
                variant="outline" 
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                다시 생성
              </Button>
            <Link href="/timetable/ai">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                설정으로 돌아가기
              </Button>
            </Link>
            </div>
          </div>
          
          {/* 현재 설정 표시 - 개별 타원형 박스들 */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2">
              {/* 학년 - 무채색 */}
              <div className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-normal px-2 py-1 rounded-full shadow-sm transition-colors text-xs">
              {settings.grade}
              </div>
              
              {/* ESP - 무채색 */}
              <div className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-normal px-2 py-1 rounded-full shadow-sm transition-colors text-xs">
              ESP: {settings.espLevel}
          </div>
          
              {/* MN - 무채색 */}
              <div className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-normal px-2 py-1 rounded-full shadow-sm transition-colors text-xs">
                MN: {settings.mnLevel}
        </div>

              {/* 학점 - 무채색 */}
              <div className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-normal px-2 py-1 rounded-full shadow-sm transition-colors text-xs">
                {settings.credits}
                </div>

              {/* 트랙 - 무채색 */}
              <div className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-normal px-2 py-1 rounded-full shadow-sm transition-colors text-xs">
                {settings.track}
                        </div>
                        </div>
                  </div>
                  
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              당신의 설정에 맞는 최적의 시간표 3가지를 제안합니다!
            </p>
                            </div>
                            </div>

        {/* 시간표 목록 */}
        {generatedTimetables.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {generatedTimetables.map((timetable) => (
              <div key={timetable.id} className="space-y-3">
                {/* 시간표 카드 */}
                <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{timetable.name}</h3>
                    <Badge className="bg-purple-100 text-purple-800">
                      {timetable.totalCredits}학점
                    </Badge>
                  </div>
                  
                                        {/* 시간표 미니 미리보기 */}
                    <div className="mb-4">
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="grid grid-cols-6 text-xs bg-gray-50">
                          <div className="p-1.5 text-center font-medium border-r border-gray-200">시간</div>
                          {['월', '화', '수', '목', '금'].map(day => (
                            <div key={day} className="p-1.5 text-center font-medium border-r border-gray-200 last:border-r-0">
                              {day}
                            </div>
                          ))}
                        </div>
                        <div className="relative">
                          {/* 시간 슬롯 - 실제 시간표와 동일한 시간대 사용 */}
                          {[
                            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                            '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
                            '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', 
                            '18:00', '18:30', '19:00'
                          ].filter((_, index) => index % 3 === 0).map((time, index) => (
                            <div key={time} className="grid grid-cols-6 border-b border-gray-100 last:border-b-0" style={{ height: '18px' }}>
                              <div className="text-xs text-center border-r border-gray-100 bg-gray-50/50 flex items-center justify-center">
                                {time}
                              </div>
                              {['월', '화', '수', '목', '금'].map(day => (
                                <div key={`${day}-${time}`} className="border-r border-gray-100 last:border-r-0"></div>
                              ))}
                            </div>
                          ))}
                          
                          {/* 과목 블록들 (미니 버전) - 정확한 시간 매핑 */}
                          {timetable.courses.map((course, courseIndex) => {
                            const courseInfo = getCourseInfo(course)
                            const timeSlots = parseTimeSlots(courseInfo.time)
                            
                            return timeSlots.map((slot, slotIndex) => {
                              const dayIndex = ['월', '화', '수', '목', '금'].indexOf(slot.day)
                              if (dayIndex === -1) return null
                              
                              // 실제 시간표와 동일한 시간 매핑
                              const fullTimeSlots = [
                                '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                                '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
                                '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', 
                                '18:00', '18:30', '19:00'
                              ]
                              
                              const getMiniTimePosition = (startTime: string): number => {
                                const fullIndex = fullTimeSlots.indexOf(startTime)
                                if (fullIndex === -1) {
                                  // 정확히 일치하지 않으면 가장 가까운 시간 찾기
                                  const startHour = parseInt(startTime.split(':')[0])
                                  const startMinute = parseInt(startTime.split(':')[1])
                                  const startTimeMinutes = startHour * 60 + startMinute
                                  
                                  let closestIndex = 0
                                  let minDiff = Infinity
                                  
                                  fullTimeSlots.forEach((timeSlot, index) => {
                                    const hour = parseInt(timeSlot.split(':')[0])
                                    const minute = parseInt(timeSlot.split(':')[1])
                                    const slotMinutes = hour * 60 + minute
                                    const diff = Math.abs(startTimeMinutes - slotMinutes)
                                    
                                    if (diff < minDiff) {
                                      minDiff = diff
                                      closestIndex = index
                                    }
                                  })
                                  
                                  return Math.floor(closestIndex / 3)
                                }
                                return Math.floor(fullIndex / 3)
                              }
                              
                              const getMiniTimeHeight = (startTime: string, endTime: string): number => {
                                const startHour = parseInt(startTime.split(':')[0])
                                const startMinute = parseInt(startTime.split(':')[1])
                                const endHour = parseInt(endTime.split(':')[0])
                                const endMinute = parseInt(endTime.split(':')[1])
                                
                                const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute)
                                const durationSlots = Math.max(1, Math.round(durationMinutes / 90)) // 90분당 1슬롯
                                
                                return Math.min(durationSlots * 18, 54) // 최대 3슬롯 높이
                              }
                              
                              const position = getMiniTimePosition(slot.startTime)
                              const height = getMiniTimeHeight(slot.startTime, slot.endTime)
                              
                              // 영역별 색상 (간소화)
                              const getSimpleColor = (area: string) => {
                                const colors: { [key: string]: string } = {
                                  'GE': 'bg-blue-400',
                                  'EF': 'bg-green-400',
                                  'EL': 'bg-cyan-400',
                                  'MS': 'bg-purple-400',
                                  'VC': 'bg-orange-400',
                                  'ESP': 'bg-rose-400',
                                  'MN': 'bg-teal-400',
                                  'EN': 'bg-indigo-400',
                                  'HASS': 'bg-pink-400',
                                  'RC': 'bg-yellow-400',
                                  'CAPS': 'bg-red-400'
                                }
                                return colors[area] || 'bg-gray-400'
                              }
                              
                              return (
                                <div
                                  key={`mini-${courseIndex}-${slotIndex}`}
                                  className={`absolute ${getSimpleColor(courseInfo.area)} text-white text-xs font-medium flex items-center justify-center rounded`}
                                  style={{
                                    left: `${(dayIndex + 1) * (100 / 6) + 0.5}%`,
                                    top: `${position * 18 + 1}px`,
                                    width: `${100 / 6 - 1}%`,
                                    height: `${height - 2}px`,
                                    zIndex: 10
                                  }}
                                  title={`${courseInfo.name} (${slot.startTime}-${slot.endTime})`}
                                >
                                  {courseInfo.area}
                                </div>
                              )
                            })
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                      {/* 기본적으로 표시할 과목 수 결정 */}
                      {(expandedCards.has(timetable.id) ? timetable.courses : timetable.courses.slice(0, 3)).map((course, index) => {
                      const courseInfo = getCourseInfo(course)
                      return (
                        <div key={index} className="p-2 bg-gray-50 rounded-lg">
                          <div className="font-medium text-xs text-gray-900 mb-1 leading-tight">
                            {courseInfo.name}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 leading-tight truncate mr-2">
                              {courseInfo.time || '시간 미정'}
                            </span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Badge variant="outline" className="text-xs px-1 py-0 h-auto">
                                {courseInfo.area}
                              </Badge>
                              <Badge variant="outline" className="text-xs px-1 py-0 h-auto">
                                {courseInfo.credits}학점
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                      
                      {/* 더보기/접기 버튼 */}
                      {timetable.courses.length > 3 && (
                        <button
                          onClick={() => toggleCardExpansion(timetable.id)}
                          className="w-full text-xs text-blue-600 hover:text-blue-800 py-2 font-medium transition-colors"
                        >
                          {expandedCards.has(timetable.id) 
                            ? '접기 ▲' 
                            : `${timetable.courses.length - 3}개 과목 더보기 ▼`
                          }
                        </button>
                      )}
                  </div>

                  {/* 시간표 특징/혜택 */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">✨ 시간표 특징</h4>
                    <div className="space-y-2">
                      {timetable.benefits.slice(0, 3).map((benefit, index) => (
                        <div 
                          key={index} 
                          className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 px-3 py-2 rounded-lg text-sm font-medium shadow-sm border border-purple-200"
                        >
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 mt-4"
                    onClick={() => handleTimetableSelect(timetable)}
                  >
                    이 시간표 선택하기
                  </Button>
                </CardContent>
              </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">시간표 생성 실패</h3>
            <p className="text-gray-500 mb-4">
              설정에 맞는 시간표를 생성할 수 없습니다.
            </p>
            <Link href="/timetable/ai">
              <Button variant="outline">
                설정 다시 확인하기
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* 6번: 시간표 상세보기 다이얼로그 */}
      <Dialog open={showDetailView} onOpenChange={closeDetailView}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {selectedTimetable?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTimetable && (
            <div className="space-y-6">
              {/* 시간표 정보 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge className="bg-purple-100 text-purple-800">
                    총 {selectedTimetable.totalCredits}학점
                  </Badge>
                  <Badge variant="outline">
                    {selectedTimetable.courses.length}개 과목
                  </Badge>
                </div>
                <Button onClick={openSaveDialog} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  저장하기
                </Button>
              </div>

              {/* 시간표 격자 */}
              {generateTimetableGrid(selectedTimetable.courses)}

              {/* 과목 목록 */}
              <div>
                <h4 className="font-semibold mb-3">수강 과목 목록</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  {selectedTimetable.courses.map((course, index) => {
                    const courseInfo = getCourseInfo(course)
                    return (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-sm mb-1">
                          {courseInfo.name}
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          {courseInfo.code} | {courseInfo.professor}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {courseInfo.time || '시간 미정'} | {courseInfo.location || '장소 미정'}
                        </div>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            {courseInfo.area}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {courseInfo.credits}학점
                          </Badge>
                          {courseInfo.track && (
                            <Badge variant="outline" className="text-xs">
                              {courseInfo.track}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 혜택 */}
              <div>
                <h4 className="font-semibold mb-3">시간표 특징</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTimetable.benefits.map((benefit, index) => (
                    <Badge key={index} variant="secondary">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDetailView}>
              <X className="h-4 w-4 mr-2" />
              닫기
            </Button>
            <Button onClick={openSaveDialog}>
              <Save className="h-4 w-4 mr-2" />
              저장하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 7번: 시간표 저장 다이얼로그 */}
      <Dialog open={showSaveDialog} onOpenChange={closeSaveDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              시간표 저장
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                    시간표 이름
                  </label>
                  <Input
                value={customTimetableName}
                onChange={(e) => setCustomTimetableName(e.target.value)}
                placeholder="시간표 이름을 입력하세요"
                    className="w-full"
                  />
                </div>
            
            {selectedTimetable && (
              <div className="text-sm text-gray-600">
                <p>총 <strong>{selectedTimetable.totalCredits}학점</strong>, <strong>{selectedTimetable.courses.length}개 과목</strong></p>
                <p className="mt-1">저장된 시간표는 나중에 확인하고 수정할 수 있습니다.</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeSaveDialog}>
              <X className="h-4 w-4 mr-2" />
                    취소
                  </Button>
                  <Button
              onClick={handleSaveTimetable}
              disabled={!customTimetableName.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              저장하기
                  </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AITimetableResultPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AITimetableResultContent />
    </Suspense>
  )
} 
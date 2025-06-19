'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  Users, 
  Star, 
  Info,
  Home,
  LogIn,
  User
} from 'lucide-react'

const baseNavItems = [
  {
    href: '/',
    label: '홈',
    icon: <Home className="h-5 w-5" />,
    emoji: '🏠'
  },
  {
    href: '/academic',
    label: '학사 정보',
    icon: <Info className="h-5 w-5" />,
    emoji: '📚'
  },
  {
    href: '/courses',
    label: '개설 과목 조회',
    icon: <BookOpen className="h-5 w-5" />,
    emoji: '📖'
  },
  {
    href: '/timetable',
    label: '시간표 설계',
    icon: <Calendar className="h-5 w-5" />,
    emoji: '📅'
  },
  {
    href: '/community',
    label: '커뮤니티',
    icon: <Users className="h-5 w-5" />,
    emoji: '👥'
  }
]

export default function Navbar() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // 로그인 상태 확인
    const checkLoginStatus = () => {
      const loginStatus = localStorage.getItem('isLoggedIn')
      setIsLoggedIn(loginStatus === 'true')
    }

    checkLoginStatus()
    
    // 로그인 상태 변화 감지
    const handleStorageChange = () => {
      checkLoginStatus()
    }
    
    window.addEventListener('storage', handleStorageChange)
    // 컴포넌트가 포커스를 받을 때도 체크
    window.addEventListener('focus', checkLoginStatus)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', checkLoginStatus)
    }
  }, [])

  // 로그인 상태에 따라 네비게이션 아이템 동적 구성
  const navItems = [
    ...baseNavItems,
    ...(isLoggedIn 
      ? [{
          href: '/mypage',
          label: '나의 페이지',
          icon: <User className="h-5 w-5" />,
          emoji: '👤'
        }]
      : [{
          href: '/login',
          label: '로그인',
          icon: <LogIn className="h-5 w-5" />,
          emoji: '🔐'
        }]
    )
  ]

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="bg-blue-500 text-white p-2 rounded-lg">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-bold text-blue-500">
                KENTA
              </span>
              <p className="text-xs text-gray-600 hidden sm:block">KENTECH 시간표 설계</p>
            </div>
          </Link>

          {/* 네비게이션 메뉴 */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`flex items-center space-x-2 px-4 py-2 ${
                      isActive 
                        ? 'bg-blue-500 text-white' 
                        : 'hover:bg-blue-50 text-gray-700'
                    }`}
                  >
                    <span className="text-base">{item.emoji}</span>
                    <span className="hidden lg:inline">{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <span className="sr-only">메뉴 열기</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>

        {/* 모바일 메뉴 (간소화) */}
        <div className="md:hidden pb-4">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`flex items-center space-x-1 px-3 py-2 whitespace-nowrap ${
                      isActive 
                        ? 'bg-blue-500 text-white' 
                        : 'hover:bg-blue-50 text-gray-700'
                    }`}
                  >
                    <span>{item.emoji}</span>
                    <span className="text-xs">{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
} 
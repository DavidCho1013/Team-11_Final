'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Info, BookOpen, Briefcase, Zap, Battery, Cpu, Grid3X3, Atom, TreePine, GraduationCap, Calendar, RefreshCw, Award, CheckCircle } from 'lucide-react'

interface Track {
  id: string
  name: string
  nameEn: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  learnings: string[]
  career: string[]
}

const tracks: Track[] = [
  {
    id: 'hydrogen',
    name: '수소 에너지',
    nameEn: 'Hydrogen Energy',
    icon: <Zap className="h-6 w-6" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    learnings: [
      '수소의 생산, 저장, 운송, 활용까지 전 주기적인 기술을 학습',
      '전기분해, 고체산화물 전해조(SOEC), 수소 연료전지 등에 대한 이해를 기반으로 소재 및 공정기술 습득'
    ],
    career: [
      '수소 생산업체, 연료전지 기업, 친환경 자동차, 수소충전소 운영 기업 취업',
      '수소 인프라 및 산업 관련 연구/엔지니어링 분야 진출'
    ]
  },
  {
    id: 'smartgrid',
    name: '스마트 그리드',
    nameEn: 'Smart Grid',
    icon: <Grid3X3 className="h-6 w-6" />,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    learnings: [
      '전력 시스템, 전력 전자, 전기기기와 같은 기반 지식과 함께 ICT 기술을 융합한 차세대 전력망 설계와 운영 기술 학습',
      '분산에너지 자원(DER), 전력 시장 경제, 수요반응(DR) 시스템 설계'
    ],
    career: [
      '전력 공기업, 에너지 IT 솔루션 기업, 전력 거래소 취업',
      '재생에너지 시스템 설계 및 운영 분야 진출'
    ]
  },
  {
    id: 'fusion',
    name: '핵융합',
    nameEn: 'Nuclear Fusion',
    icon: <Atom className="h-6 w-6" />,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    learnings: [
      '차세대 무탄소 에너지로 주목받는 핵융합의 원리, 장치(토카막 등), 플라즈마 물리 및 열역학 습습득',
      '핵융합로 설계 등을 통한 실전적 엔지니어링 기술 학습'
    ],
    career: [
      '국가 핵융합 연구소(KFE), ITER 국제 공동 연구 참여',
      '핵융합 장치 설계 및 유지관리, 차세대 발전 기술 연구 분야 진출'
    ]
  },
  {
    id: 'ai',
    name: '에너지 AI',
    nameEn: 'Energy AI',
    icon: <Cpu className="h-6 w-6" />,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    learnings: [
      '기계학습, 딥러닝, 강화학습 등을 기반으로 에너지 데이터를 분석 및 예측 모델 구축',
      '에너지 효율화, 고장 예지, 수요 예측, 최적 운영 등 실전 문제 해결 기술 습득'
    ],
    career: [
      'AI 기반 에너지 솔루션 개발자, 스마트팩토리·스마트시티 분야 진출',
      '에너지 데이터 분석가, 연구원 취업'
    ]
  },
  {
    id: 'materials',
    name: '에너지 신소재',
    nameEn: 'New Energy Materials',
    icon: <Battery className="h-6 w-6" />,
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    learnings: [
      '이차전지, 태양전지, 연료전지, 열전소자 등 다양한 에너지 변환·저장 소재의 특성과 제조 기술 습득',
      '나노재료, 고분자, 금속/무기소재 등 특성을 분석'
    ],
    career: [
      '배터리 기업(LG에너지솔루션, 삼성SDI 등), 태양광/연료전지 소재기업 취업',
      '소재 연구기관, 반도체/소재 계열 R&D 진출출'
    ]
  },
  {
    id: 'environment',
    name: '환경·기후 기술',
    nameEn: 'Environmental & Climate Technology',
    icon: <TreePine className="h-6 w-6" />,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    learnings: [
      '에너지 사용으로 인한 지구환경 변화를 다각도로 이해',
      '탄소포집, 순환자원, 탄소 업사이클링 등 해결 기술 습득'
    ],
    career: [
      '환경 정책 연구, 기후기술 기업, 탄소중립 관련 스타트업 참여',
      'ESG 관련 컨설팅, 정부/지자체 환경 정책 부서 취업업'
    ]
  }
]

export default function AcademicPage() {
  const router = useRouter()
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(tracks[0])

  useEffect(() => {
    // 로그인 상태 확인
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (isLoggedIn !== 'true') {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }
  }, [router])

  return (
    <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        {/* KENTECH TRACKS 섹션 */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🎓 KENTECH TRACKS</h2>
            <p className="text-gray-600">에너지 특성화 대학 KENTECH의 6개 전공 트랙을 탐색해보세요</p>
          </div>

          {/* 트랙 선택 버튼들 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {tracks.map((track) => (
              <Button
                key={track.id}
                variant="ghost"
                onClick={() => setSelectedTrack(track)}
                className={`
                  h-auto p-4 flex flex-col items-center space-y-2 
                  bg-white/60 backdrop-blur-sm border-2 transition-all duration-300
                  hover:bg-white/80 hover:shadow-md hover:-translate-y-1
                  ${selectedTrack?.id === track.id 
                    ? `${track.borderColor} ${track.bgColor} shadow-md` 
                    : 'border-gray-200'
                  }
                `}
              >
                <div className={`${selectedTrack?.id === track.id ? track.color : 'text-gray-600'} transition-colors`}>
                  {track.icon}
                </div>
                <div className="text-center">
                  <div className={`text-sm font-medium ${selectedTrack?.id === track.id ? track.color : 'text-gray-700'}`}>
                    {track.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 leading-tight">
                    {track.id === 'environment' ? (
                      <>
                        Environmental & Climate<br/>Technology
                      </>
                    ) : (
                      track.nameEn
                    )}
                  </div>
                </div>
              </Button>
            ))}
          </div>

          {/* 선택된 트랙 정보 */}
          {selectedTrack && (
            <Card className={`${selectedTrack.bgColor} ${selectedTrack.borderColor} border-2 bg-opacity-50 backdrop-blur-sm`}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full ${selectedTrack.bgColor} ${selectedTrack.color}`}>
                    {selectedTrack.icon}
                  </div>
                  <div>
                    <CardTitle className={`text-xl ${selectedTrack.color}`}>
                      {selectedTrack.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {selectedTrack.nameEn}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Learnings 섹션 */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <BookOpen className={`h-5 w-5 ${selectedTrack.color}`} />
                    <h3 className={`text-lg font-semibold ${selectedTrack.color}`}>
                      Learnings
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {selectedTrack.learnings.map((learning, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full ${selectedTrack.color.replace('text-', 'bg-')} mt-2 flex-shrink-0`} />
                        <p className="text-gray-700 leading-relaxed">{learning}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Graduation Career 섹션 */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Briefcase className={`h-5 w-5 ${selectedTrack.color}`} />
                    <h3 className={`text-lg font-semibold ${selectedTrack.color}`}>
                      Graduation Career
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {selectedTrack.career.map((career, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full ${selectedTrack.color.replace('text-', 'bg-')} mt-2 flex-shrink-0`} />
                        <p className="text-gray-700 leading-relaxed">{career}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 학사 규정 섹션 */}
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">📋 학사 규정</h2>
            <p className="text-gray-600">KENTECH 학사 운영 규정을 확인하세요</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 졸업 이수 요건 */}
            <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-700">
                  <GraduationCap className="h-5 w-5" />
                  <span>졸업 이수 요건</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm"><strong>수업연한:</strong> 4년</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm"><strong>최소 취득 학점:</strong> 128학점 이상</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm"><strong>총 평균 평점:</strong> 최소 C0 (2.0/4.3) 이상</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <span className="text-sm"><strong>학위논문:</strong> 지정된 과제 또는 논문 제출 후 심의 통과</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <span className="text-sm"><strong>조기졸업:</strong> 평균평점이 3.5/4.3 이상일 경우 가능</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 학기별 신청학점 */}
            <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-700">
                  <BookOpen className="h-5 w-5" />
                  <span>학기별 신청학점</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm"><strong>기본:</strong> 최소 10학점, 최대 21학점</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span className="text-sm"><strong>우수자:</strong> 직전 학기 평점 3.4 이상, 낙제과목 없으면 최대 25학점</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span className="text-sm"><strong>학사경고자:</strong> 최대 17학점 (승인 시 21학점)</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span className="text-sm"><strong>졸업예정자:</strong> 잔여학점 10학점 미만 시 유연 적용</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 수강신청 및 정정 */}
            <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-purple-700">
                  <Calendar className="h-5 w-5" />
                  <span>수강신청 및 정정</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <span className="text-sm"><strong>정정기간:</strong> 개강 후 1주일 이내</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <span className="text-sm"><strong>수강취소:</strong> 정정기간 이후 별도 Drop 기간 있음</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <span className="text-sm"><strong>미수강:</strong> 최종 수강과목 미수강 시 성적 F 처리</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <span className="text-sm"><strong>최소학점:</strong> 취소 후에도 최소 신청학점 유지 필수</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 재수강 기준 */}
            <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-700">
                  <RefreshCw className="h-5 w-5" />
                  <span>재수강 기준</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <span className="text-sm"><strong>성적제한:</strong> 재수강 후 최대 B+ 성적까지만 인정</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <span className="text-sm"><strong>횟수제한:</strong> 재수강한 과목은 다시 재수강 불가능</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <span className="text-sm"><strong>성적기록:</strong> 최종 성적만 성적증명서에 기록</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 학업 평가 및 성적 */}
            <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-cyan-500">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-cyan-700">
                  <Award className="h-5 w-5" />
                  <span>학업 평가 및 성적</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2"></div>
                    <span className="text-sm"><strong>평가방식:</strong> 절대평가 원칙</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2"></div>
                    <span className="text-sm"><strong>이수기준:</strong> D- 이상 및 S 등급부터 학점 인정</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2"></div>
                    <span className="text-sm"><strong>학사경고:</strong> 평균평점 2.0 미만 시 부여</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2"></div>
                    <span className="text-sm"><strong>제적기준:</strong> 학사경고 누적 3회 시 제적</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 출석 인정 기준 */}
            <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-700">
                  <CheckCircle className="h-5 w-5" />
                  <span>출석 인정 기준</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <span className="text-sm"><strong>출석요건:</strong> 총 수업일수의 3/4 이상 출석 필수</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <span className="text-sm"><strong>공결사유:</strong> 천재지변, 전염병, 병역의무, 경조사 등</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <span className="text-sm"><strong>신청기한:</strong> 사유 발생 전후 7일 이내 증빙서류 제출</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <span className="text-sm"><strong>인정한도:</strong> 전체 수업일수의 절반까지 인정 가능</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 
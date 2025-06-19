'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { FilterOptions } from '@/types/course'
import { Filter, RefreshCw } from 'lucide-react'

interface CourseFilterProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
}

const MAJORS = [
  { value: 'materials', label: '에너지 소재' },
  { value: 'systems', label: '에너지 시스템' },
  { value: 'environmental', label: '환경공학' },
  { value: 'policy', label: '에너지 정책' },
  { value: 'ai', label: 'AI 에너지' }
]

const GRADES = [
  { value: '1', label: '1학년' },
  { value: '2', label: '2학년' },
  { value: '3', label: '3학년' },
  { value: '4', label: '4학년' }
]

const ENGLISH_LEVELS = [
  { value: 'basic', label: '기초' },
  { value: 'intermediate', label: '중급' },
  { value: 'advanced', label: '고급' }
]

const MINERVA_LEVELS = [
  { value: 'basic', label: '기초' },
  { value: 'intermediate', label: '중급' },
  { value: 'advanced', label: '고급' }
]

export default function CourseFilter({ filters, onFiltersChange }: CourseFilterProps) {
  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value }
    onFiltersChange(newFilters)
  }

  const resetFilters = () => {
    onFiltersChange({
      grade: '',
      major: '',
      englishLevel: '',
      minervaLevel: ''
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">필터</CardTitle>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <RefreshCw className="h-4 w-4 mr-2" />
              초기화
            </Button>
          )}
        </div>
        <CardDescription>
          학년과 레벨을 선택하여 맞춤 과목을 찾아보세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            학년
          </label>
          <Select value={filters.grade} onValueChange={(value) => handleFilterChange('grade', value)}>
            <SelectTrigger>
              <SelectValue placeholder="학년 선택" />
            </SelectTrigger>
            <SelectContent>
              {GRADES.map((grade) => (
                <SelectItem key={grade.value} value={grade.value}>
                  {grade.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            전공 분야
          </label>
          <Select value={filters.major} onValueChange={(value) => handleFilterChange('major', value)}>
            <SelectTrigger>
              <SelectValue placeholder="전공 선택" />
            </SelectTrigger>
            <SelectContent>
              {MAJORS.map((major) => (
                <SelectItem key={major.value} value={major.value}>
                  {major.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            영어 레벨
          </label>
          <Select value={filters.englishLevel} onValueChange={(value) => handleFilterChange('englishLevel', value)}>
            <SelectTrigger>
              <SelectValue placeholder="영어 레벨" />
            </SelectTrigger>
            <SelectContent>
              {ENGLISH_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Minerva 레벨
          </label>
          <Select value={filters.minervaLevel} onValueChange={(value) => handleFilterChange('minervaLevel', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Minerva 레벨" />
            </SelectTrigger>
            <SelectContent>
              {MINERVA_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4">
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            onClick={() => onFiltersChange(filters)}
          >
            필터 적용
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 
export interface Course {
  id: string
  name: string
  code: string
  professor: string
  credit: number
  major: 'materials' | 'systems' | 'environmental' | 'policy' | 'ai'
  grade: number[]
  englishLevel: 'basic' | 'intermediate' | 'advanced'
  minervaLevel: 'basic' | 'intermediate' | 'advanced'
  schedule: CourseSchedule[]
  description: string
  rating: number
  reviewCount: number
  isFavorite: boolean
  prerequisites?: string[]
  syllabus?: string
}

export interface CourseSchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  startTime: string // HH:MM format
  endTime: string   // HH:MM format
  room: string
}

export interface FilterOptions {
  grade: string
  major: string
  englishLevel: string
  minervaLevel: string
}

export interface Timetable {
  id: string
  name: string
  courses: Course[]
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  id: string
  courseId: string
  rating: number
  comment: string
  semester: string
  year: number
  helpful: number
  anonymous: boolean
  createdAt: Date
}

export interface TimeSlot {
  day: number // 0 = Monday, 1 = Tuesday, etc.
  startHour: number
  endHour: number
  course?: Course
} 
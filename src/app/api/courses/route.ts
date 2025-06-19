import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import path from 'path'
import fs from 'fs'

export async function GET() {
  console.log('=== API COURSES CALLED ===')
  
  try {
    // 간단하고 안정적인 방식으로 Excel 파일 읽기
    const fileName = 'courses.xlsx'
    const filePath = path.join(process.cwd(), 'public', fileName)
    
    console.log('Attempting to read file:', filePath)
    
    // 파일 존재 확인
    if (!fs.existsSync(filePath)) {
      const publicDir = path.join(process.cwd(), 'public')
      const xlsxFiles = fs.readdirSync(publicDir).filter(file => file.endsWith('.xlsx'))
      
      return NextResponse.json({ 
        success: false,
        error: 'Excel file not found', 
        filePath,
        availableFiles: xlsxFiles
      }, { status: 404 })
    }

    // 파일 읽기
    const fileStats = fs.statSync(filePath)
    console.log('File size:', fileStats.size, 'bytes')
    
    const fileBuffer = fs.readFileSync(filePath)
    console.log('File buffer loaded, size:', fileBuffer.length)
    
    // Excel 파싱
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
    console.log('Workbook sheets:', workbook.SheetNames)
    
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][]
    
    console.log('Raw data rows:', rawData.length)
    console.log('First 3 rows:', rawData.slice(0, 3))
    
    if (rawData.length < 2) {
      return NextResponse.json({ 
        success: false,
        error: 'Not enough data rows',
        rowCount: rawData.length
      }, { status: 400 })
    }

    // 헤더 처리
    const headers = rawData[0] || []
    console.log('Headers:', headers)
    
    // 데이터 행 처리
    const dataRows = rawData.slice(1)
    console.log('Processing', dataRows.length, 'data rows')
    
    const courses = dataRows.map((row, index) => {
      const course: Record<string, string> = {}
      
      headers.forEach((header, colIndex) => {
        const key = header || `Column_${colIndex}`
        const value = row[colIndex] || ''
        course[key] = String(value).trim()
      })
      
      return course
    }).filter(course => {
      // 어떤 컬럼이든 데이터가 있으면 포함
      const hasData = Object.values(course).some(value => value && value.trim())
      if (hasData) {
        console.log('Valid course found:', Object.values(course).slice(0, 3)) // 첫 3개 컬럼만 로그
      }
      return hasData
    })

    console.log('Processed courses:', courses.length)
    console.log('Sample course:', courses[0])
    
    return NextResponse.json({
      success: true,
      courses,
      total: courses.length,
      headers,
      message: `Successfully loaded ${courses.length} courses`
    })

  } catch (error) {
    console.error('=== API ERROR ===')
    console.error('Error:', error)
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to process Excel file', 
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 
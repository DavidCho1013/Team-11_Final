import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import path from 'path'
import fs from 'fs'

export async function GET() {
  try {
    console.log('=== SIMPLE TEST API ===')
    
    const publicDir = path.join(process.cwd(), 'public')
    console.log('Public directory:', publicDir)
    
    const files = fs.readdirSync(publicDir)
    console.log('All files in public:', files)
    
    const xlsxFiles = files.filter(f => f.endsWith('.xlsx'))
    console.log('Excel files:', xlsxFiles)
    
    if (xlsxFiles.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No Excel files found',
        publicDir,
        allFiles: files
      })
    }
    
    // courses.xlsx 파일 사용 (영어 파일명)
    const fileName = 'courses.xlsx'
    const filePath = path.join(publicDir, fileName)
    
    console.log('Trying to read:', filePath)
    console.log('File exists:', fs.existsSync(filePath))
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({
        success: false,
        error: 'courses.xlsx not found',
        filePath,
        xlsxFiles
      })
    }
    
    const fileStats = fs.statSync(filePath)
    console.log('File size:', fileStats.size)
    
    const fileBuffer = fs.readFileSync(filePath)
    console.log('Buffer loaded, size:', fileBuffer.length)
    
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
    console.log('Workbook sheets:', workbook.SheetNames)
    
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    console.log('Data rows:', jsonData.length)
    console.log('First 2 rows:', jsonData.slice(0, 2))
    
    return NextResponse.json({
      success: true,
      fileName,
      fileSize: fileStats.size,
      sheets: workbook.SheetNames,
      rowCount: jsonData.length,
      headers: jsonData[0],
      sampleData: jsonData.slice(0, 3)
    })
    
  } catch (error) {
    console.error('Simple test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
} 
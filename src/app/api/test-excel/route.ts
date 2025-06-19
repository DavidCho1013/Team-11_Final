import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import path from 'path'
import fs from 'fs'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'courses.xlsx')
    
    console.log('=== EXCEL FILE TEST ===')
    console.log('File path:', filePath)
    console.log('File exists:', fs.existsSync(filePath))
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ 
        success: false,
        error: 'File not found',
        filePath 
      })
    }

    const fileStats = fs.statSync(filePath)
    console.log('File size:', fileStats.size)
    
    const fileBuffer = fs.readFileSync(filePath)
    console.log('File buffer size:', fileBuffer.length)
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
    console.log('Workbook loaded, sheets:', workbook.SheetNames)
    
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    console.log('First sheet range:', firstSheet['!ref'])
    
    // Get raw cell data
    const range = XLSX.utils.decode_range(firstSheet['!ref'] || 'A1:Z100')
    console.log('Decoded range:', range)
    
    const cellData: any = {}
    for (let row = range.s.r; row <= Math.min(range.e.r, range.s.r + 10); row++) {
      const rowData: any = {}
      for (let col = range.s.c; col <= Math.min(range.e.c, range.s.c + 20); col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
        const cell = firstSheet[cellAddress]
        if (cell) {
          rowData[XLSX.utils.encode_col(col)] = cell.v
        }
      }
      if (Object.keys(rowData).length > 0) {
        cellData[`Row_${row + 1}`] = rowData
      }
    }
    
    // Try both parsing methods
    const jsonMethod = XLSX.utils.sheet_to_json(firstSheet, { defval: '' })
    const arrayMethod = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' })
    
    return NextResponse.json({
      success: true,
      fileInfo: {
        path: filePath,
        size: fileStats.size,
        sheets: workbook.SheetNames
      },
      rawCells: cellData,
      jsonMethod: {
        length: jsonMethod.length,
        sample: jsonMethod.slice(0, 3)
      },
      arrayMethod: {
        length: arrayMethod.length,
        sample: arrayMethod.slice(0, 5)
      }
    })

  } catch (error) {
    console.error('Excel test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
  }
} 
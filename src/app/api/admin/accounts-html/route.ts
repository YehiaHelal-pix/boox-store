import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src/app/api/admin/accounts-html/invoice-dashboard.html')
    const htmlContent = fs.readFileSync(filePath, 'utf8')
    return new Response(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Failed to load accounts page:', error)
    return new Response('عذراً، فشل تحميل صفحة الحسابات.', { status: 500 })
  }
}

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ message: 'Migration completed successfully! (Data stored in settings JSONB column, no table alterations required)' })
}

import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApiAccess } from '@/lib/auth/admin'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

function sanitizeUploadName(fileName: string) {
  const normalized = fileName.normalize('NFKD')
  const extMatch = normalized.match(/\.[a-zA-Z0-9]+$/)
  const extension = extMatch?.[0]?.toLowerCase() ?? '.png'
  const baseName = normalized
    .replace(/\.[a-zA-Z0-9]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return `${baseName || 'product-image'}-${Date.now()}-${crypto.randomUUID()}${extension}`
}

export async function POST(request: NextRequest) {
  const access = await requireAdminApiAccess()
  if ('response' in access) {
    return access.response
  }

  try {
    const formData = await request.formData()
    const files = formData.getAll('files').filter((value): value is File => value instanceof File)

    if (files.length === 0) {
      return NextResponse.json({ error: 'لازم تختار صورة واحدة على الأقل' }, { status: 400 })
    }

    const uploadedUrls: string[] = []

    for (const file of files) {
      const objectPath = `products/${sanitizeUploadName(file.name)}`
      const fileBuffer = Buffer.from(await file.arrayBuffer())

      const { error: uploadError } = await supabaseAdmin.storage.from('product-images').upload(objectPath, fileBuffer, {
        cacheControl: '3600',
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      })

      if (uploadError) {
        return NextResponse.json({ error: `فشل رفع الصورة ${file.name}: ${uploadError.message}` }, { status: 500 })
      }

      const { data } = supabaseAdmin.storage.from('product-images').getPublicUrl(objectPath)
      uploadedUrls.push(data.publicUrl)
    }

    return NextResponse.json({ urls: uploadedUrls })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع أثناء رفع الصور'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import type { NextRequest } from 'next/server'

const FALLBACK_PASSWORDS = new Set(['Boox@Admin2026', '1010'])

export function isAdminPassword(password: string | null | undefined): boolean {
  if (!password) return false

  const configuredPassword = process.env.ADMIN_DASHBOARD_PASSWORD?.trim()
  if (configuredPassword) {
    return password === configuredPassword
  }

  return FALLBACK_PASSWORDS.has(password)
}

export function isAdminRequest(request: NextRequest | Request): boolean {
  return isAdminPassword(request.headers.get('x-admin-password'))
}

export function getAdminHeaders(password: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-admin-password': password,
  }
}

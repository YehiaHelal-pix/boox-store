import type { ReactNode } from 'react'
import { requireAdminPage } from '@/lib/auth/admin'

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  await requireAdminPage('/admin/dashboard')
  return children
}

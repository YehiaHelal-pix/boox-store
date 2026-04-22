import { supabaseAdmin } from '@/lib/supabase/admin'

export async function logAdminActivity(params: {
  action: string
  entityType: string
  entityId?: string | null
  oldData?: Record<string, unknown> | null
  newData?: Record<string, unknown> | null
}) {
  const { action, entityType, entityId = null, oldData = null, newData = null } = params

  const { error } = await supabaseAdmin.from('admin_activity_log').insert({
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_data: oldData,
    new_data: newData,
  })

  if (error) {
    console.error('Failed to write admin activity log:', error.message)
  }
}

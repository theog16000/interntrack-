import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { document_id, application_id } = await request.json()

  if (!document_id || !application_id) {
    return NextResponse.json({ error: 'document_id et application_id requis' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('documents')
    .update({ application_id })
    .eq('id', document_id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
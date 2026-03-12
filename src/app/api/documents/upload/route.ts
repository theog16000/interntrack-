import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File
  const fileType = formData.get('file_type') as string

  if (!file) return NextResponse.json({ error: 'Fichier requis' }, { status: 400 })

  if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
    return NextResponse.json({ error: 'Seuls les PDF, JPG et PNG sont acceptés' }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Fichier trop lourd (5MB max)' }, { status: 400 })
  }

  const filePath = `${user.id}/global/${Date.now()}-${file.name}`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file)

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data, error: dbError } = await supabase
    .from('documents')
    .insert({
      application_id: null,
      user_id: user.id,
      name: file.name,
      file_path: filePath,
      file_type: fileType || 'other'
    })
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
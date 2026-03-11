import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET — Récupère les documents d'une candidature
export async function GET(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const applicationId = searchParams.get('application_id')

  if (!applicationId) {
    return NextResponse.json({ error: 'application_id requis' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('application_id', applicationId)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST — Upload un document
export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File
  const applicationId = formData.get('application_id') as string
  const fileType = formData.get('file_type') as string

  if (!file || !applicationId) {
    return NextResponse.json({ error: 'Fichier et application_id requis' }, { status: 400 })
  }

  // Validation du type de fichier
  if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
    return NextResponse.json({ error: 'Seuls les PDF, JPG et PNG sont acceptés' }, { status: 400 })
  }

  // Validation de la taille (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Fichier trop lourd (5MB max)' }, { status: 400 })
  }

  // Chemin : userId/applicationId/timestamp-filename
  const filePath = `${user.id}/${applicationId}/${Date.now()}-${file.name}`

  // Upload vers Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file)

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  // Sauvegarde en base de données
  const { data, error: dbError } = await supabase
    .from('documents')
    .insert({
      application_id: applicationId,
      user_id: user.id,
      name: file.name,
      file_path: filePath,
      file_type: fileType || 'other'
    })
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
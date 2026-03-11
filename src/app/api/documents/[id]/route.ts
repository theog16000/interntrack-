import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET — Générer un lien de téléchargement temporaire
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Récupère le document
  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !document) {
    return NextResponse.json({ error: 'Document introuvable' }, { status: 404 })
  }

  // Génère un lien temporaire (valable 1 heure)
  const { data: signedUrl } = await supabase.storage
    .from('documents')
    .createSignedUrl(document.file_path, 3600)

  return NextResponse.json({ url: signedUrl?.signedUrl })
}

// DELETE — Supprimer un document
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Récupère le document pour avoir le file_path
  const { data: document, error: fetchError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !document) {
    return NextResponse.json({ error: 'Document introuvable' }, { status: 404 })
  }

  // Supprime du storage
  await supabase.storage
    .from('documents')
    .remove([document.file_path])

  // Supprime de la base de données
  const { error: dbError } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
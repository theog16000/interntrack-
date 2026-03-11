import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET — Récupère toutes les candidatures de l'utilisateur connecté
export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST — Crée une nouvelle candidature
export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body = await request.json()
  const { company_name, job_title, offer_url, hr_contact, notes, applied_at } = body

  // Validation basique
  if (!company_name || !job_title) {
    return NextResponse.json(
      { error: 'Nom de l\'entreprise et intitulé du poste requis' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('applications')
    .insert({
      user_id: user.id,
      company_name,
      job_title,
      offer_url,
      hr_contact,
      notes,
      applied_at,
      status: 'to_apply'
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
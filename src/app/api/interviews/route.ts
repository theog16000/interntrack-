import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data, error } = await supabase
    .from('interviews')
    .select(`
      *,
      applications (id, job_title, company_name)
    `)
    .order('interview_date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await request.json()
  const { application_id, interview_date, type, notes } = body

  if (!application_id || !interview_date || !type) {
    return NextResponse.json(
      { error: 'application_id, interview_date et type requis' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('interviews')
    .insert({
      user_id: user.id,
      application_id,
      interview_date,
      type,
      notes,
      status: 'scheduled'
    })
    .select(`
      *,
      applications (id, job_title, company_name)
    `)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  // Sécurité — vérifie le secret
  const { searchParams } = new URL(request.url)
  if (searchParams.get('secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const today = new Date().toISOString().split('T')[0]

// Récupère toutes les candidatures à relancer
const { data: applications, error } = await supabase
  .from('applications')
  .select('*')
  .eq('status', 'sent')
  .lte('remind_at', today)
  .is('reminded_at', null)

if (error) return NextResponse.json({ error: error.message }, { status: 500 })
if (!applications || applications.length === 0) {
  return NextResponse.json({ message: 'Aucune relance a envoyer' })
}

let sent = 0

for (const app of applications) {
  // Récupère l'email de l'utilisateur via auth.users
  const { data: userData } = await supabase.auth.admin.getUserById(app.user_id)
  const userEmail = userData?.user?.email
  if (!userEmail) continue

  // 1. Crée une notification in-app
  await supabase.from('notifications').insert({
    user_id: app.user_id,
    title:   'Relance recommandee',
    message: `Tu n'as pas eu de reponse de ${app.company_name} pour le poste "${app.job_title}". Pense a les relancer !`,
    link:    '/dashboard/applications',
  })

  // 2. Envoie un email via Resend
  await resend.emails.send({
  from: 'InternTrack <onboarding@resend.dev>',
  to:   'theogenty8@gmail.com',  // ← ton email exact du compte Resend
    subject: `Relance ta candidature chez ${app.company_name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h1 style="font-size: 20px; font-weight: 600; color: #111827; margin: 0 0 8px;">
          Il est temps de relancer !
        </h1>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
          Tu as postule chez <strong>${app.company_name}</strong> pour le poste de <strong>${app.job_title}</strong> il y a 7 jours et tu n'as pas encore eu de reponse.
        </p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/applications"
           style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
          Voir ma candidature
        </a>
      </div>
    `,
  })

  // 3. Marque comme relancee
  await supabase
    .from('applications')
    .update({ reminded_at: new Date().toISOString() })
    .eq('id', app.id)

  sent++
}
  return NextResponse.json({ message: `${sent} relances envoyees` })
}
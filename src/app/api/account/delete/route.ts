import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function DELETE() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  // Supprime toutes les données (CASCADE fait le reste grâce aux FK)
  await supabase.from('applications').delete().eq('user_id', user.id)
  await supabase.from('companies').delete().eq('user_id', user.id)
  await supabase.from('documents').delete().eq('user_id', user.id)
  await supabase.from('interviews').delete().eq('user_id', user.id)

  // Supprime les fichiers storage
  const { data: files } = await supabase.storage
    .from('documents')
    .list(user.id)

  if (files && files.length > 0) {
    await supabase.storage
      .from('documents')
      .remove(files.map(f => `${user.id}/${f.name}`))
  }

  // Supprime le compte via le client admin
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await adminClient.auth.admin.deleteUser(user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
```

---

Ajoute aussi la clé service role dans `.env.local` :
```
SUPABASE_SERVICE_ROLE_KEY=ta_clé_service_role
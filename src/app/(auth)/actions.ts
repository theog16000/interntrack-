'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// INSCRIPTION — ne redirige plus, retourne success pour afficher le message
export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email    = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({ email, password })

  if (error) return { error: error.message }

  return { success: true }
}

// CONNEXION — redirige toujours, on ne peut pas afficher de toast
export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email    = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

// DÉCONNEXION
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
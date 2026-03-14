'use client'

import { useState } from 'react'
import { signUp } from '../actions'
import Link from 'next/link'
import { CheckCircle, XCircle, Mail } from 'lucide-react'

export default function RegisterPage() {
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const result   = await signUp(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-full max-w-sm px-6 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail size={28} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Vérifie ta boîte mail</h1>
          <p className="text-gray-500 text-sm mb-6">
            Un email de confirmation a été envoyé. Clique sur le lien pour activer ton compte.
          </p>
          <div className="flex items-center gap-2.5 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-left mb-6">
            <CheckCircle size={15} className="text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700">Compte créé avec succès !</p>
          </div>
          <Link
            href="/login"
            className="block w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors text-center"
          >
            Aller à la connexion
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-sm px-6">

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Créer un compte</h1>
          <p className="text-gray-500 text-sm mt-1">Commence à suivre tes candidatures</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1.5">Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="toi@email.com"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1.5">Mot de passe</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="6 caractères minimum"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <XCircle size={15} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">
                {error === 'User already registered'
                  ? 'Un compte existe déjà avec cet email'
                  : error
                }
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-indigo-600 hover:underline">
            Se connecter
          </Link>
        </p>

      </div>
    </div>
  )
}
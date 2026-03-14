'use client'

import { useState } from 'react'
import { signIn } from '../actions'
import Link from 'next/link'
import { CheckCircle, XCircle } from 'lucide-react'

export default function LoginPage() {
  const [error, setError]     = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const result   = await signIn(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-sm px-6">

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Connexion</h1>
          <p className="text-gray-500 text-sm mt-1">Content de te revoir sur InternTrack</p>
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
              placeholder="••••••••"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <XCircle size={15} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">
                {error === 'Invalid login credentials'
                  ? 'Email ou mot de passe incorrect'
                  : error === 'Email not confirmed'
                  ? 'Confirme ton email avant de te connecter'
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
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-indigo-600 hover:underline">
            S'inscrire
          </Link>
        </p>

      </div>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  User, Mail, Lock, Trash2, Save,
  Eye, EyeOff, AlertTriangle, CheckCircle
} from 'lucide-react'

const inputClass = "w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
const labelClass = "block text-xs font-medium text-gray-700 mb-1.5"

export default function SettingsPage() {
  const supabase = createClient()

  const [user, setUser] = useState<{ email: string; id: string } | null>(null)
  const [loading, setLoading] = useState(true)

  // Profil
  const [email, setEmail] = useState('')
  const [savingEmail, setSavingEmail] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  // Mot de passe
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Suppression
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser({ email: user.email ?? '', id: user.id })
        setEmail(user.email ?? '')
      }
      setLoading(false)
    }
    fetchUser()
  }, [])

  async function handleUpdateEmail(e: React.FormEvent) {
    e.preventDefault()
    setSavingEmail(true)
    setEmailError(null)
    setEmailSuccess(false)

    const { error } = await supabase.auth.updateUser({ email })

    if (error) {
      setEmailError(error.message)
    } else {
      setEmailSuccess(true)
      setTimeout(() => setEmailSuccess(false), 3000)
    }
    setSavingEmail(false)
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)

    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('Le mot de passe doit faire au moins 6 caractères')
      return
    }

    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 3000)
    }
    setSavingPassword(false)
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'SUPPRIMER') return
    setDeleting(true)
    setDeleteError(null)

    const res = await fetch('/api/account/delete', { method: 'DELETE' })
    const data = await res.json()

    if (!res.ok) {
      setDeleteError(data.error)
      setDeleting(false)
      return
    }

    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Chargement...</p>
      </div>
    )
  }

  return (
  <div className="p-4 md:p-8">
    <div className="mb-6">
      <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Paramètres</h1>
      <p className="text-gray-400 text-xs md:text-sm mt-1">Gère ton compte et tes préférences</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

      {/* Colonne gauche */}
      <div className="space-y-4 md:space-y-6">

        {/* Email */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center"><Mail size={15} className="text-indigo-600" /></div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Adresse email</h2>
              <p className="text-xs text-gray-400">Modifie ton email de connexion</p>
            </div>
          </div>
          <form onSubmit={handleUpdateEmail} className="space-y-3">
            <div>
              <label className={labelClass}>Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="ton@email.com" required />
              </div>
            </div>
            {emailError && <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{emailError}</p>}
            {emailSuccess && <div className="flex items-center gap-2 text-green-600 text-xs bg-green-50 px-3 py-2 rounded-lg"><CheckCircle size={13} /><span>Email de confirmation envoyé</span></div>}
            <button type="submit" disabled={savingEmail || email === user?.email} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              <Save size={14} />{savingEmail ? 'Sauvegarde...' : 'Mettre à jour'}
            </button>
          </form>
        </div>

        {/* Mot de passe */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center"><Lock size={15} className="text-indigo-600" /></div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Mot de passe</h2>
              <p className="text-xs text-gray-400">Change ton mot de passe</p>
            </div>
          </div>
          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div>
              <label className={labelClass}>Nouveau mot de passe</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 bg-white" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showNew ? <EyeOff size={14} /> : <Eye size={14} />}</button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Confirmer</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 bg-white" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}</button>
              </div>
            </div>
            {passwordError && <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{passwordError}</p>}
            {passwordSuccess && <div className="flex items-center gap-2 text-green-600 text-xs bg-green-50 px-3 py-2 rounded-lg"><CheckCircle size={13} /><span>Mot de passe mis à jour</span></div>}
            <button type="submit" disabled={savingPassword} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              <Save size={14} />{savingPassword ? 'Sauvegarde...' : 'Changer'}
            </button>
          </form>
        </div>
      </div>

      {/* Colonne droite */}
      <div className="space-y-4 md:space-y-6">

        {/* Infos compte */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center"><User size={15} className="text-indigo-600" /></div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Mon compte</h2>
              <p className="text-xs text-gray-400">Informations sur ton compte</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-xs text-gray-500">Email</span>
              <span className="text-xs font-medium text-gray-900 truncate ml-4">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-gray-500">ID</span>
              <span className="text-xs font-mono text-gray-400">{user?.id?.slice(0, 12)}...</span>
            </div>
          </div>
        </div>

        {/* Zone danger */}
        <div className="bg-white border border-red-100 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center"><AlertTriangle size={15} className="text-red-500" /></div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Zone dangereuse</h2>
              <p className="text-xs text-gray-400">Actions irréversibles</p>
            </div>
          </div>
          <div className="bg-red-50 rounded-xl p-3 mb-4">
            <p className="text-xs text-red-600 font-medium mb-1">Supprimer mon compte</p>
            <p className="text-xs text-red-400">Cette action est irréversible. Toutes tes données seront supprimées.</p>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Tape <span className="font-mono font-bold text-red-500">SUPPRIMER</span> pour confirmer
              </label>
              <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="SUPPRIMER" className="w-full px-3 py-2.5 border border-red-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-red-400 bg-white font-mono" />
            </div>
            {deleteError && <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{deleteError}</p>}
            <button type="button" onClick={handleDeleteAccount} disabled={deleteConfirm !== 'SUPPRIMER' || deleting} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <Trash2 size={14} />{deleting ? 'Suppression...' : 'Supprimer définitivement'}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)
}
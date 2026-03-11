'use client'

import { useState } from 'react'
import { Application } from '@/lib/types'
import DocumentManager from '@/components/DocumentManager'
import { X, Building2, Briefcase, Link, User, Calendar, FileText, ChevronDown } from 'lucide-react'

type Props = {
  onClose: () => void
  onSave: (application: Application) => void
  initial?: Application | null
}

const STATUSES = [
  { value: 'to_apply',  label: 'À postuler' },
  { value: 'sent',      label: 'Envoyé'     },
  { value: 'interview', label: 'Entretien'  },
  { value: 'offer',     label: 'Offre'      },
  { value: 'rejected',  label: 'Refus'      },
]

const inputClass = "w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
const labelClass = "block text-xs font-medium text-gray-700 mb-1.5"

export default function ApplicationForm({ onClose, onSave, initial }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'documents'>('info')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const body = {
      company_name: formData.get('company_name'),
      job_title:    formData.get('job_title'),
      offer_url:    formData.get('offer_url'),
      hr_contact:   formData.get('hr_contact'),
      notes:        formData.get('notes'),
      applied_at:   formData.get('applied_at'),
      status:       formData.get('status'),
    }

    const url    = initial ? `/api/applications/${initial.id}` : '/api/applications'
    const method = initial ? 'PATCH' : 'POST'

    const res  = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    onSave(data)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {initial ? 'Modifier la candidature' : 'Nouvelle candidature'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {initial ? 'Modifie les informations ci-dessous' : 'Remplis les informations de ta candidature'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        {initial && (
          <div className="flex border-b border-gray-100 px-6">
            <button type="button" onClick={() => setActiveTab('info')} className={`py-3 text-sm font-medium border-b-2 mr-6 transition-colors ${activeTab === 'info' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              Informations
            </button>
            <button type="button" onClick={() => setActiveTab('documents')} className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'documents' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              Documents
            </button>
          </div>
        )}

        {/* Tab Documents */}
        {activeTab === 'documents' && initial && (
          <div className="px-6 py-4">
            <DocumentManager applicationId={initial.id} />
          </div>
        )}

        {/* Tab Informations */}
        {activeTab === 'info' && (
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 space-y-4">

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Entreprise <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input name="company_name" required defaultValue={initial?.company_name ?? ''} placeholder="Google" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Poste <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input name="job_title" required defaultValue={initial?.job_title ?? ''} placeholder="Stage Développeur" className={inputClass} />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Statut</label>
                <div className="relative">
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select name="status" defaultValue={initial?.status ?? 'to_apply'} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none bg-white">
                    {STATUSES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Lien de l'offre</label>
                <div className="relative">
                  <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input name="offer_url" type="url" defaultValue={initial?.offer_url ?? ''} placeholder="https://..." className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Contact RH</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input name="hr_contact" defaultValue={initial?.hr_contact ?? ''} placeholder="Marie Dupont" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Date de candidature</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input name="applied_at" type="date" defaultValue={initial?.applied_at ?? ''} className={inputClass} />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Notes</label>
                <div className="relative">
                  <FileText size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                  <textarea name="notes" defaultValue={initial?.notes ?? ''} rows={3} placeholder="Informations utiles, contexte, points à retenir..." className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none bg-white" />
                </div>
              </div>

              {error && <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                {loading ? 'Sauvegarde...' : initial ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { Application } from '@/lib/types'
import DocumentManager from '@/components/DocumentManager'
import { X, Building2, Briefcase, Link, User, Calendar, FileText, ChevronDown, Wand2, Loader2 } from 'lucide-react'

type Props = {
  onClose: () => void
  onSave: (application: Application) => void
  initial?: Application | null
}

const STATUSES = [
  { value: 'to_apply',  label: 'A postuler' },
  { value: 'sent',      label: 'Envoye'     },
  { value: 'interview', label: 'Entretien'  },
  { value: 'offer',     label: 'Offre'      },
  { value: 'rejected',  label: 'Refus'      },
]

const inputClass = "w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
const labelClass = "block text-xs font-medium text-gray-700 mb-1.5"

export default function ApplicationForm({ onClose, onSave, initial }: Props) {
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'documents'>('info')

  // Import IA
  const [importUrl, setImportUrl]     = useState('')
  const [importing, setImporting]     = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [imported, setImported]       = useState(false)

  // Champs controles
  const [companyName, setCompanyName] = useState(initial?.company_name ?? '')
  const [jobTitle, setJobTitle]       = useState(initial?.job_title ?? '')
  const [offerUrl, setOfferUrl]       = useState(initial?.offer_url ?? '')
  const [hrContact, setHrContact]     = useState(initial?.hr_contact ?? '')
  const [notes, setNotes]             = useState(initial?.notes ?? '')
  const [appliedAt, setAppliedAt]     = useState(initial?.applied_at ?? '')
  const [status, setStatus]           = useState(initial?.status ?? 'to_apply')
  const [remindAt, setRemindAt]       = useState(() => {
    if (initial?.remind_at) return initial.remind_at
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return d.toISOString().split('T')[0]
  })

  async function handleImport() {
    if (!importUrl) return
    setImporting(true)
    setImportError(null)
    setImported(false)

    const res  = await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: importUrl }),
    })
    const data = await res.json()

    if (!res.ok) {
      setImportError(data.error ?? "Erreur lors de l'import")
      setImporting(false)
      return
    }

    if (data.company_name) setCompanyName(data.company_name)
    if (data.job_title)    setJobTitle(data.job_title)
    if (data.hr_contact)   setHrContact(data.hr_contact)
    if (data.notes)        setNotes(data.notes)
    setOfferUrl(importUrl)
    setImported(true)
    setImporting(false)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const body = {
      company_name: companyName,
      job_title:    jobTitle,
      offer_url:    offerUrl,
      hr_contact:   hrContact,
      notes:        notes,
      applied_at:   appliedAt,
      remind_at:    remindAt,
      status:       status,
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
    <div className="fixed inset-0 bg-black/30 flex items-end md:items-center justify-center z-50 p-0 md:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-lg shadow-xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 flex-shrink-0">
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
          <div className="flex border-b border-gray-100 px-6 flex-shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`py-3 text-sm font-medium border-b-2 mr-6 transition-colors ${activeTab === 'info' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              Informations
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('documents')}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'documents' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              Documents
            </button>
          </div>
        )}

        {/* Tab Documents */}
        {activeTab === 'documents' && initial && (
          <div className="px-6 py-4 overflow-y-auto flex-1">
            <DocumentManager applicationId={initial.id} />
          </div>
        )}

        {/* Tab Informations */}
        {activeTab === 'info' && (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">

              {/* Import IA */}
              {!initial && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Wand2 size={14} className="text-indigo-600" />
                    <p className="text-xs font-medium text-indigo-700">Import automatique depuis une offre</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" />
                      <input
                        type="url"
                        value={importUrl}
                        onChange={e => { setImportUrl(e.target.value); setImported(false); setImportError(null) }}
                        placeholder="https://linkedin.com/jobs/..."
                        className="w-full pl-8 pr-3 py-2 border border-indigo-200 rounded-lg text-xs text-gray-900 placeholder:text-indigo-300 focus:outline-none focus:border-indigo-500 bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleImport}
                      disabled={importing || !importUrl}
                      className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex-shrink-0"
                    >
                      {importing
                        ? <><Loader2 size={13} className="animate-spin" /> Analyse...</>
                        : <><Wand2 size={13} /> Importer</>
                      }
                    </button>
                  </div>
                  {importError && <p className="text-xs text-red-500">{importError}</p>}
                  {imported  && <p className="text-xs text-green-600 font-medium">Formulaire pre-rempli avec succes !</p>}
                </div>
              )}

              {/* Entreprise + Poste */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Entreprise <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input name="company_name" required value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Google" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Poste <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input name="job_title" required value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Stage Developpeur" className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Statut */}
              <div>
                <label className={labelClass}>Statut</label>
                <div className="relative">
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select
                    name="status"
                    value={status}
                    onChange={e => setStatus(e.target.value as 'to_apply' | 'sent' | 'interview' | 'offer' | 'rejected')}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-indigo-500 appearance-none bg-white"
                  >
                    {STATUSES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lien offre */}
              <div>
                <label className={labelClass}>Lien de l'offre</label>
                <div className="relative">
                  <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input name="offer_url" type="url" value={offerUrl} onChange={e => setOfferUrl(e.target.value)} placeholder="https://..." className={inputClass} />
                </div>
              </div>

              {/* Contact RH + Date candidature */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Contact RH</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input name="hr_contact" value={hrContact} onChange={e => setHrContact(e.target.value)} placeholder="Marie Dupont" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Date de candidature</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input name="applied_at" type="date" value={appliedAt} onChange={e => setAppliedAt(e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Date de relance */}
              <div>
                <label className={labelClass}>Date de relance</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    name="remind_at"
                    type="date"
                    value={remindAt}
                    onChange={e => setRemindAt(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Tu recevras une notification si pas de reponse d'ici cette date
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className={labelClass}>Notes</label>
                <div className="relative">
                  <FileText size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                  <textarea
                    name="notes"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Informations utiles, contexte, points a retenir..."
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 resize-none bg-white"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            </div>

            {/* Boutons */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-white">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                {loading ? 'Sauvegarde...' : initial ? 'Mettre a jour' : 'Ajouter'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
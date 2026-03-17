'use client'

import { useEffect, useState } from 'react'
import { Company } from '@/lib/types'
import { Plus, Search, Building2, Globe, MapPin, Pencil, Trash2, X, ChevronDown } from 'lucide-react'
import { ToastContainer } from '@/components/Toast'
import { useToast } from '@/lib/useToast'
import Loader from '@/components/Loader'
import ConfirmModal from '@/components/ConfirmModal'

const inputClass = "w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
const labelClass = "block text-xs font-medium text-gray-700 mb-1.5"
const SECTORS    = ['Tech', 'Finance', 'Sante', 'Education', 'Commerce', 'Industrie', 'Medias', 'Conseil', 'Autre']

type CompanyFormProps = {
  onClose: () => void
  onSave:  (company: Company) => void
  initial?: Company | null
}

function CompanyForm({ onClose, onSave, initial }: CompanyFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const body = {
      name:     formData.get('name'),
      sector:   formData.get('sector'),
      website:  formData.get('website'),
      location: formData.get('location'),
      notes:    formData.get('notes'),
    }
    const url    = initial ? `/api/companies/${initial.id}` : '/api/companies'
    const method = initial ? 'PATCH' : 'POST'
    const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data   = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    onSave(data)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-end md:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-lg shadow-xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900">{initial ? "Modifier" : 'Nouvelle entreprise'}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
            <div>
              <label className={labelClass}>Nom *</label>
              <div className="relative">
                <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input name="name" required defaultValue={initial?.name ?? ''} placeholder="Nom de l'entreprise" className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Secteur</label>
                <div className="relative">
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select name="sector" defaultValue={initial?.sector ?? ''} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-indigo-500 appearance-none bg-white">
                    <option value="">Selectionnez</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Localisation</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input name="location" defaultValue={initial?.location ?? ''} placeholder="Paris" className={inputClass} />
                </div>
              </div>
            </div>
            <div>
              <label className={labelClass}>Site web</label>
              <div className="relative">
                <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input name="website" type="url" defaultValue={initial?.website ?? ''} placeholder="https://exemple.com" className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Notes</label>
              <textarea name="notes" defaultValue={initial?.notes ?? ''} rows={3} placeholder="Informations utiles..." className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 resize-none bg-white" />
            </div>
            {error && <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          </div>
          <div className="flex gap-3 px-5 py-4 border-t border-gray-100 flex-shrink-0 bg-white">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600">Annuler</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {loading ? 'Sauvegarde...' : initial ? 'Mettre a jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CompaniesPage() {
  const [companies, setCompanies]      = useState<Company[]>([])
  const [loading, setLoading]          = useState(true)
  const [search, setSearch]            = useState('')
  const [showForm, setShowForm]        = useState(false)
  const [editing, setEditing]          = useState<Company | null>(null)
  const [confirmId, setConfirmId]      = useState<string | null>(null)
  const { toasts, removeToast, toast } = useToast()

  useEffect(() => { setShowForm(false); setEditing(null); fetchCompanies() }, [])

  async function fetchCompanies() {
    const res  = await fetch('/api/companies')
    const data = await res.json()
    setCompanies(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/companies/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setCompanies(prev => prev.filter(c => c.id !== id))
      toast.success('Entreprise supprimee')
    } else {
      toast.error('Erreur lors de la suppression')
    }
    setConfirmId(null)
  }

  function handleSave(saved: Company) {
    setCompanies(prev => {
      const exists = prev.find(c => c.id === saved.id)
      if (exists) { toast.success('Entreprise mise a jour !'); return prev.map(c => c.id === saved.id ? saved : c) }
      toast.success('Entreprise ajoutee !')
      return [saved, ...prev]
    })
  }

  function handleCloseForm() { setShowForm(false); setEditing(null) }

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.sector?.toLowerCase().includes(search.toLowerCase()) ||
    c.location?.toLowerCase().includes(search.toLowerCase())
  )

if (loading) return <Loader />

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Entreprises</h1>
          <p className="text-gray-400 text-xs md:text-sm mt-0.5">{companies.length} entreprise{companies.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Nouvelle entreprise</span>
          <span className="sm:hidden">Nouveau</span>
        </button>
      </div>

      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 bg-white"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
            <Building2 size={22} className="text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm font-medium">Aucune entreprise</p>
          <p className="text-gray-400 text-xs mt-1">Ajoute ta premiere entreprise</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {filtered.map(company => (
            <div key={company.id} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 size={16} className="text-indigo-600" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(company); setShowForm(true) }} className="text-gray-400 hover:text-indigo-600 p-1 rounded transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setConfirmId(company.id)} className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{company.name}</h3>
              {company.sector && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{company.sector}</span>}
              <div className="mt-3 space-y-1.5">
                {company.location && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <MapPin size={11} /><span>{company.location}</span>
                  </div>
                )}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
                    <Globe size={11} /><span className="truncate">{company.website.replace('https://', '')}</span>
                  </a>
                )}
              </div>
              {company.notes && <p className="text-xs text-gray-400 mt-3 line-clamp-2">{company.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {showForm && <CompanyForm onClose={handleCloseForm} onSave={handleSave} initial={editing} />}

      {confirmId && (
        <ConfirmModal
          title="Supprimer l'entreprise"
          message="Cette entreprise sera definitivement supprimee."
          confirmLabel="Supprimer"
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
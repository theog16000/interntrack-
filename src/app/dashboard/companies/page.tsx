'use client'

import { useEffect, useState } from 'react'
import { Company } from '@/lib/types'
import {
  Plus, Building2, Globe, MapPin, Briefcase,
  Pencil, Trash2, X, ChevronDown, FileText
} from 'lucide-react'

const inputClass = "w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
const labelClass = "block text-xs font-medium text-gray-700 mb-1.5"

const SECTORS = [
  'Tech / Logiciel',
  'Finance / Banque',
  'Conseil',
  'Marketing / Communication',
  'Santé',
  'E-commerce',
  'Industrie',
  'Média',
  'Éducation',
  'Autre',
]

type CompanyFormProps = {
  onClose: () => void
  onSave: (company: Company) => void
  initial?: Company | null
}

function CompanyForm({ onClose, onSave, initial }: CompanyFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

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
              {initial ? 'Modifier l\'entreprise' : 'Nouvelle entreprise'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {initial ? 'Modifie les informations ci-dessous' : 'Ajoute une entreprise à ta liste'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">

            {/* Nom */}
            <div>
              <label className={labelClass}>Nom <span className="text-red-400">*</span></label>
              <div className="relative">
                <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  name="name"
                  required
                  defaultValue={initial?.name ?? ''}
                  placeholder="Google"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Secteur */}
            <div>
              <label className={labelClass}>Secteur</label>
              <div className="relative">
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  name="sector"
                  defaultValue={initial?.sector ?? ''}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none bg-white"
                >
                  <option value="">Sélectionne un secteur</option>
                  {SECTORS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Site web + Localisation */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Site web</label>
                <div className="relative">
                  <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    name="website"
                    type="url"
                    defaultValue={initial?.website ?? ''}
                    placeholder="https://..."
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Localisation</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    name="location"
                    defaultValue={initial?.location ?? ''}
                    placeholder="Paris, France"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className={labelClass}>Notes</label>
              <div className="relative">
                <FileText size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                <textarea
                  name="notes"
                  defaultValue={initial?.notes ?? ''}
                  rows={3}
                  placeholder="Informations utiles sur l'entreprise..."
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none bg-white"
                />
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
      </div>
    </div>
  )
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setShowForm(false)
    setEditingCompany(null)
    fetchCompanies()
  }, [])

  async function fetchCompanies() {
    const res = await fetch('/api/companies')
    const data = await res.json()
    setCompanies(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette entreprise ?')) return
    await fetch(`/api/companies/${id}`, { method: 'DELETE' })
    setCompanies(prev => prev.filter(c => c.id !== id))
  }

  function handleSave(updated: Company) {
    setCompanies(prev => {
      const exists = prev.find(c => c.id === updated.id)
      if (exists) return prev.map(c => c.id === updated.id ? updated : c)
      return [updated, ...prev]
    })
  }

  function handleCloseForm() {
    setShowForm(false)
    setEditingCompany(null)
  }

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.sector?.toLowerCase().includes(search.toLowerCase()) ||
    c.location?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Entreprises</h1>
          <p className="text-gray-400 text-sm mt-1">
            {companies.length} entreprise{companies.length > 1 ? 's' : ''} enregistrée{companies.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white w-52"
          />
          <button
            onClick={() => { setEditingCompany(null); setShowForm(true) }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} />
            Nouvelle entreprise
          </button>
        </div>
      </div>

      {/* Grille */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
            <Building2 size={22} className="text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm font-medium">Aucune entreprise</p>
          <p className="text-gray-400 text-xs mt-1">Ajoute ta première entreprise pour commencer</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(company => (
            <div key={company.id} className="bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-200 hover:shadow-sm transition-all group">

              {/* Header carte */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 size={18} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{company.name}</h3>
                    {company.sector && (
                      <p className="text-xs text-gray-400 mt-0.5">{company.sector}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingCompany(company); setShowForm(true) }} className="text-gray-300 hover:text-indigo-600 p-1 rounded transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(company.id)} className="text-gray-300 hover:text-red-500 p-1 rounded transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Infos */}
              <div className="space-y-2">
                {company.location && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <MapPin size={12} className="flex-shrink-0" />
                    <span>{company.location}</span>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center gap-2 text-xs text-indigo-500">
                    <Globe size={12} className="flex-shrink-0" />
                    <a href={company.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="hover:text-indigo-700 truncate transition-colors">
                      {company.website.replace('https://', '').replace('http://', '')}
                    </a>
                  </div>
                )}
                {company.notes && (
                  <div className="flex items-start gap-2 text-xs text-gray-400">
                    <FileText size={12} className="flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{company.notes}</span>
                  </div>
                )}
              </div>

              {/* Footer — nb candidatures */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                <Briefcase size={12} className="text-gray-400" />
                <span className="text-xs text-gray-400">
                  {company.applications?.length ?? 0} candidature{(company.applications?.length ?? 0) > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modale */}
      {showForm && (
        <CompanyForm
          onClose={handleCloseForm}
          onSave={handleSave}
          initial={editingCompany}
        />
      )}
    </div>
  )
}
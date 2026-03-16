'use client'

import { useEffect, useState } from 'react'
import { Application, COLUMNS, Status } from '@/lib/types'
import ApplicationCard from '@/components/ApplicationCard'
import ApplicationForm from '@/components/ApplicationForm'
import { Plus, LayoutGrid, List, ArrowUpDown, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { ToastContainer } from '@/components/Toast'
import { useToast } from '@/lib/useToast'

type SortKey = 'created_at' | 'company_name' | 'applied_at'
type View = 'kanban' | 'list'

const STATUS_BADGE: Record<Status, { label: string; className: string }> = {
  to_apply:  { label: 'À postuler', className: 'bg-gray-100 text-gray-600'    },
  sent:      { label: 'Envoyé',     className: 'bg-blue-100 text-blue-600'    },
  interview: { label: 'Entretien',  className: 'bg-orange-100 text-orange-600'},
  offer:     { label: 'Offre',      className: 'bg-green-100 text-green-600'  },
  rejected:  { label: 'Refus',      className: 'bg-red-100 text-red-600'      },
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading]           = useState(true)
  const [showForm, setShowForm]         = useState(false)
  const [editingApp, setEditingApp]     = useState<Application | null>(null)
  const [draggedId, setDraggedId]       = useState<string | null>(null)
  const [dragOverCol, setDragOverCol]   = useState<string | null>(null)
  const [view, setView]                 = useState<View>('kanban')
  const [sortKey, setSortKey]           = useState<SortKey>('created_at')
  const [sortAsc, setSortAsc]           = useState(false)
  const { toasts, removeToast, toast }  = useToast()

  useEffect(() => {
    setShowForm(false)
    setEditingApp(null)
    fetchApplications()
  }, [])

  async function fetchApplications() {
    const res  = await fetch('/api/applications')
    const data = await res.json()
    setApplications(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  function getByStatus(status: Status) {
    return applications.filter(a => a.status === status)
  }

  function getSorted() {
    return [...applications].sort((a, b) => {
      let valA = a[sortKey] ?? ''
      let valB = b[sortKey] ?? ''
      if (sortKey === 'company_name') {
        valA = valA.toString().toLowerCase()
        valB = valB.toString().toLowerCase()
      }
      return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1)
    })
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(true) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette candidature ?')) return
    const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setApplications(prev => prev.filter(a => a.id !== id))
      toast.success('Candidature supprimée')
    } else {
      toast.error('Erreur lors de la suppression')
    }
  }

  function handleSave(updated: Application) {
    setApplications(prev => {
      const exists = prev.find(a => a.id === updated.id)
      if (exists) {
        toast.success('Candidature mise à jour !')
        return prev.map(a => a.id === updated.id ? updated : a)
      }
      toast.success('Candidature ajoutée !')
      return [updated, ...prev]
    })
  }

  function handleCloseForm() {
    setShowForm(false)
    setEditingApp(null)
  }

  async function handleDrop(status: Status) {
    if (!draggedId) return
    const prevStatus = applications.find(a => a.id === draggedId)?.status
    if (prevStatus === status) { setDraggedId(null); setDragOverCol(null); return }

    setApplications(prev => prev.map(a => a.id === draggedId ? { ...a, status } : a))

    const res = await fetch(`/api/applications/${draggedId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    if (res.ok) {
      const data = await res.json()
      setApplications(prev => prev.map(a => a.id === draggedId ? data : a))
      toast.success(`Déplacé vers "${COLUMNS.find(c => c.id === status)?.label}"`)
    } else {
      setApplications(prev => prev.map(a => a.id === draggedId ? { ...a, status: prevStatus! } : a))
      toast.error('Erreur lors du déplacement')
    }

    setDraggedId(null)
    setDragOverCol(null)
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

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Mes candidatures</h1>
          <p className="text-gray-400 text-xs md:text-sm mt-0.5">
            {applications.length} candidature{applications.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="flex items-center gap-2">

          {/* Tri desktop liste */}
          {view === 'list' && (
            <div className="hidden md:flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
              <ArrowUpDown size={14} className="text-gray-400" />
              <select
                value={sortKey}
                onChange={e => setSortKey(e.target.value as SortKey)}
                className="text-sm text-gray-600 focus:outline-none bg-transparent"
              >
                <option value="created_at">Date d'ajout</option>
                <option value="applied_at">Date candidature</option>
                <option value="company_name">Entreprise (A-Z)</option>
              </select>
              <button onClick={() => setSortAsc(!sortAsc)} className="text-gray-400 hover:text-gray-600 ml-1">
                {sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          )}

          {/* Toggle vue */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('kanban')}
              className={`p-2 transition-colors ${view === 'kanban' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 transition-colors ${view === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <List size={15} />
            </button>
          </div>

          <button
            onClick={() => { setEditingApp(null); setShowForm(true) }}
            className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Nouvelle candidature</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>
      </div>

      {/* Vue Kanban */}
      {view === 'kanban' && (
  <>
    {/* Desktop — Kanban */}
    <div className="hidden md:grid md:grid-cols-5 gap-3">
      {COLUMNS.map(column => {
        const colApps = getByStatus(column.id)
        const isOver  = dragOverCol === column.id
        return (
          <div
            key={column.id}
            className={`${column.color} rounded-xl p-3 min-h-32 transition-all ${
              isOver ? 'ring-2 ring-indigo-400 ring-offset-1' : ''
            }`}
            onDragOver={e => { e.preventDefault(); setDragOverCol(column.id) }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={() => handleDrop(column.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-medium text-gray-700">{column.label}</h2>
              <span className="bg-white text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">
                {colApps.length}
              </span>
            </div>
            <div className="space-y-2">
              {colApps.map(app => (
                <div
                  key={app.id}
                  draggable
                  onDragStart={() => setDraggedId(app.id)}
                  onDragEnd={() => { setDraggedId(null); setDragOverCol(null) }}
                  className={`cursor-grab active:cursor-grabbing transition-opacity ${
                    draggedId === app.id ? 'opacity-40' : 'opacity-100'
                  }`}
                >
                  <ApplicationCard
                    application={app}
                    onDelete={handleDelete}
                    onEdit={(app) => { setEditingApp(app); setShowForm(true) }}
                  />
                </div>
              ))}
              {colApps.length === 0 && (
                <p className={`text-center text-xs py-8 transition-colors ${
                  isOver ? 'text-indigo-400 font-medium' : 'text-gray-300'
                }`}>
                  {isOver ? 'Deposer ici' : 'Glisse une carte ici'}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>

    {/* Mobile — Liste par statut */}
    <div className="md:hidden space-y-4">
      {COLUMNS.map(column => {
        const colApps = getByStatus(column.id)
        if (colApps.length === 0) return null
        return (
          <div key={column.id}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[column.id]}`}>
                {column.label}
              </span>
              <span className="text-xs text-gray-400">{colApps.length}</span>
            </div>
            <div className="space-y-2">
              {colApps.map(app => (
                <div key={app.id} className="bg-white border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{app.company_name}</p>
                  </div>
                  <p className="text-xs text-gray-400 truncate mb-3">{app.job_title}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-300">
                      {app.applied_at ? new Date(app.applied_at).toLocaleDateString('fr-FR') : '—'}
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingApp(app); setShowForm(true) }}
                        className="text-gray-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
      {applications.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-gray-400 text-sm">Aucune candidature pour l'instant</p>
        </div>
      )}
    </div>
  </>
)}

      {/* Vue Liste */}
      {view === 'list' && (
        <div>

          {/* Tri mobile */}
          <div className="flex items-center gap-2 mb-4 md:hidden overflow-x-auto pb-1">
            <span className="text-xs text-gray-500 flex-shrink-0">Trier :</span>
            {([
              { key: 'created_at',   label: 'Ajout'       },
              { key: 'applied_at',   label: 'Candidature' },
              { key: 'company_name', label: 'Entreprise'  },
            ] as const).map(s => (
              <button
                key={s.key}
                onClick={() => toggleSort(s.key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                  sortKey === s.key ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-500'
                }`}
              >
                {s.label}
                {sortKey === s.key && (sortAsc ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
              </button>
            ))}
          </div>

          {/* Tableau desktop */}
          <div className="hidden md:block bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50">
              <button onClick={() => toggleSort('company_name')} className="col-span-3 flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 text-left">
                Entreprise
                {sortKey === 'company_name' && (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
              </button>
              <p className="col-span-3 text-xs font-medium text-gray-500">Poste</p>
              <p className="col-span-2 text-xs font-medium text-gray-500">Statut</p>
              <button onClick={() => toggleSort('applied_at')} className="col-span-2 flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 text-left">
                Date
                {sortKey === 'applied_at' && (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
              </button>
              <p className="col-span-2 text-xs font-medium text-gray-500">Contact RH</p>
            </div>
            {getSorted().length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-gray-400 text-sm">Aucune candidature pour l'instant</p>
              </div>
            ) : (
              getSorted().map(app => (
                <div key={app.id} className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors group items-center">
                  <p className="col-span-3 text-sm font-medium text-gray-900 truncate">{app.company_name}</p>
                  <p className="col-span-3 text-sm text-gray-500 truncate">{app.job_title}</p>
                  <div className="col-span-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_BADGE[app.status].className}`}>
                      {STATUS_BADGE[app.status].label}
                    </span>
                  </div>
                  <p className="col-span-2 text-sm text-gray-400">
                    {app.applied_at ? new Date(app.applied_at).toLocaleDateString('fr-FR') : '—'}
                  </p>
                  <div className="col-span-2 flex items-center justify-between">
                    <p className="text-sm text-gray-400 truncate">{app.hr_contact || '—'}</p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingApp(app); setShowForm(true) }} className="text-gray-400 hover:text-indigo-600 p-1">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(app.id)} className="text-gray-400 hover:text-red-500 p-1">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cartes mobile */}
          <div className="md:hidden space-y-2">
            {getSorted().length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-gray-400 text-sm">Aucune candidature pour l'instant</p>
              </div>
            ) : (
              getSorted().map(app => (
                <div
                  key={app.id}
                  className="bg-white border border-gray-100 rounded-xl p-4 active:scale-[0.99] transition-transform"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{app.company_name}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{app.job_title}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_BADGE[app.status].className}`}>
                      {STATUS_BADGE[app.status].label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <p className="text-xs text-gray-300">
                      {app.applied_at ? new Date(app.applied_at).toLocaleDateString('fr-FR') : '—'}
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingApp(app); setShowForm(true) }}
                        className="text-gray-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showForm && (
        <ApplicationForm
          onClose={handleCloseForm}
          onSave={handleSave}
          initial={editingApp}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
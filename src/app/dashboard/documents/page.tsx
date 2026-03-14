'use client'

import { useEffect, useState } from 'react'
import { Document } from '@/lib/types'
import { FileText, Upload, Trash2, Download, File, FileBadge, Paperclip } from 'lucide-react'
import { ToastContainer } from '@/components/Toast'
import { useToast } from '@/lib/useToast'

const FILE_TYPE_CONFIG = {
  cv:           { label: 'CV',               icon: FileBadge,  className: 'bg-indigo-50 text-indigo-600' },
  cover_letter: { label: 'Lettre de motiv.', icon: FileText,   className: 'bg-blue-50 text-blue-600'    },
  other:        { label: 'Autre',            icon: Paperclip,  className: 'bg-gray-50 text-gray-600'    },
}

export default function DocumentsPage() {
  const [documents, setDocuments]       = useState<Document[]>([])
  const [loading, setLoading]           = useState(true)
  const [uploading, setUploading]       = useState(false)
  const [filter, setFilter]             = useState<'all' | 'cv' | 'cover_letter' | 'other'>('all')
  const { toasts, removeToast, toast }  = useToast()

  useEffect(() => { fetchDocuments() }, [])

  async function fetchDocuments() {
    const res  = await fetch('/api/documents/all')
    const data = await res.json()
    setDocuments(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('file_type',
      file.name.toLowerCase().includes('cv') ? 'cv'
      : file.name.toLowerCase().includes('lettre') ? 'cover_letter'
      : 'other'
    )

    const res  = await fetch('/api/documents/upload', { method: 'POST', body: formData })
    const data = await res.json()

    if (!res.ok) {
      toast.error(data.error ?? 'Erreur lors de l\'upload')
    } else {
      setDocuments(prev => [data, ...prev])
      toast.success('Document ajouté !')
    }

    setUploading(false)
    e.target.value = ''
  }

  async function handleDownload(id: string) {
    const res  = await fetch(`/api/documents/${id}`)
    const data = await res.json()
    if (data.url) {
      window.open(data.url, '_blank')
      toast.info('Téléchargement en cours...')
    } else {
      toast.error('Impossible de télécharger le document')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce document ?')) return
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setDocuments(prev => prev.filter(d => d.id !== id))
      toast.success('Document supprimé')
    } else {
      toast.error('Erreur lors de la suppression')
    }
  }

  const filtered = filter === 'all' ? documents : documents.filter(d => d.file_type === filter)
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  const formatSize = (name: string) => name.split('.').pop()?.toUpperCase() ?? 'FILE'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Mes documents</h1>
          <p className="text-gray-400 text-sm mt-1">{documents.length} document{documents.length > 1 ? 's' : ''} au total</p>
        </div>
        <label className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${uploading ? 'bg-gray-100 text-gray-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
          <Upload size={16} />
          {uploading ? 'Upload...' : 'Ajouter un document'}
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
      </div>

      <div className="flex gap-2 mb-6">
        {([
          { key: 'all',          label: 'Tous'              },
          { key: 'cv',           label: 'CV'                },
          { key: 'cover_letter', label: 'Lettres de motiv.' },
          { key: 'other',        label: 'Autres'            },
        ] as const).map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f.key ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
            {f.label}
            <span className="ml-1.5 opacity-60">
              {f.key === 'all' ? documents.length : documents.filter(d => d.file_type === f.key).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
            <File size={22} className="text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm font-medium">Aucun document</p>
          <p className="text-gray-400 text-xs mt-1">Ajoute ton premier document en cliquant sur le bouton</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50">
            <p className="col-span-5 text-xs font-medium text-gray-500">Nom</p>
            <p className="col-span-2 text-xs font-medium text-gray-500">Type</p>
            <p className="col-span-2 text-xs font-medium text-gray-500">Format</p>
            <p className="col-span-2 text-xs font-medium text-gray-500">Ajouté le</p>
            <p className="col-span-1 text-xs font-medium text-gray-500"></p>
          </div>
          {filtered.map(doc => {
            const config = FILE_TYPE_CONFIG[doc.file_type]
            const Icon = config.icon
            return (
              <div key={doc.id} className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors group items-center">
                <div className="col-span-5 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.className}`}>
                    <Icon size={14} />
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                </div>
                <div className="col-span-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.className}`}>{config.label}</span>
                </div>
                <p className="col-span-2 text-xs text-gray-400 font-mono">{formatSize(doc.name)}</p>
                <p className="col-span-2 text-sm text-gray-400">{formatDate(doc.created_at)}</p>
                <div className="col-span-1 flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDownload(doc.id)} className="text-gray-400 hover:text-indigo-600 p-1 rounded transition-colors">
                    <Download size={14} />
                  </button>
                  <button onClick={() => handleDelete(doc.id)} className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
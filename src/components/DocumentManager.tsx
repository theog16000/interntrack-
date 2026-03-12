'use client'

import { useState, useEffect } from 'react'
import { Document } from '@/lib/types'
import { Upload, Download, Trash2, FileText, FileBadge, Paperclip, Link } from 'lucide-react'

type Props = {
  applicationId: string
}

const FILE_TYPE_CONFIG = {
  cv:           { label: 'CV',               icon: FileBadge,  className: 'bg-indigo-50 text-indigo-600' },
  cover_letter: { label: 'Lettre de motiv.', icon: FileText,   className: 'bg-blue-50 text-blue-600'    },
  other:        { label: 'Autre',            icon: Paperclip,  className: 'bg-gray-50 text-gray-600'    },
}

export default function DocumentManager({ applicationId }: Props) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [allDocuments, setAllDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLinkModal, setShowLinkModal] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [applicationId])

  async function fetchDocuments() {
    const res = await fetch(`/api/documents?application_id=${applicationId}`)
    const data = await res.json()
    setDocuments(Array.isArray(data) ? data : [])
  }

  async function fetchAllDocuments() {
    const res = await fetch('/api/documents/all')
    const data = await res.json()
    // Filtre les docs déjà liés à cette candidature
    const linked = documents.map(d => d.id)
    setAllDocuments(Array.isArray(data) ? data.filter((d: Document) => !linked.includes(d.id)) : [])
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('application_id', applicationId)
    formData.append('file_type',
      file.name.toLowerCase().includes('cv') ? 'cv'
      : file.name.toLowerCase().includes('lettre') ? 'cover_letter'
      : 'other'
    )

    const res = await fetch('/api/documents', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
    } else {
      setDocuments(prev => [...prev, data])
    }

    setUploading(false)
    e.target.value = ''
  }

  async function handleDownload(id: string) {
    const res = await fetch(`/api/documents/${id}`)
    const data = await res.json()
    if (data.url) window.open(data.url, '_blank')
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce document ?')) return
    await fetch(`/api/documents/${id}`, { method: 'DELETE' })
    setDocuments(prev => prev.filter(d => d.id !== id))
  }

  async function handleLink(documentId: string) {
    const res = await fetch('/api/documents/link', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_id: documentId, application_id: applicationId }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      return
    }

    setDocuments(prev => [...prev, data])
    setAllDocuments(prev => prev.filter(d => d.id !== documentId))
    setShowLinkModal(false)
  }

  async function openLinkModal() {
    await fetchAllDocuments()
    setShowLinkModal(true)
  }

  return (
    <div>

      {/* Actions */}
      <div className="flex gap-2 mb-4">
        <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${uploading ? 'bg-gray-100 text-gray-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
          <Upload size={13} />
          {uploading ? 'Upload...' : 'Nouveau document'}
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>

        <button
          type="button"
          onClick={openLinkModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Link size={13} />
          Lier un document existant
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg mb-3">{error}</p>
      )}

      {/* Liste documents liés */}
      {documents.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-400 text-xs">Aucun document lié à cette candidature</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map(doc => {
            const config = FILE_TYPE_CONFIG[doc.file_type]
            const Icon = config.icon
            return (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${config.className}`}>
                    <Icon size={13} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 truncate max-w-48">{doc.name}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${config.className}`}>
                      {config.label}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDownload(doc.id)} className="text-gray-400 hover:text-indigo-600 p-1 rounded transition-colors">
                    <Download size={13} />
                  </button>
                  <button onClick={() => handleDelete(doc.id)} className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal lier un document */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setShowLinkModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>

            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Lier un document</h3>
              <button type="button" onClick={() => setShowLinkModal(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-xs">
                ✕
              </button>
            </div>

            <div className="px-6 py-4">
              {allDocuments.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">
                  Aucun document disponible à lier
                </p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {allDocuments.map(doc => {
                    const config = FILE_TYPE_CONFIG[doc.file_type]
                    const Icon = config.icon
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => handleLink(doc.id)}
                        className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-indigo-50 rounded-xl transition-colors text-left group"
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${config.className}`}>
                          <Icon size={13} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{doc.name}</p>
                          <p className="text-xs text-gray-400">{config.label}</p>
                        </div>
                        <Link size={13} className="ml-auto text-gray-300 group-hover:text-indigo-500 flex-shrink-0 transition-colors" />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
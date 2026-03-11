'use client'

import { useState, useEffect } from 'react'

type Document = {
  id: string
  name: string
  file_type: string
  created_at: string
}

type Props = {
  applicationId: string
}

export default function DocumentManager({ applicationId }: Props) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [applicationId])

  async function fetchDocuments() {
    const res = await fetch(`/api/documents?application_id=${applicationId}`)
    const data = await res.json()
    setDocuments(data)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('application_id', applicationId)
    formData.append('file_type', file.name.toLowerCase().includes('cv') ? 'cv' : 'cover_letter')

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

  async function handleDownload(id: string, name: string) {
    const res = await fetch(`/api/documents/${id}`)
    const data = await res.json()
    if (data.url) {
      window.open(data.url, '_blank')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce document ?')) return
    await fetch(`/api/documents/${id}`, { method: 'DELETE' })
    setDocuments(prev => prev.filter(d => d.id !== id))
  }

  const fileTypeLabel = (type: string) => {
    if (type === 'cv') return '📄 CV'
    if (type === 'cover_letter') return '✉️ Lettre'
    return '📎 Autre'
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Documents</h3>
        <label className={`cursor-pointer text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${uploading ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
          {uploading ? 'Upload...' : '+ Ajouter'}
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <p className="text-red-500 text-xs bg-red-50 p-2 rounded-lg mb-3">{error}</p>
      )}

      {documents.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
          Aucun document
        </p>
      ) : (
        <div className="space-y-2">
          {documents.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
              <div>
                <span className="text-xs font-medium text-gray-700">{fileTypeLabel(doc.file_type)}</span>
                <p className="text-xs text-gray-400 truncate max-w-48">{doc.name}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(doc.id, doc.name)}
                  className="text-xs text-indigo-500 hover:text-indigo-700"
                >
                  ⬇️
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-xs text-gray-400 hover:text-red-500"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
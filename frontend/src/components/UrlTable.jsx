import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteUrl, updateUrl } from '../api/url'
import {
  Copy, Check, Trash2, BarChart2, ExternalLink,
  Edit2, X, Save, Link2, MousePointerClick
} from 'lucide-react'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md text-ink-400 hover:text-acid hover:bg-acid/10 transition-colors"
      title="Copy short URL"
    >
      {copied ? <Check size={14} className="text-acid" /> : <Copy size={14} />}
    </button>
  )
}

function UrlRow({ url, onDelete, onUpdate }) {
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(url.originalUrl)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Delete this URL? All analytics will be lost.')) return
    setDeleting(true)
    try {
      await deleteUrl(url.id || url._id)
      onDelete(url.id || url._id)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const handleSave = async () => {
    if (!editValue.trim()) return
    setSaving(true)
    try {
      const updated = await updateUrl(url.id || url._id, { originalUrl: editValue.trim() })
      onUpdate(updated)
      setEditing(false)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

const shortUrl = `${import.meta.env.VITE_SERVER_URL}/${url.shortCode}`

  return (
    <div className="card p-4 group animate-slide-up hover:border-ink-600 transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* URL info */}
        <div className="flex-1 min-w-0">
          {/* Short URL */}
          <div className="flex items-center gap-2 mb-2">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-acid hover:text-acid-light transition-colors truncate"
            >
              {shortUrl}
            </a>
            <CopyButton text={shortUrl} />
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md text-ink-400 hover:text-sky hover:bg-sky/10 transition-colors"
              title="Open short URL"
            >
              <ExternalLink size={13} />
            </a>
          </div>

          {/* Original URL */}
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="input-field text-sm py-1.5 flex-1"
                autoFocus
              />
              <button
                onClick={handleSave}
                disabled={saving}
                className="p-1.5 rounded-md bg-acid/10 text-acid hover:bg-acid/20 transition-colors"
              >
                {saving ? (
                  <span className="w-3.5 h-3.5 border-2 border-acid/30 border-t-acid rounded-full animate-spin block" />
                ) : <Save size={14} />}
              </button>
              <button
                onClick={() => { setEditing(false); setEditValue(url.originalUrl) }}
                className="p-1.5 rounded-md text-ink-400 hover:text-coral hover:bg-coral/10 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link2 size={12} className="text-ink-500 shrink-0" />
              <p className="text-sm text-ink-400 truncate">{url.originalUrl}</p>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-3 mt-3">
            <span className="flex items-center gap-1.5 text-xs text-ink-500">
              <MousePointerClick size={12} />
              {url.clicks ?? url.clickCount ?? 0} clicks
            </span>
            {url.createdAt && (
              <span className="text-xs text-ink-600">
                {new Date(url.createdAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                })}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => navigate(`/analytics/${url.id || url._id}`)}
            className="p-2 rounded-lg text-ink-400 hover:text-sky hover:bg-sky/10 transition-colors"
            title="View analytics"
          >
            <BarChart2 size={15} />
          </button>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="p-2 rounded-lg text-ink-400 hover:text-acid hover:bg-acid/10 transition-colors"
              title="Edit URL"
            >
              <Edit2 size={15} />
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 rounded-lg text-ink-400 hover:text-coral hover:bg-coral/10 transition-colors"
            title="Delete URL"
          >
            {deleting
              ? <span className="w-3.5 h-3.5 border-2 border-coral/30 border-t-coral rounded-full animate-spin block" />
              : <Trash2 size={15} />
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export default function UrlTable({ urls, onDelete, onUpdate }) {
  if (!urls || urls.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-ink-800 border border-ink-700 flex items-center
                        justify-center mx-auto mb-4">
          <Link2 size={22} className="text-ink-500" />
        </div>
        <p className="font-display font-bold text-ink-300 mb-1">No URLs yet</p>
        <p className="text-sm text-ink-500">Shorten your first URL above to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {urls.map((url) => (
        <UrlRow
          key={url.id || url._id}
          url={url}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  )
}
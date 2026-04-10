import { useState } from 'react'
import { createUrl } from '../api/url'
import { Link2, Zap, ChevronDown } from 'lucide-react'

export default function UrlForm({ onCreated }) {
  const [originalUrl, setOriginalUrl] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!originalUrl.trim()) return

    setLoading(true)
    setError('')
    try {
      const result = await createUrl({
        originalUrl: originalUrl.trim(),
        customCode: customCode.trim() || undefined,
      })
      setOriginalUrl('')
      setCustomCode('')
      setShowAdvanced(false)
      onCreated?.(result)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to shorten URL. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-6 animate-slide-up">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-md bg-acid/10 flex items-center justify-center">
          <Zap size={14} className="text-acid" />
        </div>
        <h2 className="font-display font-bold text-lg text-ink-50">Shorten a URL</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="url"
              className="input-field pl-9"
              placeholder="https://your-very-long-url.com/goes/here"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !originalUrl.trim()}
            className="btn-primary whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-ink-900/30 border-t-ink-900
                                 rounded-full animate-spin" />
                Snipping…
              </span>
            ) : 'Snip it'}
          </button>
        </div>

        {/* Advanced toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs text-ink-400 hover:text-ink-200 transition-colors"
        >
          <ChevronDown
            size={13}
            className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
          />
          Custom alias
        </button>

        {showAdvanced && (
          <div className="animate-slide-up">
            <input
              type="text"
              className="input-field font-mono text-sm"
              placeholder="my-custom-code (optional)"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value.replace(/\s/g, '-'))}
              maxLength={30}
            />
            <p className="text-xs text-ink-500 mt-1.5">
              Letters, numbers, and hyphens only. Leave blank for a random code.
            </p>
          </div>
        )}

        {error && (
          <p className="text-sm text-coral bg-coral/10 border border-coral/20 rounded-lg px-4 py-2.5 animate-fade-in">
            {error}
          </p>
        )}
      </form>
    </div>
  )
}
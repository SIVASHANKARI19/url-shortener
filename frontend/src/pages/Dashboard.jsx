import { useState, useEffect } from 'react'
import { getUrls } from '../api/url'
import UrlForm from '../components/UrlForm'
import UrlTable from '../components/UrlTable'
import { useAuth } from '../context/AuthContext'
import { Link2, MousePointerClick, TrendingUp, Clock } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color = 'acid' }) {
  const colors = {
    acid: 'text-acid bg-acid/10',
    sky: 'text-sky bg-sky/10',
    coral: 'text-coral bg-coral/10',
  }
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-ink-50">{value}</p>
        <p className="text-xs text-ink-500 font-body">{label}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchUrls = async () => {
    try {
      const data = await getUrls()
      // Handle various response shapes
      setUrls(Array.isArray(data) ? data : data.urls || data.data || [])
    } catch (err) {
      setError('Failed to load your URLs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUrls()
  }, [])

  const handleCreated = (newUrl) => {
    setUrls((prev) => [newUrl.url || newUrl, ...prev])
  }

  const handleDelete = (deletedId) => {
    setUrls((prev) => prev.filter((u) => (u.id || u._id) !== deletedId))
  }

  const handleUpdate = (updated) => {
    setUrls((prev) =>
      prev.map((u) =>
        (u.id || u._id) === (updated.id || updated._id) ? { ...u, ...updated } : u
      )
    )
  }

  const totalClicks = urls.reduce((sum, u) => sum + (u.clicks ?? u.clickCount ?? 0), 0)
  const mostRecent = urls[0]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <h1 className="font-display font-bold text-3xl text-ink-50">
          {user?.name ? `Hey, ${user.name.split(' ')[0]} 👋` : 'Dashboard'}
        </h1>
        <p className="text-ink-400 font-body mt-1">Manage and track all your shortened links.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Link2} label="Total links" value={urls.length} color="acid" />
        <StatCard icon={MousePointerClick} label="Total clicks" value={totalClicks} color="sky" />
        <div className="hidden lg:block">
          <StatCard
            icon={Clock}
            label="Latest link"
            value={mostRecent ? new Date(mostRecent.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
            color="coral"
          />
        </div>
      </div>

      {/* Create form */}
      <div className="mb-8">
        <UrlForm onCreated={handleCreated} />
      </div>

      {/* URL list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-ink-200">
            Your links
            {urls.length > 0 && (
              <span className="ml-2 text-sm font-body font-400 text-ink-500">
                ({urls.length})
              </span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="card p-4 h-20 animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        ) : error ? (
          <div className="card p-8 text-center">
            <p className="text-coral text-sm">{error}</p>
            <button onClick={fetchUrls} className="btn-ghost text-sm mt-4 py-2 px-4">
              Retry
            </button>
          </div>
        ) : (
          <UrlTable urls={urls} onDelete={handleDelete} onUpdate={handleUpdate} />
        )}
      </div>
    </div>
  )
}
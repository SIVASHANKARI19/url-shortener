import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getAnalytics } from '../api/url'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  ArrowLeft, MousePointerClick, Globe, Smartphone,
  TrendingUp, Link2, ExternalLink, Copy, Check
} from 'lucide-react'

const ACID = '#C8F135'
const SKY = '#5C9EFF'
const CORAL = '#FF5C5C'
const PURPLE = '#A78BFA'
const PALETTE = [ACID, SKY, CORAL, PURPLE, '#FB923C', '#34D399']

function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} className={color} />
        <span className="text-xs text-ink-500 font-body uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-3xl font-display font-bold text-ink-50">{value ?? '—'}</p>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-4 py-3 shadow-xl">
      <p className="text-xs text-ink-400 mb-1">{label}</p>
      <p className="font-display font-bold text-acid">{payload[0].value} clicks</p>
    </div>
  )
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-4 py-3 shadow-xl">
      <p className="text-xs text-ink-300">{payload[0].name}</p>
      <p className="font-display font-bold text-ink-50">{payload[0].value} clicks</p>
    </div>
  )
}

export default function Analytics() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getAnalytics(id)
        // Normalize: result may be { analytics, url } or { data }
        setData(result.analytics || result.data || result)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleCopy = async () => {
    const url = data?.url?.shortUrl || data?.shortUrl || ''
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-ink-800 animate-pulse" />
          <div className="h-8 w-48 rounded-lg bg-ink-800 animate-pulse" />
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[1,2,3].map(i => <div key={i} className="card h-24 animate-pulse" />)}
        </div>
        <div className="card h-72 animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 text-center">
        <p className="text-coral mb-4">{error}</p>
        <Link to="/dashboard" className="btn-ghost text-sm py-2 px-4">Back to Dashboard</Link>
      </div>
    )
  }

  // Shape the data — adapt field names to whatever backend returns
  const totalClicks = data?.totalClicks ?? data?.clicks ?? 0
  const shortUrl = data?.url?.shortUrl || data?.shortUrl || ''
  const originalUrl = data?.url?.originalUrl || data?.originalUrl || ''

  // Daily clicks chart: expect [{ date, clicks }] or similar
  const dailyData = (data?.clicksByDay || data?.dailyClicks || []).map((d) => ({
    date: d.date || d.day || d._id,
    clicks: d.clicks || d.count || 0,
  }))

  // Referrers: expect [{ source, count }]
  const referrers = (data?.referrers || data?.topReferrers || []).slice(0, 6).map((r) => ({
    name: r.source || r.referrer || r.name || 'Direct',
    value: r.count || r.clicks || 0,
  }))

  // Devices: expect [{ device, count }]
  const devices = (data?.devices || data?.deviceBreakdown || []).map((d) => ({
    name: d.device || d.type || d.name || 'Unknown',
    value: d.count || d.clicks || 0,
  }))

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 animate-slide-up">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm text-ink-400 hover:text-ink-100
                       transition-colors mb-4"
          >
            <ArrowLeft size={15} />
            Back to Dashboard
          </button>
          <h1 className="font-display font-bold text-3xl text-ink-50 mb-1">Analytics</h1>
          {shortUrl && (
            <div className="flex items-center gap-2 mt-2">
              <span className="font-mono text-acid text-sm">{shortUrl}</span>
              <button onClick={handleCopy} className="p-1.5 rounded-md text-ink-400 hover:text-acid transition-colors">
                {copied ? <Check size={13} className="text-acid" /> : <Copy size={13} />}
              </button>
              <a href={shortUrl} target="_blank" rel="noopener noreferrer"
                 className="p-1.5 rounded-md text-ink-400 hover:text-sky transition-colors">
                <ExternalLink size={13} />
              </a>
            </div>
          )}
          {originalUrl && (
            <p className="text-xs text-ink-500 mt-1 truncate max-w-lg flex items-center gap-1.5">
              <Link2 size={11} />
              {originalUrl}
            </p>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatPill icon={MousePointerClick} label="Total Clicks" value={totalClicks} color="text-acid" />
        <StatPill icon={TrendingUp} label="This Week" value={data?.weekClicks ?? data?.clicksThisWeek} color="text-sky" />
        <div className="hidden lg:block">
          <StatPill icon={Globe} label="Countries" value={data?.countries?.length ?? data?.countryCount} color="text-coral" />
        </div>
      </div>

      {/* Click timeline */}
      {dailyData.length > 0 && (
        <div className="card p-6 mb-6">
          <h2 className="font-display font-bold text-lg text-ink-100 mb-6">Clicks over time</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={dailyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="acidGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ACID} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={ACID} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e2e2e" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#737373', fontSize: 11, fontFamily: 'DM Sans' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#737373', fontSize: 11, fontFamily: 'DM Sans' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke={ACID}
                strokeWidth={2}
                fill="url(#acidGrad)"
                dot={false}
                activeDot={{ r: 4, fill: ACID, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bottom row: referrers + devices */}
      <div className="grid lg:grid-cols-2 gap-6">
        {referrers.length > 0 && (
          <div className="card p-6">
            <h2 className="font-display font-bold text-lg text-ink-100 mb-6">Top referrers</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={referrers}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {referrers.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ color: '#a8a8a8', fontSize: 12 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {devices.length > 0 && (
          <div className="card p-6">
            <h2 className="font-display font-bold text-lg text-ink-100 mb-6">Devices</h2>
            <div className="space-y-3 mt-2">
              {devices.map((d, i) => {
                const pct = totalClicks > 0 ? Math.round((d.value / totalClicks) * 100) : 0
                return (
                  <div key={d.name}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-ink-300 flex items-center gap-2">
                        <Smartphone size={13} className="text-ink-500" />
                        {d.name}
                      </span>
                      <span className="font-mono text-xs text-ink-400">{d.value} · {pct}%</span>
                    </div>
                    <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: PALETTE[i % PALETTE.length] }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {referrers.length === 0 && devices.length === 0 && (
          <div className="lg:col-span-2 card p-12 text-center">
            <TrendingUp size={32} className="text-ink-600 mx-auto mb-3" />
            <p className="font-display font-bold text-ink-400">No detailed analytics yet</p>
            <p className="text-sm text-ink-600 mt-1">
              Analytics data will appear here once your link gets clicks.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
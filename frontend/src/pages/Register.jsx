import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { Scissors, User, Mail, Lock, ArrowRight, Check } from 'lucide-react'

const perks = [
  'Unlimited URL shortening',
  'Click analytics & insights',
  'Custom aliases',
  'Link management dashboard',
]

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { saveAuth } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await register(form)
      const token = data.token || data.accessToken
      const user = data.user || data.data?.user || { email: form.email, name: form.name }
      saveAuth(user, token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-acid/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-sky/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-12 items-center animate-slide-up">
        {/* Left: pitch */}
        <div className="hidden lg:block">
          <div className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-acid rounded-xl flex items-center justify-center">
              <Scissors size={18} className="text-ink-900" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-2xl text-ink-50 tracking-tight">SNIP</span>
          </div>
          <h1 className="font-display font-bold text-5xl text-ink-50 leading-tight mb-4">
            Make every link
            <span className="text-acid"> count.</span>
          </h1>
          <p className="text-ink-400 font-body text-lg mb-10">
            Short, memorable URLs with powerful analytics. Built for people who care about where their links go.
          </p>
          <ul className="space-y-3">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-ink-300 font-body">
                <div className="w-5 h-5 rounded-full bg-acid/20 border border-acid/40 flex items-center justify-center shrink-0">
                  <Check size={11} className="text-acid" />
                </div>
                {perk}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: form */}
        <div>
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-acid rounded-2xl mb-4">
              <Scissors size={20} className="text-ink-900" strokeWidth={2.5} />
            </div>
            <h1 className="font-display font-bold text-2xl text-ink-50">Create your account</h1>
          </div>
          <h2 className="hidden lg:block font-display font-bold text-2xl text-ink-50 mb-6">
            Get started free
          </h2>

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-body text-ink-300 mb-2">Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Your name"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-body text-ink-300 mb-2">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-body text-ink-300 mb-2">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-coral bg-coral/10 border border-coral/20 rounded-lg px-4 py-2.5 animate-fade-in">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3.5"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-ink-900/30 border-t-ink-900 rounded-full animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-ink-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-acid hover:text-acid-light transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
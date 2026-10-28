import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import { Button, ErrorMessage, Input, SuccessMessage } from '../components/ui'
import { apiError, apiFieldErrors } from '../api/client'
import { Eye, EyeOff, Mail, Lock, User, Phone, KeyRound, Sparkles } from 'lucide-react'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (loading) return
    setLoading(true)
    setError('')
    try {
      await login(form)
      navigate('/dashboard')
    } catch (err) {
      setError(apiError(err, 'login'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="auth-header">
        <span className="eyebrow">TripMate Security</span>
        <h2>Welcome back</h2>
        <p>Sign in to access your Indian travel itineraries, budgets, and journals.</p>
      </div>

      <ErrorMessage>{error}</ErrorMessage>

      <form onSubmit={submit}>
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          required
          icon={Mail}
          placeholder="traveler@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <div style={{ position: 'relative' }}>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            icon={Lock}
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            type="button"
            className="password-toggle-btn"
            style={{ top: '35px' }}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <Link to="/forgot-password" style={{ fontSize: '0.84rem' }}>
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          style={{ width: '100%' }}
          loading={loading}
        >
          {loading ? 'Authenticating…' : 'Sign in to TripMate'}
        </Button>

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', marginTop: 24 }}>
          New to TripMate AI? <Link to="/register" style={{ fontWeight: 650 }}>Create an account</Link>
        </p>
      </form>
    </div>
  )
}

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (loading) return
    setError('')
    setErrors({})

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const { confirmPassword, ...registerPayload } = form
      await register(registerPayload)
      navigate('/dashboard')
    } catch (err) {
      setErrors(apiFieldErrors(err))
      setError(apiError(err, 'register'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="auth-header">
        <span className="eyebrow eyebrow-coral">
          <Sparkles size={14} /> Get Started Free
        </span>
        <h2>Create an account</h2>
        <p>Plan smarter trips across India, manage INR budgets, and capture travel memories.</p>
      </div>

      <ErrorMessage>{error}</ErrorMessage>

      <form onSubmit={submit}>
        <Input
          label="Full name"
          autoComplete="name"
          required
          icon={User}
          placeholder="e.g. Aarav Sharma"
          error={errors.fullName}
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          required
          icon={Mail}
          placeholder="aarav@example.com"
          error={errors.email}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <div style={{ position: 'relative' }}>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            minLength="8"
            required
            icon={Lock}
            placeholder="At least 8 characters"
            error={errors.password}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            type="button"
            className="password-toggle-btn"
            style={{ top: '35px' }}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          <Input
            label="Confirm password"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            minLength="8"
            required
            icon={Lock}
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
          <button
            type="button"
            className="password-toggle-btn"
            style={{ top: '35px' }}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Input
          label="Phone number (optional)"
          type="tel"
          autoComplete="tel"
          icon={Phone}
          placeholder="+91 98765 43210"
          error={errors.phoneNumber}
          value={form.phoneNumber}
          onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          style={{ width: '100%', marginTop: 8 }}
          loading={loading}
        >
          {loading ? 'Creating account…' : 'Create my account'}
        </Button>

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', marginTop: 24 }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 650 }}>Sign in</Link>
        </p>
      </form>
    </div>
  )
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (loading) return
    setLoading(true)
    setError('')
    try {
      const res = await authService.forgotPassword(email)
      setNotice(res || 'If an account exists with this email, a reset token has been generated.')
    } catch (err) {
      setError(apiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="auth-header">
        <span className="eyebrow">Recovery</span>
        <h2>Reset your password</h2>
        <p>Enter your email address and we will provide your reset credentials.</p>
      </div>

      <ErrorMessage>{error}</ErrorMessage>
      {notice && <SuccessMessage>{notice}</SuccessMessage>}

      <form onSubmit={submit}>
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          required
          icon={Mail}
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          style={{ width: '100%', marginTop: 8 }}
          loading={loading}
        >
          {loading ? 'Processing…' : 'Generate Reset Token'}
        </Button>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/login" style={{ fontSize: '0.9rem', fontWeight: 650 }}>
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  )
}

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const [form, setForm] = useState({
    token: params.get('token') || '',
    newPassword: ''
  })
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (loading) return
    setLoading(true)
    setError('')
    try {
      await authService.resetPassword(form)
      setNotice('Password updated successfully! You can now sign in with your new password.')
    } catch (err) {
      setError(apiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="auth-header">
        <span className="eyebrow">Security</span>
        <h2>Choose a new password</h2>
        <p>Please enter your token and choose a strong new password.</p>
      </div>

      <ErrorMessage>{error}</ErrorMessage>
      {notice && <SuccessMessage>{notice}</SuccessMessage>}

      <form onSubmit={submit}>
        <Input
          label="Reset token"
          required
          icon={KeyRound}
          placeholder="Paste reset token"
          value={form.token}
          onChange={(e) => setForm({ ...form, token: e.target.value })}
        />

        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          minLength="8"
          required
          icon={Lock}
          placeholder="At least 8 characters"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          style={{ width: '100%', marginTop: 8 }}
          loading={loading}
        >
          {loading ? 'Updating…' : 'Reset password'}
        </Button>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/login" style={{ fontSize: '0.9rem', fontWeight: 650 }}>
            Return to sign in
          </Link>
        </div>
      </form>
    </div>
  )
}

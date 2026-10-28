import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import {
  Badge,
  Button,
  Card,
  ErrorMessage,
  Input,
  LoadingState,
  PageHeader,
  SuccessMessage
} from '../components/ui'
import { apiError } from '../api/client'
import { User, ShieldCheck, KeyRound, Mail, Phone, Calendar } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    authService
      .me()
      .then(setProfile)
      .catch((e) => setErr(apiError(e)))
  }, [])

  if (!profile && !err) return <LoadingState message="Loading user profile…" />

  const data = profile || user

  const change = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErr('')
    setNote('')
    try {
      await authService.changePassword(form)
      setForm({ currentPassword: '', newPassword: '' })
      setNote('Password changed successfully.')
    } catch (x) {
      setErr(apiError(x))
    } finally {
      setSaving(false)
    }
  }

  const initials = data?.fullName
    ? data.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'TM'

  return (
    <div>
      <PageHeader
        eyebrow="Account Settings"
        title="Profile & Security"
        description="Review personal credentials, role permissions, and manage account authentication."
      />

      <ErrorMessage>{err}</ErrorMessage>
      {note && <SuccessMessage>{note}</SuccessMessage>}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24 }}>
        {/* Profile Card */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #e2e8f0' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1a73e8, #60a5fa)',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontSize: '1.4rem',
                fontWeight: 800
              }}
            >
              {initials}
            </div>

            <div>
              <h2 style={{ margin: '0 0 4px', fontSize: '1.4rem', color: '#0f172a' }}>
                {data?.fullName}
              </h2>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem', color: '#64748b' }}>{data?.email}</span>
                <Badge variant={data?.verified ? 'success' : 'default'}>
                  {data?.verified ? 'Verified Account' : 'Standard'}
                </Badge>
              </div>
            </div>
          </div>

          <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: '#0f172a' }}>
            Account Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                Full Name
              </span>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                {data?.fullName}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                Email Address
              </span>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                {data?.email}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                Phone Number
              </span>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                {data?.phoneNumber || 'Not provided'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                Assigned Roles
              </span>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                {Array.from(data?.roles || []).join(', ') || 'USER'}
              </div>
            </div>
          </div>
        </Card>

        {/* Change Password Card */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <KeyRound size={20} color="#2563eb" />
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>
              Change Password
            </h3>
          </div>

          <form onSubmit={change}>
            <Input
              label="Current Password"
              type="password"
              required
              placeholder="••••••••"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            />

            <Input
              label="New Password"
              type="password"
              minLength="8"
              required
              placeholder="At least 8 characters"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            />

            <Button
              type="submit"
              variant="primary"
              style={{ width: '100%', marginTop: 8 }}
              loading={saving}
            >
              {saving ? 'Updating…' : 'Update Password'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

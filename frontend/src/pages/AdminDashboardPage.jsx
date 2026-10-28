import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { adminService } from '../services/adminService'
import {
  Card,
  StatCard,
  Badge,
  EmptyState,
  ErrorMessage,
  LoadingState,
  PageHeader,
  Button
} from '../components/ui'
import { apiError } from '../api/client'
import {
  ShieldCheck,
  Users,
  Compass,
  Globe2,
  Calendar,
  Star,
  RefreshCw,
  Building2,
  UtensilsCrossed,
  Camera
} from 'lucide-react'

const formatDate = (val) => {
  if (!val) return '—'
  return new Date(val).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const load = () => {
    setRefreshing(true)
    adminService
      .dashboard()
      .then((d) => {
        setData(d)
        setErr('')
      })
      .catch((e) => setErr(apiError(e)))
      .finally(() => setRefreshing(false))
  }

  useEffect(() => {
    load()
  }, [])

  if (!data && !err) return <LoadingState message="Connecting to Admin Control Plane…" />

  if (!data) {
    return (
      <div>
        <ErrorMessage>{err}</ErrorMessage>
        <Button onClick={load} icon={RefreshCw}>
          Retry Connection
        </Button>
      </div>
    )
  }

  const u = data.users || {}
  const t = data.trips || {}
  const c = data.content || {}
  const r = data.reviews || {}

  return (
    <div>
      <PageHeader
        eyebrow="System Administration"
        title="Admin Control Center"
        description="Comprehensive real-time telemetry across users, journeys, database entities, and reviews."
        action={
          <Button
            variant="secondary"
            onClick={load}
            loading={refreshing}
            icon={RefreshCw}
          >
            Refresh Data
          </Button>
        }
      />

      <ErrorMessage>{err}</ErrorMessage>

      {/* KPI Cards */}
      <div className="stat-grid-4">
        <StatCard
          title="Total Users"
          value={u.totalUsers ?? 0}
          subtitle="Registered travelers"
          icon={Users}
        />
        <StatCard
          title="Total Trips"
          value={t.totalTrips ?? 0}
          subtitle={`${t.completedTrips ?? 0} completed`}
          icon={Compass}
        />
        <StatCard
          title="Destinations"
          value={c.destinations ?? 0}
          subtitle="Active world destinations"
          icon={Globe2}
        />
        <StatCard
          title="Community Reviews"
          value={r.totalReviews ?? 0}
          subtitle={`Average rating: ${Number(r.averageRating || 0).toFixed(1)} ★`}
          icon={Star}
          variant="coral"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 26 }}>
        {/* Content Breakdown */}
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.15rem', color: '#0f172a' }}>
            Catalog Inventory
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#334155', fontWeight: 600 }}>
                <Building2 size={16} /> Hotels & Stays
              </span>
              <Badge variant="primary">{c.hotels ?? 0}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#334155', fontWeight: 600 }}>
                <UtensilsCrossed size={16} /> Restaurants & Dining
              </span>
              <Badge variant="coral">{c.restaurants ?? 0}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#334155', fontWeight: 600 }}>
                <Camera size={16} /> Attractions & Landmarks
              </span>
              <Badge variant="success">{c.attractions ?? 0}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#334155', fontWeight: 600 }}>
                <Star size={16} /> User Favorites Logged
              </span>
              <Badge variant="default">{c.favorites ?? 0}</Badge>
            </div>
          </div>
        </Card>

        {/* Recent Registered Users */}
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.15rem', color: '#0f172a' }}>
            Recent Travelers
          </h3>
          {u.recentRegistrations?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {u.recentRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #f1f5f9'
                  }}
                >
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.92rem', color: '#0f172a' }}>
                      {reg.fullName}
                    </strong>
                    <small style={{ color: '#64748b' }}>{reg.email}</small>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    {formatDate(reg.registeredAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No recent user records.</p>
          )}
        </Card>

        {/* Recent Trips */}
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.15rem', color: '#0f172a' }}>
            Recent Generated Trips
          </h3>
          {t.recentTrips?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {t.recentTrips.map((trip) => (
                <div
                  key={trip.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #f1f5f9'
                  }}
                >
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.92rem', color: '#0f172a' }}>
                      {trip.tripName}
                    </strong>
                    <small style={{ color: '#64748b' }}>
                      {trip.destination} · Starts {trip.startDate}
                    </small>
                  </div>
                  <Badge variant={trip.status === 'COMPLETED' ? 'success' : 'primary'}>
                    {trip.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No recent trip plans.</p>
          )}
        </Card>
      </div>
    </div>
  )
}

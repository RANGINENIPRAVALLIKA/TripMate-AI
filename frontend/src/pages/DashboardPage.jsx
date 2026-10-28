import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { tripService } from '../services/tripService'
import {
  Card,
  StatCard,
  Badge,
  EmptyState,
  ErrorMessage,
  LoadingState,
  PageHeader,
  SectionHeader,
  Button
} from '../components/ui'
import { apiError } from '../api/client'
import {
  Compass,
  Calendar,
  CheckCircle2,
  Wallet,
  Sparkles,
  Globe2,
  ArrowRight,
  MapPin,
  Bot,
  Plus
} from 'lucide-react'

const formatMoney = (val) => {
  if (val == null) return '$0'
  return `$${Number(val).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [trips, setTrips] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([tripService.analytics(), tripService.list()])
      .then(([a, t]) => {
        setAnalytics(a)
        setTrips(t.content || [])
      })
      .catch((e) => setError(apiError(e)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState message="Loading your travel dashboard…" />

  const stats = analytics?.trips || {}
  const expenses = analytics?.expenses || {}
  const upcomingTrips = trips.filter(
    (t) => t.status === 'UPCOMING' || t.status === 'PLANNED'
  )

  return (
    <div>
      <PageHeader
        eyebrow="Personalized Command Center"
        title={`Welcome back, ${user?.fullName || 'Traveler'}!`}
        description="Here is an overview of your planned journeys, expenses, and travel statistics."
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/trips/planner" className="btn btn-coral">
              <Sparkles size={16} /> Plan with AI
            </Link>
          </div>
        }
      />

      <ErrorMessage>{error}</ErrorMessage>

      {/* Quick Action Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 26, overflowX: 'auto', paddingBottom: 4 }}>
        <Link to="/trips/planner" className="btn btn-primary btn-sm">
          <Sparkles size={14} /> Plan with AI
        </Link>
        <Link to="/trips" className="btn btn-secondary btn-sm">
          <Compass size={14} /> View All Trips ({trips.length})
        </Link>
        <Link to="/destinations" className="btn btn-secondary btn-sm">
          <Globe2 size={14} /> Explore Destinations
        </Link>
        <Link to="/chat" className="btn btn-secondary btn-sm">
          <Bot size={14} /> Ask AI Assistant
        </Link>
      </div>

      {/* 4 Stat Cards */}
      <div className="stat-grid-4">
        <StatCard
          title="Total Trips"
          value={stats.totalTrips ?? trips.length}
          subtitle="All created itineraries"
          icon={Compass}
          variant="primary"
        />
        <StatCard
          title="Upcoming Trips"
          value={stats.upcomingTrips ?? upcomingTrips.length}
          subtitle="Ready to take off"
          icon={Calendar}
          variant="primary"
        />
        <StatCard
          title="Completed Trips"
          value={stats.completedTrips ?? 0}
          subtitle="Memories documented"
          icon={CheckCircle2}
          variant="primary"
        />
        <StatCard
          title="Budget Tracked"
          value={formatMoney(stats.totalBudget)}
          subtitle={`Expenses logged: ${formatMoney(expenses.totalExpenses)}`}
          icon={Wallet}
          variant="coral"
        />
      </div>

      {/* Main Dashboard Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: 24 }}>
        {/* Recent / Upcoming Trips */}
        <Card>
          <SectionHeader
            title="Recent Itineraries"
            description="Access and manage your trip workspaces."
            action={
              <Link to="/trips" className="btn btn-ghost btn-sm">
                View all <ArrowRight size={14} />
              </Link>
            }
          />

          {trips.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {trips.slice(0, 5).map((trip) => (
                <div
                  key={trip.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{trip.tripName}</strong>
                      <Badge variant={trip.status === 'COMPLETED' ? 'success' : 'primary'}>
                        {trip.status}
                      </Badge>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.82rem', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={13} /> {trip.destination}
                      </span>
                      <span>
                        {trip.startDate} to {trip.endDate}
                      </span>
                      <span>
                        Budget: {formatMoney(trip.budget)}
                      </span>
                    </div>
                  </div>

                  <Link to={`/trips/${trip.id}`} className="btn btn-secondary btn-sm">
                    Open Trip
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Compass}
              title="No trips created yet"
              description="Start by generating a tailored itinerary using our AI Trip Planner."
              action={
                <Link to="/trips/planner" className="btn btn-primary">
                  <Sparkles size={16} /> Plan a Trip with AI
                </Link>
              }
            />
          )}
        </Card>

        {/* AI Assistant Quick Advice & Suggestions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Card style={{ background: 'linear-gradient(145deg, #0d2244, #1a365d)', color: '#ffffff' }}>
            <span className="eyebrow eyebrow-coral" style={{ marginBottom: 10 }}>
              <Sparkles size={14} /> AI Travel Intelligence
            </span>
            <h3 style={{ margin: '0 0 10px', fontSize: '1.2rem', color: '#ffffff' }}>
              Plan in seconds with AI
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 18px' }}>
              Select from curated destinations like Tokyo, Paris, or Bali. TripMate AI crafts structured daily plans with activities, timing, and expense targets.
            </p>
            <Link to="/trips/planner" className="btn btn-coral btn-sm">
              Launch Trip Planner <ArrowRight size={14} />
            </Link>
          </Card>

          <Card>
            <SectionHeader
              title="Quick Shortcuts"
              description="Fast access to travel management tools."
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/destinations" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <Globe2 size={16} /> Explore Destinations & Spots
              </Link>
              <Link to="/favorites" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <Compass size={16} /> Saved Favorite Places
              </Link>
              <Link to="/chat" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <Bot size={16} /> Ask AI Travel Co-Pilot
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

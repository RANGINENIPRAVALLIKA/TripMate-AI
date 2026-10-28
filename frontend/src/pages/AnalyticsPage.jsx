import React, { useEffect, useState } from 'react'
import { tripService } from '../services/tripService'
import {
  Card,
  StatCard,
  Badge,
  EmptyState,
  ErrorMessage,
  LoadingState,
  PageHeader
} from '../components/ui'
import { apiError } from '../api/client'
import { formatINR } from '../utils/currency'
import {
  BarChart3,
  Compass,
  Calendar,
  CheckCircle2,
  Globe2,
  Wallet,
  DollarSign,
  Star,
  Heart
} from 'lucide-react'

const formatMoney = (val) => {
  if (val == null) return '₹0'
  return formatINR(val)
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    tripService
      .analytics()
      .then(setData)
      .catch((e) => setErr(apiError(e)))
  }, [])

  if (!data && !err) return <LoadingState message="Aggregating travel metrics…" />
  if (!data) return <ErrorMessage>{err}</ErrorMessage>

  const t = data.trips || {}
  const e = data.expenses || {}

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence & Reports"
        title="Travel Analytics"
        description="Comprehensive insights synthesized from your real itineraries, budgets, and reviews."
      />

      <ErrorMessage>{err}</ErrorMessage>

      {/* Primary KPI Grid */}
      <div className="stat-grid-4">
        <StatCard
          title="Total Trips"
          value={t.totalTrips ?? 0}
          subtitle={`${t.upcomingTrips ?? 0} upcoming, ${t.completedTrips ?? 0} completed`}
          icon={Compass}
        />
        <StatCard
          title="Destinations"
          value={data.totalDestinations ?? 0}
          subtitle="Unique cities explored"
          icon={Globe2}
        />
        <StatCard
          title="Total Budget"
          value={formatMoney(t.totalBudget)}
          subtitle={`Remaining: ${formatMoney(e.remainingBudget)}`}
          icon={Wallet}
        />
        <StatCard
          title="Logged Spending"
          value={formatMoney(e.totalExpenses)}
          subtitle="Real receipts tracked"
          icon={DollarSign}
          variant="coral"
        />
      </div>

      {/* Analytics Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Expenses by Category */}
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.15rem', color: '#0f172a' }}>
            Expenses by Category
          </h3>
          {e.expenseBreakdown?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {e.expenseBreakdown.map((item) => (
                <div key={item.category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.88rem' }}>
                    <strong>{item.category}</strong>
                    <span>{formatMoney(item.totalExpenses)}</span>
                  </div>
                  <div style={{ height: 6, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        background: '#2563eb',
                        borderRadius: 99,
                        width: `${Math.min(100, Math.max(10, (item.totalExpenses / (e.totalExpenses || 1)) * 100))}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No categorized expenses logged yet.</p>
          )}
        </Card>

        {/* Trips by Destination */}
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.15rem', color: '#0f172a' }}>
            Top Destinations
          </h3>
          {data.destinations?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.destinations.map((d) => (
                <div
                  key={d.destinationId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <span style={{ fontWeight: 650, color: '#0f172a' }}>
                    {d.city}, {d.country}
                  </span>
                  <Badge variant="primary">{d.tripCount} Trip(s)</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No destination journeys logged yet.</p>
          )}
        </Card>

        {/* Status Distribution */}
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.15rem', color: '#0f172a' }}>
            Trip Status Breakdown
          </h3>
          {Object.entries(t.statusDistribution || {}).length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(t.statusDistribution || {}).map(([status, count]) => (
                <div
                  key={status}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderBottom: '1px solid #f1f5f9'
                  }}
                >
                  <span style={{ color: '#475569', fontWeight: 600 }}>{status}</span>
                  <Badge variant={status === 'COMPLETED' ? 'success' : 'primary'}>{count}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No trip status data available.</p>
          )}
        </Card>
      </div>
    </div>
  )
}

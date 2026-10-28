import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { tripService } from '../services/tripService'
import { destinationService } from '../services/destinationService'
import { formatINR } from '../utils/currency'
import {
  Button,
  Card,
  ErrorMessage,
  Input,
  Select,
  PageHeader,
  Badge,
  Spinner
} from '../components/ui'
import { apiError } from '../api/client'
import {
  Sparkles,
  Compass,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Wallet,
  Users
} from 'lucide-react'

import DestinationCombobox from '../components/DestinationCombobox'
import { DEFAULT_INDIAN_DESTINATIONS } from '../data/indianDestinations'

const preferencesList = [
  { id: 'PILGRIMAGE', label: 'Temples & Spiritual' },
  { id: 'HERITAGE', label: 'Forts & Heritage' },
  { id: 'HILL_STATION', label: 'Hill Stations & Mist' },
  { id: 'BEACH', label: 'Beaches & Coastal' },
  { id: 'NATURE', label: 'Waterfalls & Nature' },
  { id: 'WILDLIFE', label: 'Wildlife & Safaris' },
  { id: 'FOOD', label: 'Local Flavors & Street Food' },
  { id: 'ADVENTURE', label: 'Trekking & Adventure' },
  { id: 'FAMILY', label: 'Family Vacation' },
  { id: 'HONEYMOON', label: 'Honeymoon' },
  { id: 'ROAD_TRIP', label: 'Road Trip' },
  { id: 'WELLNESS', label: 'Ayurveda & Wellness' }
]

export default function AiPlannerPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const prefillDestId = searchParams.get('destinationId')
  const prefillCity = searchParams.get('destination')

  const [destinations, setDestinations] = useState(DEFAULT_INDIAN_DESTINATIONS)
  const [selectedDestination, setSelectedDestination] = useState(null)
  const [form, setForm] = useState({
    tripName: '',
    destinationId: prefillDestId || '',
    startDate: '',
    numberOfDays: '3',
    budget: '35000',
    numberOfTravelers: '2',
    preferences: ['HERITAGE', 'FOOD']
  })
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    destinationService
      .all()
      .then((data) => {
        // Sanitize any legacy foreign entries by filtering out non-Indian destinations
        const indianOnly = (data || []).filter(
          (d) => !d.country || d.country.toLowerCase() === 'india'
        )

        // Merge with full catalog to guarantee at least 145 genuine Indian destinations
        const combined = [...indianOnly]
        for (const def of DEFAULT_INDIAN_DESTINATIONS) {
          if (!combined.some((c) => c.city.toLowerCase() === def.city.toLowerCase())) {
            combined.push(def)
          }
        }

        setDestinations(combined)

        if (combined.length > 0) {
          let chosen = null
          if (prefillDestId) {
            chosen = combined.find((d) => String(d.id) === String(prefillDestId))
          } else if (prefillCity) {
            chosen = combined.find((d) => d.city.toLowerCase() === prefillCity.toLowerCase())
          }
          if (!chosen) chosen = combined[0]

          setSelectedDestination(chosen)
          setForm((prev) => ({
            ...prev,
            destinationId: String(chosen.id),
            tripName: prev.tripName || `${chosen.city} AI Discovery Tour`
          }))
        }
      })
      .catch(() => {
        // Fallback to rich predefined Indian catalog
        setDestinations(DEFAULT_INDIAN_DESTINATIONS)
        if (DEFAULT_INDIAN_DESTINATIONS.length > 0) {
          const chosen = DEFAULT_INDIAN_DESTINATIONS[0]
          setSelectedDestination(chosen)
          setForm((prev) => ({
            ...prev,
            destinationId: String(chosen.id),
            tripName: prev.tripName || `${chosen.city} AI Discovery Tour`
          }))
        }
      })

    // Set default departure date 14 days out
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 14)
    setForm((prev) => ({
      ...prev,
      startDate: defaultDate.toISOString().split('T')[0]
    }))
  }, [prefillDestId, prefillCity])

  const handleSelectDestination = (dest) => {
    setSelectedDestination(dest)
    setForm((prev) => ({
      ...prev,
      destinationId: String(dest.id),
      tripName: `${dest.city} AI Discovery Tour`
    }))
  }

  const handleClearDestination = () => {
    setSelectedDestination(null)
    setForm((prev) => ({
      ...prev,
      destinationId: '',
      tripName: ''
    }))
  }

  const togglePref = (p) => {
    setForm((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(p)
        ? prev.preferences.filter((x) => x !== p)
        : [...prev.preferences, p]
    }))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (loading) return
    setError('')

    if (!selectedDestination || !selectedDestination.city || !selectedDestination.city.trim()) {
      setError('Please select or enter a valid destination in India.')
      return
    }

    setLoading(true)
    try {
      let resolvedDestId = Number(form.destinationId)

      // If user entered a custom destination or destination is not yet in database,
      // register it on the backend so it gets an authentic ID and persists cleanly
      if (
        selectedDestination.isCustom ||
        !resolvedDestId ||
        resolvedDestId <= 0 ||
        isNaN(resolvedDestId) ||
        String(form.destinationId).startsWith('custom')
      ) {
        const customResp = await destinationService.createCustom({
          city: selectedDestination.city.trim(),
          state:
            selectedDestination.state && selectedDestination.state !== 'India'
              ? selectedDestination.state.trim()
              : null
        })
        resolvedDestId = customResp.id
        setSelectedDestination({ ...customResp, isCustom: true })
        setForm((prev) => ({ ...prev, destinationId: String(customResp.id) }))
      }

      const data = await tripService.generate({
        tripName: form.tripName || `${selectedDestination.city} AI Discovery Tour`,
        destinationId: resolvedDestId,
        startDate: form.startDate,
        numberOfDays: Number(form.numberOfDays),
        budget: Number(form.budget),
        numberOfTravelers: Number(form.numberOfTravelers),
        preferences: form.preferences
      })
      setResult(data)
    } catch (err) {
      setError(apiError(err))
    } finally {
      setLoading(false)
    }
  }


  return (
    <div>
      <PageHeader
        eyebrow="TripMate Intelligence"
        title="AI Trip Planner"
        description="Craft intelligent, customized day-by-day itineraries with estimated budgets, timings, and activities."
      />

      <ErrorMessage>{error}</ErrorMessage>

      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 28 }}>
        {/* Form */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <Sparkles size={20} color="#ff5722" />
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
              Trip Parameters
            </h3>
          </div>

          <form onSubmit={submit}>
            <DestinationCombobox
              destinations={destinations}
              selectedDestination={selectedDestination}
              onSelect={handleSelectDestination}
              onClear={handleClearDestination}
              label="Select or Search Indian Destination"
              required
            />

            <Input
              label="Trip Title"
              required
              placeholder="e.g. 4-Day Heritage & Temple Tour of Varanasi"
              value={form.tripName}
              onChange={(e) => setForm({ ...form, tripName: e.target.value })}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 14 }}>
              <Input
                label="Departure Date"
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
              <Input
                label="Trip Duration (Days)"
                type="number"
                min="1"
                max="30"
                required
                value={form.numberOfDays}
                onChange={(e) => setForm({ ...form, numberOfDays: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 14 }}>
              <Input
                label="Total Budget (₹ INR)"
                type="number"
                min="1000"
                step="500"
                required
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
              />
              <Input
                label="Number of Travelers"
                type="number"
                min="1"
                max="30"
                required
                value={form.numberOfTravelers}
                onChange={(e) => setForm({ ...form, numberOfTravelers: e.target.value })}
              />
            </div>

            {/* Per-person Budget Indicator */}
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 16, fontSize: '0.84rem', color: '#475569', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wallet size={15} color="#1e40af" />
              <span>
                Estimated <strong>₹{Math.round(Number(form.budget || 0) / Math.max(1, Number(form.numberOfTravelers || 1))).toLocaleString('en-IN')}</strong> per traveler for {form.numberOfDays || 3} days (approx ₹{Math.round(Number(form.budget || 0) / (Math.max(1, Number(form.numberOfTravelers || 1)) * Math.max(1, Number(form.numberOfDays || 1)))).toLocaleString('en-IN')}/day)
              </span>
            </div>

            <div style={{ marginBottom: 24 }}>
              <span className="field-label" style={{ display: 'block', marginBottom: 8 }}>
                Indian Travel Styles & Preferences
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {preferencesList.map((p) => {
                  const active = form.preferences.includes(p.id)
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => togglePref(p.id)}
                      className={`badge ${active ? 'badge-primary' : 'badge-default'}`}
                      style={{
                        cursor: 'pointer',
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        border: '1px solid',
                        borderColor: active ? '#93c5fd' : '#e2e8f0'
                      }}
                    >
                      {active && '✓ '} {p.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <Button
              type="submit"
              variant="coral"
              size="lg"
              style={{ width: '100%' }}
              loading={loading}
            >
              {loading ? (
                'Generating Itinerary with TripMate AI…'
              ) : (
                <>
                  <Sparkles size={18} /> Generate Custom Itinerary
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Results Preview Side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {loading && (
            <Card style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Spinner size={36} />
              <h3 style={{ margin: '16px 0 6px', color: '#0f172a' }}>
                TripMate AI is structuring your Indian journey…
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                Synthesizing route pacing, temples, heritage forts, dining stops, and INR expense estimates.
              </p>
            </Card>
          )}

          {!loading && result && (
            <Card style={{ background: '#ffffff', border: '1px solid #bfdbfe' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <CheckCircle2 size={18} color="#10b981" />
                <span className="eyebrow" style={{ color: '#10b981' }}>Plan Successfully Created</span>
              </div>
              <h2 style={{ fontSize: '1.45rem', margin: '0 0 4px', color: '#0f172a' }}>
                {result.trip?.tripName}
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 16px' }}>
                {result.itinerary?.length} Days · Budget {formatINR(result.trip?.budget || 0)}
              </p>

              <div style={{ marginBottom: 20 }}>
                <Link
                  to={`/trips/${result.trip?.id}`}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  Open Trip Workspace <ArrowRight size={16} />
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {result.itinerary?.map((day) => (
                  <div
                    key={day.dayNumber}
                    style={{
                      background: '#f8fafc',
                      padding: 14,
                      borderRadius: 10,
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ fontWeight: 750, fontSize: '0.92rem', color: '#1e40af', marginBottom: 6 }}>
                      {day.title}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {day.activities?.map((act, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.82rem',
                            color: '#334155'
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Clock size={12} color="#94a3b8" />
                            <strong>{act.startTime?.slice(0, 5) || '10:00'}</strong> {act.title}
                          </span>
                          <span style={{ color: '#64748b', fontWeight: 600 }}>
                            {act.estimatedCost ? formatINR(act.estimatedCost) : 'Free / Included'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {!loading && !result && (
            <Card style={{ background: 'linear-gradient(145deg, #0d2244, #132d56)', color: '#ffffff' }}>
              <span className="eyebrow eyebrow-coral" style={{ marginBottom: 12 }}>
                <Sparkles size={14} /> AI Powered Assistance
              </span>
              <h3 style={{ fontSize: '1.35rem', margin: '0 0 10px', color: '#ffffff' }}>
                Thoughtful plans, not blank pages.
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.55, margin: '0 0 20px' }}>
                Select your destination and dates. TripMate AI crafts an actionable schedule with realistic activity pacing, local highlights, and budget estimates.
              </p>
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: 16 }}>
                <span style={{ fontSize: '0.8rem', color: '#93c5fd', fontWeight: 650 }}>
                  ✓ Instant day-by-day itineraries<br />
                  ✓ Editable activities & timeline<br />
                  ✓ Connected to packing & expense tracker
                </span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

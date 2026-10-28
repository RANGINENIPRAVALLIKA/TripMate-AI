import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { tripService } from '../services/tripService'
import { destinationService } from '../services/destinationService'
import {
  Badge,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorMessage,
  LoadingState,
  PageHeader,
  Button,
  Modal,
  Input,
  Select
} from '../components/ui'
import { apiError } from '../api/client'
import {
  Compass,
  Sparkles,
  Plus,
  Search,
  Calendar,
  MapPin,
  Trash2,
  Copy,
  Bookmark,
  BookmarkCheck,
  ArrowRight
} from 'lucide-react'

const duration = (start, end) => {
  if (!start || !end) return ''
  const totalDays = Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000) + 1)
  return `${totalDays} days`
}

export default function TripsPage() {
  const [trips, setTrips] = useState(null)
  const [destinations, setDestinations] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [duplicating, setDuplicating] = useState(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({
    tripName: '',
    destinationId: '',
    startDate: '',
    endDate: '',
    budget: '',
    numberOfTravelers: '1'
  })

  const load = () => {
    tripService
      .list()
      .then((res) => setTrips(res.content || []))
      .catch((err) => setError(apiError(err)))
  }

  useEffect(() => {
    load()
    destinationService
      .all()
      .then((list) => setDestinations(list || []))
      .catch(() => {})
  }, [])

  const remove = async () => {
    try {
      await tripService.remove(deleting)
      setDeleting(null)
      load()
    } catch (err) {
      setError(apiError(err))
    }
  }

  const handleDuplicate = async (trip) => {
    try {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 7)
      const startDate = tomorrow.toISOString().split('T')[0]
      await tripService.duplicate(trip.id, {
        tripName: `${trip.tripName} (Copy)`,
        startDate
      })
      load()
    } catch (err) {
      setError(apiError(err))
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (creating) return
    setCreating(true)
    setError('')
    try {
      await tripService.create({
        tripName: createForm.tripName,
        destinationId: Number(createForm.destinationId),
        startDate: createForm.startDate,
        endDate: createForm.endDate,
        budget: Number(createForm.budget),
        numberOfTravelers: Number(createForm.numberOfTravelers),
        preferences: []
      })
      setIsCreateOpen(false)
      setCreateForm({
        tripName: '',
        destinationId: '',
        startDate: '',
        endDate: '',
        budget: '',
        numberOfTravelers: '1'
      })
      load()
    } catch (err) {
      setError(apiError(err))
    } finally {
      setCreating(false)
    }
  }

  if (!trips && !error) return <LoadingState message="Loading trips…" />

  const filteredTrips = (trips || []).filter((t) => {
    const q = search.toLowerCase()
    return (
      t.tripName?.toLowerCase().includes(q) ||
      t.destination?.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <PageHeader
        eyebrow="Trip Collection"
        title="My Trips"
        description="Organize, inspect, duplicate, and manage all your travel itineraries."
        action={
          <div style={{ display: 'flex', gap: 12 }}>
            <Button
              variant="secondary"
              onClick={() => setIsCreateOpen(true)}
              icon={Plus}
            >
              New Custom Trip
            </Button>
            <Link to="/trips/planner" className="btn btn-coral">
              <Sparkles size={16} /> Plan with AI
            </Link>
          </div>
        }
      />

      <ErrorMessage>{error}</ErrorMessage>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
          <input
            type="text"
            className="input-control"
            style={{ paddingLeft: 38 }}
            placeholder="Search trips by name or destination…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredTrips.length > 0 ? (
        <div className="trip-grid">
          {filteredTrips.map((trip) => (
            <Card key={trip.id} hover className="travel-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Badge variant={trip.status === 'COMPLETED' ? 'success' : 'primary'}>
                  {trip.status}
                </Badge>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    title="Duplicate Trip"
                    onClick={() => handleDuplicate(trip)}
                  >
                    <Copy size={15} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: '#ef4444' }}
                    title="Delete Trip"
                    onClick={() => setDeleting(trip.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <span className="eyebrow" style={{ marginBottom: 4 }}>
                {duration(trip.startDate, trip.endDate)}
              </span>

              <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem', color: '#0f172a' }}>
                {trip.tripName}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748b', fontSize: '0.88rem', marginBottom: 8 }}>
                <MapPin size={14} /> {trip.destination}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '0.82rem', marginBottom: 16 }}>
                <Calendar size={14} /> {trip.startDate} — {trip.endDate}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0369a1' }}>
                  Budget: ₹{Number(trip.budget || 0).toLocaleString('en-IN')}
                </span>
                <Link to={`/trips/${trip.id}`} className="btn btn-primary btn-sm">
                  Open Workspace <ArrowRight size={14} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Compass}
          title={search ? 'No trips matched your search' : 'No trips planned yet'}
          description={
            search
              ? 'Try adjusting your search terms or create a new trip.'
              : 'Create your first travel itinerary manually or let TripMate AI generate one for you in seconds.'
          }
          action={
            <div style={{ display: 'flex', gap: 12 }}>
              <Button onClick={() => setIsCreateOpen(true)} variant="secondary" icon={Plus}>
                Create Custom Trip
              </Button>
              <Link to="/trips/planner" className="btn btn-primary">
                <Sparkles size={16} /> Plan with AI
              </Link>
            </div>
          }
        />
      )}

      {/* Create Trip Modal */}
      <Modal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Trip"
      >
        <form onSubmit={handleCreate}>
          <Input
            label="Trip Name"
            required
            placeholder="e.g. Kerala Backwaters & Munnar Tea Trails"
            value={createForm.tripName}
            onChange={(e) => setCreateForm({ ...createForm, tripName: e.target.value })}
          />

          <Select
            label="Destination"
            required
            value={createForm.destinationId}
            onChange={(e) => setCreateForm({ ...createForm, destinationId: e.target.value })}
          >
            <option value="">Select an Indian Destination…</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.city}, {d.state ? `${d.state}, India` : (d.country || 'India')}
              </option>
            ))}
          </Select>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="Start Date"
              type="date"
              required
              value={createForm.startDate}
              onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              required
              value={createForm.endDate}
              onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="Total Budget (₹ INR)"
              type="number"
              min="0"
              step="1"
              required
              placeholder="e.g. 35000"
              value={createForm.budget}
              onChange={(e) => setCreateForm({ ...createForm, budget: e.target.value })}
            />
            <Input
              label="Travelers"
              type="number"
              min="1"
              max="50"
              required
              value={createForm.numberOfTravelers}
              onChange={(e) => setCreateForm({ ...createForm, numberOfTravelers: e.target.value })}
            />
          </div>

          <div className="modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={creating}>
              Create Trip
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleting}
        title="Delete this trip?"
        description="This will permanently delete this trip and its itineraries, expenses, and checklist items. This action cannot be undone."
        confirmText="Yes, Delete Trip"
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
    </div>
  )
}

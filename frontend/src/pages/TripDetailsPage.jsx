import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { tripService } from '../services/tripService'
import TripForm from '../components/trips/TripForm'
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  ErrorMessage,
  LoadingState,
  PageHeader,
  Modal,
  SuccessMessage
} from '../components/ui'
import { apiError } from '../api/client'
import { formatINR } from '../utils/currency'
import {
  Calendar,
  MapPin,
  Clock,
  Wallet,
  Users2,
  CheckSquare,
  BookOpen,
  Copy,
  Trash2,
  Edit,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  Sparkles,
  Plane
} from 'lucide-react'

const calcDays = (a, b) => {
  if (!a || !b) return 0
  return Math.max(1, Math.round((new Date(b) - new Date(a)) / 86400000) + 1)
}

export default function TripDetailsPage() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')

  const load = () => {
    tripService
      .get(tripId)
      .then(setTrip)
      .catch((e) => setError(apiError(e)))
  }

  useEffect(load, [tripId])

  if (!trip && !error) return <LoadingState message="Loading trip workspace…" />
  if (!trip) return <ErrorMessage>{error}</ErrorMessage>

  const edit = async (body) => {
    setSaving(true)
    try {
      const updated = await tripService.update(tripId, body)
      setTrip(updated)
      setEditing(false)
      setNotice('Trip updated successfully.')
    } catch (e) {
      setError(apiError(e))
    } finally {
      setSaving(false)
    }
  }

  const duplicate = async () => {
    const tripName = window.prompt('Name for the duplicated trip:', `${trip.tripName} (Copy)`)
    if (!tripName) return
    try {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 7)
      const startDate = tomorrow.toISOString().split('T')[0]
      const copy = await tripService.duplicate(tripId, { tripName, startDate })
      navigate(`/trips/${copy.id}`)
    } catch (e) {
      setError(apiError(e))
    }
  }

  const remove = async () => {
    try {
      await tripService.remove(tripId)
      navigate('/trips')
    } catch (e) {
      setError(apiError(e))
    }
  }

  const toggleSave = async () => {
    try {
      if (saved) {
        await tripService.unsave(tripId)
        setSaved(false)
        setNotice('Trip removed from saved trips.')
      } else {
        await tripService.save(tripId)
        setSaved(true)
        setNotice('Trip added to saved trips.')
      }
    } catch (e) {
      setError(apiError(e))
    }
  }

  const tripDays = calcDays(trip.startDate, trip.endDate)

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Link to="/trips" style={{ fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          ← Back to all trips
        </Link>
      </div>

      <PageHeader
        eyebrow="Trip Workspace"
        title={trip.tripName}
        description={`Destination: ${trip.destination} · ${trip.startDate} to ${trip.endDate} (${tripDays} Days)`}
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" onClick={() => setEditing(true)} icon={Edit}>
              Edit
            </Button>
            <Button variant="secondary" onClick={duplicate} icon={Copy}>
              Duplicate
            </Button>
            <Button variant="secondary" onClick={toggleSave} icon={saved ? BookmarkCheck : Bookmark}>
              {saved ? 'Saved' : 'Save'}
            </Button>
            <Button variant="danger" onClick={() => setDeleting(true)} icon={Trash2}>
              Delete
            </Button>
          </div>
        }
      />

      <ErrorMessage>{error}</ErrorMessage>
      {notice && <SuccessMessage>{notice}</SuccessMessage>}

      {/* Workspace Feature Hub Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginBottom: 30 }}>
        {/* Itinerary */}
        <Card hover className="travel-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="feature-icon-wrapper" style={{ margin: 0 }}>
              <Calendar size={22} />
            </div>
            <Badge variant="primary">Core Plan</Badge>
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem', color: '#0f172a' }}>Day-by-Day Itinerary</h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 16px', flex: 1 }}>
            View and organize daily activities, start times, locations, and costs along a clean timeline.
          </p>
          <Link to={`/trips/${tripId}/itinerary`} className="btn btn-primary btn-sm">
            Open Itinerary <ArrowRight size={14} />
          </Link>
        </Card>

        {/* Budget & Expenses */}
        <Card hover className="travel-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="feature-icon-wrapper" style={{ background: '#ecfdf5', color: '#10b981', margin: 0 }}>
              <Wallet size={22} />
            </div>
            <Badge variant="success">Finance</Badge>
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem', color: '#0f172a' }}>Budget & Expenses</h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 16px', flex: 1 }}>
            Track total planned budget against real expenditures across transport, dining, and stay.
          </p>
          <Link to={`/trips/${tripId}/budget-expenses`} className="btn btn-secondary btn-sm">
            Manage Budget <ArrowRight size={14} />
          </Link>
        </Card>

        {/* Group Expense Splitting */}
        <Card hover className="travel-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="feature-icon-wrapper" style={{ background: '#fff7ed', color: '#ea580c', margin: 0 }}>
              <Users2 size={22} />
            </div>
            <Badge variant="coral">Collaborative</Badge>
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem', color: '#0f172a' }}>Group Expense Splitter</h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 16px', flex: 1 }}>
            Log shared bills among fellow travelers and compute exact settlement balances automatically.
          </p>
          <Link to={`/trips/${tripId}/group-expenses`} className="btn btn-secondary btn-sm">
            Split Expenses <ArrowRight size={14} />
          </Link>
        </Card>

        {/* Packing Checklist */}
        <Card hover className="travel-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="feature-icon-wrapper" style={{ background: '#f5f3ff', color: '#7c3aed', margin: 0 }}>
              <CheckSquare size={22} />
            </div>
            <Badge variant="default">Preparation</Badge>
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem', color: '#0f172a' }}>Packing Checklist</h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 16px', flex: 1 }}>
            Categorized packing checklist with packed progress tracking and AI recommendation generator.
          </p>
          <Link to={`/trips/${tripId}/packing`} className="btn btn-secondary btn-sm">
            Checklist Items <ArrowRight size={14} />
          </Link>
        </Card>

        {/* Travel Journal */}
        <Card hover className="travel-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="feature-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb', margin: 0 }}>
              <BookOpen size={22} />
            </div>
            <Badge variant="primary">Memories</Badge>
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem', color: '#0f172a' }}>Travel Journal & Memories</h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 16px', flex: 1 }}>
            Capture personal daily notes, high-definition travel photos, and video clips into your memory vault.
          </p>
          <Link to={`/trips/${tripId}/journal`} className="btn btn-secondary btn-sm">
            View Journal & Gallery <ArrowRight size={14} />
          </Link>
        </Card>

        {/* Bookings Manager */}
        <Card hover className="travel-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="feature-icon-wrapper" style={{ background: '#fdf2f8', color: '#db2777', margin: 0 }}>
              <Plane size={22} />
            </div>
            <Badge variant="default">Reservations</Badge>
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem', color: '#0f172a' }}>Bookings Manager</h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 16px', flex: 1 }}>
            Organize flight, hotel, and rental car confirmation codes, provider details, and total costs.
          </p>
          <Link to={`/trips/${tripId}/bookings`} className="btn btn-secondary btn-sm">
            Manage Bookings <ArrowRight size={14} />
          </Link>
        </Card>
      </div>

      {/* Trip Meta Card */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: '1.15rem', color: '#0f172a' }}>
          Trip Specifications
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Destination
            </span>
            <div style={{ fontSize: '1rem', fontWeight: 650, color: '#0f172a', marginTop: 2 }}>
              {trip.destination}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Dates
            </span>
            <div style={{ fontSize: '1rem', fontWeight: 650, color: '#0f172a', marginTop: 2 }}>
              {trip.startDate} to {trip.endDate} ({tripDays} days)
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Total Budget
            </span>
            <div style={{ fontSize: '1rem', fontWeight: 650, color: '#1e40af', marginTop: 2 }}>
              {formatINR(trip.budget || 0)}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Travelers
            </span>
            <div style={{ fontSize: '1rem', fontWeight: 650, color: '#0f172a', marginTop: 2 }}>
              {trip.numberOfTravelers} Person(s)
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal open={editing} onClose={() => setEditing(false)} title="Edit Trip Details">
        <TripForm
          trip={trip}
          onSubmit={edit}
          onCancel={() => setEditing(false)}
          saving={saving}
          error={error}
        />
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleting}
        title="Delete this trip?"
        description="This will permanently delete this trip and all associated itinerary items, checklists, and expenses."
        confirmText="Yes, Delete Trip"
        onCancel={() => setDeleting(false)}
        onConfirm={remove}
      />
    </div>
  )
}

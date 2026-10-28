import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { bookingService } from '../services/bookingService'
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorMessage,
  Input,
  LoadingState,
  Modal,
  PageHeader,
  Select,
  SuccessMessage
} from '../components/ui'
import { apiError } from '../api/client'
import { formatINR } from '../utils/currency'
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  ExternalLink,
  FileCheck2,
  FileText,
  Hotel,
  Plane,
  Plus,
  Train,
  Trash2,
  Car,
  Ticket,
  Edit2
} from 'lucide-react'

const BOOKING_TYPES = [
  'FLIGHT',
  'HOTEL',
  'TRAIN',
  'BUS',
  'CAR_RENTAL',
  'ACTIVITY',
  'OTHER'
]

const BOOKING_STATUSES = ['PLANNED', 'CONFIRMED', 'CANCELLED', 'COMPLETED']

const getTypeIcon = (type) => {
  switch (type) {
    case 'FLIGHT':
      return Plane
    case 'HOTEL':
      return Hotel
    case 'TRAIN':
      return Train
    case 'CAR_RENTAL':
      return Car
    case 'ACTIVITY':
      return Ticket
    default:
      return FileText
  }
}

const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'CONFIRMED':
      return 'success'
    case 'COMPLETED':
      return 'primary'
    case 'CANCELLED':
      return 'danger'
    default:
      return 'coral'
  }
}

export default function BookingsPage() {
  const { tripId } = useParams()
  const [bookings, setBookings] = useState(null)
  const [modalBooking, setModalBooking] = useState(null) // null = closed, {} = add, item = edit
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const [activeFilter, setActiveFilter] = useState('ALL')

  // Form state
  const [formData, setFormData] = useState({
    type: 'FLIGHT',
    status: 'PLANNED',
    provider: '',
    bookingReference: '',
    startAt: '',
    endAt: '',
    amount: '',
    currency: 'INR',
    documentUrl: ''
  })

  const load = () => {
    bookingService
      .list(tripId)
      .then(setBookings)
      .catch((e) => setError(apiError(e)))
  }

  useEffect(() => {
    load()
  }, [tripId])

  const openAddModal = () => {
    setFormData({
      type: 'FLIGHT',
      status: 'CONFIRMED',
      provider: '',
      bookingReference: '',
      startAt: '',
      endAt: '',
      amount: '',
      currency: 'INR',
      documentUrl: ''
    })
    setModalBooking({})
  }

  const openEditModal = (b) => {
    setFormData({
      type: b.type || 'FLIGHT',
      status: b.status || 'PLANNED',
      provider: b.provider || '',
      bookingReference: b.bookingReference || '',
      startAt: b.startAt ? b.startAt.slice(0, 16) : '',
      endAt: b.endAt ? b.endAt.slice(0, 16) : '',
      amount: b.amount != null ? b.amount : '',
      currency: b.currency || 'USD',
      documentUrl: b.documentUrl || ''
    })
    setModalBooking(b)
  }

  const closeModal = () => {
    setModalBooking(null)
  }

  const handleSaveBooking = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        type: formData.type,
        status: formData.status,
        provider: formData.provider.trim(),
        bookingReference: formData.bookingReference.trim() || null,
        startAt: formData.startAt ? formData.startAt : null,
        endAt: formData.endAt ? formData.endAt : null,
        amount: formData.amount === '' ? null : Number(formData.amount),
        currency: formData.currency.trim() || 'USD',
        documentUrl: formData.documentUrl.trim() || null
      }

      if (modalBooking.id) {
        await bookingService.update(tripId, modalBooking.id, payload)
        setNotice('Booking reservation updated.')
      } else {
        await bookingService.create(tripId, payload)
        setNotice('Booking added successfully.')
      }
      closeModal()
      load()
    } catch (err) {
      setError(apiError(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    try {
      await bookingService.remove(tripId, confirmDelete.id)
      setConfirmDelete(null)
      setNotice('Booking removed.')
      load()
    } catch (err) {
      setError(apiError(err))
    }
  }

  if (!bookings && !error) return <LoadingState message="Loading reservations…" />

  const filteredBookings = activeFilter === 'ALL'
    ? (bookings || [])
    : (bookings || []).filter((b) => b.type === activeFilter)

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Link to={`/trips/${tripId}`} style={{ fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={16} /> Back to trip workspace
        </Link>
      </div>

      <PageHeader
        eyebrow="Reservations & Tickets"
        title="Bookings Manager"
        description="Consolidate flight tickets, hotel reservations, car rentals, and tour confirmations."
        action={
          <Button icon={Plus} onClick={openAddModal}>
            Add Booking
          </Button>
        }
      />

      <ErrorMessage>{error}</ErrorMessage>
      {notice && <SuccessMessage>{notice}</SuccessMessage>}

      {/* Filter Tabs */}
      {bookings && bookings.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          <button
            className={`pill-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: activeFilter === 'ALL' ? '1px solid #1a73e8' : '1px solid #cbd5e1',
              background: activeFilter === 'ALL' ? '#eff6ff' : '#ffffff',
              color: activeFilter === 'ALL' ? '#1a73e8' : '#475569',
              fontWeight: activeFilter === 'ALL' ? 600 : 400,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            All Bookings ({bookings.length})
          </button>
          {BOOKING_TYPES.filter((t) => bookings.some((b) => b.type === t)).map((type) => (
            <button
              key={type}
              className={`pill-btn ${activeFilter === type ? 'active' : ''}`}
              onClick={() => setActiveFilter(type)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: activeFilter === type ? '1px solid #1a73e8' : '1px solid #cbd5e1',
                background: activeFilter === type ? '#eff6ff' : '#ffffff',
                color: activeFilter === type ? '#1a73e8' : '#475569',
                fontWeight: activeFilter === type ? 600 : 400,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {/* Bookings Grid */}
      {filteredBookings.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filteredBookings.map((b) => {
            const Icon = getTypeIcon(b.type)
            return (
              <Card
                key={b.id}
                hover
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="feature-icon-wrapper" style={{ margin: 0, width: 36, height: 36 }}>
                        <Icon size={18} />
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.86rem', color: '#64748b' }}>
                        {b.type}
                      </span>
                    </div>
                    <Badge variant={getStatusBadgeVariant(b.status)}>
                      {b.status}
                    </Badge>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', margin: '0 0 6px', color: '#0f172a' }}>
                    {b.provider}
                  </h3>

                  {b.bookingReference && (
                    <p style={{ fontSize: '0.86rem', color: '#475569', margin: '0 0 10px' }}>
                      Ref: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#0f172a' }}>{b.bookingReference}</code>
                    </p>
                  )}

                  <div style={{ fontSize: '0.84rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
                    {b.startAt && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={13} />
                        <span>Start: {b.startAt.replace('T', ' ')}</span>
                      </div>
                    )}
                    {b.endAt && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={13} />
                        <span>End: {b.endAt.replace('T', ' ')}</span>
                      </div>
                    )}
                  </div>

                  {b.amount != null && (
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1a73e8', marginBottom: 12 }}>
                      {b.currency === 'INR' || !b.currency ? formatINR(b.amount) : `${b.currency} ${Number(b.amount).toLocaleString('en-IN')}`}
                    </div>
                  )}

                  {b.documentUrl && (
                    <a
                      href={b.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: 5, color: '#2563eb', marginBottom: 10 }}
                    >
                      <ExternalLink size={13} /> Open confirmation voucher
                    </a>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 8,
                    paddingTop: 12,
                    borderTop: '1px solid #f1f5f9'
                  }}
                >
                  <Button size="sm" variant="secondary" icon={Edit2} onClick={() => openEditModal(b)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" icon={Trash2} onClick={() => setConfirmDelete(b)}>
                    Delete
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={FileCheck2}
          title="No bookings recorded"
          description="Log flights, hotel stays, rental cars, or event tickets to keep track of confirmations."
          action={
            <Button icon={Plus} onClick={openAddModal}>
              Record First Booking
            </Button>
          }
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={modalBooking !== null}
        onClose={closeModal}
        title={modalBooking?.id ? 'Edit Booking' : 'Add Booking'}
        maxWidth="600px"
      >
        <form onSubmit={handleSaveBooking}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select
              label="Booking Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              {BOOKING_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              {BOOKING_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>

          <Input
            label="Provider / Company"
            placeholder="e.g. IRCTC / Indian Railways, IndiGo, Taj Hotels, MakeMyTrip, RedBus"
            required
            maxLength={200}
            value={formData.provider}
            onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
          />

          <Input
            label="Confirmation Reference / Booking #"
            placeholder="e.g. PNR-8472910, RES-49910"
            maxLength={100}
            value={formData.bookingReference}
            onChange={(e) => setFormData({ ...formData, bookingReference: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="Start / Departure Date & Time"
              type="datetime-local"
              value={formData.startAt}
              onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
            />
            <Input
              label="End / Arrival Date & Time"
              type="datetime-local"
              value={formData.endAt}
              onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <Input
              label="Total Cost Amount (₹ INR)"
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 3500"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
            <Input
              label="Currency"
              maxLength={3}
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
            />
          </div>

          <Input
            label="Voucher or Document URL (optional)"
            type="url"
            maxLength={2048}
            placeholder="https://drive.google.com/… or confirmation link"
            value={formData.documentUrl}
            onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
          />

          <div className="modal-actions" style={{ marginTop: 20 }}>
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} disabled={saving}>
              {modalBooking?.id ? 'Update Booking' : 'Save Booking'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmDelete !== null}
        title={`Delete booking with ${confirmDelete?.provider}?`}
        description="Are you sure you want to delete this reservation record?"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { itineraryService } from '../services/itineraryService'
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
  SuccessMessage,
  Textarea
} from '../components/ui'
import { apiError } from '../api/client'
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Calendar,
  Clock,
  Edit2,
  MapPin,
  Plus,
  Trash2,
  Utensils,
  Camera,
  Car,
  Hotel,
  Coffee,
  Ticket
} from 'lucide-react'

const ACTIVITY_TYPES = [
  'ATTRACTION',
  'DINING',
  'TRANSPORT',
  'HOTEL',
  'EVENT',
  'FREE_TIME',
  'OTHER'
]

const getActivityIcon = (type) => {
  switch (type) {
    case 'DINING':
      return Utensils
    case 'ATTRACTION':
      return Camera
    case 'TRANSPORT':
      return Car
    case 'HOTEL':
      return Hotel
    case 'FREE_TIME':
      return Coffee
    default:
      return Ticket
  }
}

export default function ItineraryPage() {
  const { tripId } = useParams()
  const [days, setDays] = useState(null)
  const [activities, setActivities] = useState({})
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)

  // Day Modal
  const [dayModal, setDayModal] = useState(null) // null = closed, {} = add, obj = edit
  const [dayForm, setDayForm] = useState({ dayNumber: 1, title: '', description: '' })

  // Activity Modal
  const [activityModal, setActivityModal] = useState(null) // null = closed, { dayId, activity }
  const [activityForm, setActivityForm] = useState({
    title: '',
    type: 'ATTRACTION',
    startTime: '',
    endTime: '',
    sortOrder: 1
  })

  // Confirm delete
  const [confirmDelete, setConfirmDelete] = useState(null) // { type: 'day'|'activity', id, label }

  const load = async () => {
    try {
      const dayList = await itineraryService.list(tripId)
      // Sort days by dayNumber
      const sortedDays = (dayList || []).sort((a, b) => a.dayNumber - b.dayNumber)
      setDays(sortedDays)

      const pairs = await Promise.all(
        sortedDays.map(async (d) => {
          const acts = await itineraryService.activities(d.id)
          // Sort activities by sortOrder
          const sortedActs = (acts || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
          return [d.id, sortedActs]
        })
      )
      setActivities(Object.fromEntries(pairs))
    } catch (e) {
      setError(apiError(e))
    }
  }

  useEffect(() => {
    load()
  }, [tripId])

  // --- Day actions ---
  const openAddDay = () => {
    const nextDayNum = (days?.length || 0) + 1
    setDayForm({ dayNumber: nextDayNum, title: `Day ${nextDayNum} Exploration`, description: '' })
    setDayModal({})
  }

  const openEditDay = (day) => {
    setDayForm({
      dayNumber: day.dayNumber,
      title: day.title || '',
      description: day.description || ''
    })
    setDayModal(day)
  }

  const handleSaveDay = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        tripId: Number(tripId),
        dayNumber: Number(dayForm.dayNumber),
        title: dayForm.title.trim(),
        description: dayForm.description.trim() || null
      }

      if (dayModal.id) {
        await itineraryService.update(tripId, dayModal.id, payload)
        setNotice('Itinerary day updated.')
      } else {
        await itineraryService.create(tripId, payload)
        setNotice('Itinerary day added.')
      }
      setDayModal(null)
      load()
    } catch (err) {
      setError(apiError(err))
    } finally {
      setSaving(false)
    }
  }

  // --- Activity actions ---
  const openAddActivity = (day) => {
    const dayActs = activities[day.id] || []
    const nextOrder = dayActs.length + 1
    setActivityForm({
      title: '',
      type: 'ATTRACTION',
      startTime: '',
      endTime: '',
      sortOrder: nextOrder
    })
    setActivityModal({ dayId: day.id })
  }

  const openEditActivity = (dayId, act) => {
    setActivityForm({
      title: act.title || '',
      type: act.type || 'ATTRACTION',
      startTime: act.startTime || '',
      endTime: act.endTime || '',
      sortOrder: act.sortOrder || 1
    })
    setActivityModal({ dayId, activity: act })
  }

  const handleSaveActivity = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (activityModal.activity) {
        // Edit activity
        await itineraryService.updateActivity(activityModal.activity.id, {
          title: activityForm.title.trim(),
          sortOrder: Number(activityForm.sortOrder)
        })
        setNotice('Activity updated.')
      } else {
        // Create activity
        await itineraryService.createActivity(activityModal.dayId, {
          itineraryId: activityModal.dayId,
          title: activityForm.title.trim(),
          type: activityForm.type,
          sortOrder: Number(activityForm.sortOrder),
          startTime: activityForm.startTime || null,
          endTime: activityForm.endTime || null
        })
        setNotice('Activity added.')
      }
      setActivityModal(null)
      load()
    } catch (err) {
      setError(apiError(err))
    } finally {
      setSaving(false)
    }
  }

  const handleMoveActivity = async (dayId, actIndex, direction) => {
    const dayActs = [...(activities[dayId] || [])]
    const targetIndex = actIndex + direction
    if (targetIndex < 0 || targetIndex >= dayActs.length) return

    // Swap elements
    const temp = dayActs[actIndex]
    dayActs[actIndex] = dayActs[targetIndex]
    dayActs[targetIndex] = temp

    // Update local state optimistically
    const reorderedIds = dayActs.map((a) => a.id)
    setActivities({ ...activities, [dayId]: dayActs })

    try {
      await itineraryService.reorderActivities(dayId, reorderedIds)
    } catch (err) {
      setError(apiError(err))
      load() // rollback on error
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    try {
      if (confirmDelete.type === 'day') {
        await itineraryService.remove(tripId, confirmDelete.id)
        setNotice('Day and associated activities deleted.')
      } else {
        await itineraryService.removeActivity(confirmDelete.id)
        setNotice('Activity deleted.')
      }
      setConfirmDelete(null)
      load()
    } catch (err) {
      setError(apiError(err))
    }
  }

  if (!days && !error) return <LoadingState message="Loading itinerary schedule…" />

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Link to={`/trips/${tripId}`} style={{ fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={16} /> Back to trip workspace
        </Link>
      </div>

      <PageHeader
        eyebrow="Timeline Schedule"
        title="Smart Itinerary"
        description="Organize your days, sequence morning-to-night activities, and optimize your route."
        action={
          <Button icon={Plus} onClick={openAddDay}>
            Add Itinerary Day
          </Button>
        }
      />

      <ErrorMessage>{error}</ErrorMessage>
      {notice && <SuccessMessage>{notice}</SuccessMessage>}

      {/* Days List */}
      {days && days.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {days.map((day) => {
            const dayActs = activities[day.id] || []
            return (
              <Card key={day.id} style={{ padding: 24, borderLeft: '4px solid #1a73e8' }}>
                {/* Day Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 14 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Badge variant="primary">Day {day.dayNumber}</Badge>
                      <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#0f172a' }}>
                        {day.title || `Day ${day.dayNumber}`}
                      </h2>
                    </div>
                    {day.description && (
                      <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '4px 0 0' }}>
                        {day.description}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button size="sm" variant="secondary" icon={Edit2} onClick={() => openEditDay(day)}>
                      Edit Day
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      icon={Trash2}
                      onClick={() =>
                        setConfirmDelete({
                          type: 'day',
                          id: day.id,
                          label: `Day ${day.dayNumber} (${day.title})`
                        })
                      }
                    >
                      Delete Day
                    </Button>
                  </div>
                </div>

                {/* Activities for this Day */}
                {dayActs.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                    {dayActs.map((act, idx) => {
                      const Icon = getActivityIcon(act.type)
                      return (
                        <div
                          key={act.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            background: '#f8fafc',
                            borderRadius: 8,
                            border: '1px solid #e2e8f0'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                background: '#e0f2fe',
                                color: '#0284c7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '0.8rem'
                              }}
                            >
                              {idx + 1}
                            </div>
                            <div className="feature-icon-wrapper" style={{ margin: 0, width: 32, height: 32 }}>
                              <Icon size={16} />
                            </div>
                            <div>
                              <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'block' }}>
                                {act.title}
                              </strong>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                                <Badge variant="default" size="sm">
                                  {act.type}
                                </Badge>
                                {(act.startTime || act.endTime) && (
                                  <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    <Clock size={12} /> {act.startTime || ''} {act.endTime ? `– ${act.endTime}` : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {/* Reorder Buttons */}
                            <button
                              className="link-button"
                              style={{ padding: '4px 6px', opacity: idx === 0 ? 0.3 : 1 }}
                              disabled={idx === 0}
                              onClick={() => handleMoveActivity(day.id, idx, -1)}
                              title="Move up"
                            >
                              <ArrowUp size={15} />
                            </button>
                            <button
                              className="link-button"
                              style={{ padding: '4px 6px', opacity: idx === dayActs.length - 1 ? 0.3 : 1 }}
                              disabled={idx === dayActs.length - 1}
                              onClick={() => handleMoveActivity(day.id, idx, 1)}
                              title="Move down"
                            >
                              <ArrowDown size={15} />
                            </button>

                            <button
                              className="link-button"
                              style={{ padding: '4px 6px' }}
                              onClick={() => openEditActivity(day.id, act)}
                              title="Edit activity"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              className="link-button danger"
                              style={{ padding: '4px 6px' }}
                              onClick={() =>
                                setConfirmDelete({
                                  type: 'activity',
                                  id: act.id,
                                  label: act.title
                                })
                              }
                              title="Delete activity"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.88rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: 16 }}>
                    No activities scheduled for this day yet.
                  </p>
                )}

                <Button size="sm" variant="secondary" icon={Plus} onClick={() => openAddActivity(day)}>
                  Add Activity to Day {day.dayNumber}
                </Button>
              </Card>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No itinerary days created"
          description="Build your day-by-day travel schedule manually or use the AI Trip Planner to craft one instantly."
          action={
            <Button icon={Plus} onClick={openAddDay}>
              Add Day 1
            </Button>
          }
        />
      )}

      {/* Add / Edit Day Modal */}
      <Modal
        open={dayModal !== null}
        onClose={() => setDayModal(null)}
        title={dayModal?.id ? 'Edit Itinerary Day' : 'Add Itinerary Day'}
      >
        <form onSubmit={handleSaveDay}>
          <Input
            label="Day Number"
            type="number"
            min="1"
            required
            value={dayForm.dayNumber}
            onChange={(e) => setDayForm({ ...dayForm, dayNumber: e.target.value })}
          />
          <Input
            label="Day Title / Theme"
            placeholder="e.g. Historic Temples & Street Food Walk"
            maxLength={300}
            value={dayForm.title}
            onChange={(e) => setDayForm({ ...dayForm, title: e.target.value })}
          />
          <Textarea
            label="Day Description / Notes"
            placeholder="Summary of today's goals, neighborhoods to visit, or transit tips…"
            rows={3}
            maxLength={5000}
            value={dayForm.description}
            onChange={(e) => setDayForm({ ...dayForm, description: e.target.value })}
          />

          <div className="modal-actions" style={{ marginTop: 20 }}>
            <Button type="button" variant="secondary" onClick={() => setDayModal(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} disabled={saving}>
              {dayModal?.id ? 'Update Day' : 'Add Day'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Activity Modal */}
      <Modal
        open={activityModal !== null}
        onClose={() => setActivityModal(null)}
        title={activityModal?.activity ? 'Edit Activity' : 'Add Activity'}
      >
        <form onSubmit={handleSaveActivity}>
          <Input
            label="Activity Title"
            placeholder="e.g. Visit Senso-ji Temple, Ramen Lunch, Tokyo Skytree"
            required
            maxLength={200}
            value={activityForm.title}
            onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
          />

          {!activityModal?.activity && (
            <>
              <Select
                label="Activity Category"
                value={activityForm.type}
                onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
              >
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input
                  label="Start Time (optional)"
                  type="time"
                  value={activityForm.startTime}
                  onChange={(e) => setActivityForm({ ...activityForm, startTime: e.target.value })}
                />
                <Input
                  label="End Time (optional)"
                  type="time"
                  value={activityForm.endTime}
                  onChange={(e) => setActivityForm({ ...activityForm, endTime: e.target.value })}
                />
              </div>
            </>
          )}

          <Input
            label="Sequence Order"
            type="number"
            min="1"
            required
            value={activityForm.sortOrder}
            onChange={(e) => setActivityForm({ ...activityForm, sortOrder: e.target.value })}
          />

          <div className="modal-actions" style={{ marginTop: 20 }}>
            <Button type="button" variant="secondary" onClick={() => setActivityModal(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} disabled={saving}>
              {activityModal?.activity ? 'Update Activity' : 'Add Activity'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmDelete !== null}
        title={`Delete ${confirmDelete?.label}?`}
        description={
          confirmDelete?.type === 'day'
            ? 'This will permanently remove this day and all scheduled activities within it.'
            : 'Are you sure you want to remove this activity from the day schedule?'
        }
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

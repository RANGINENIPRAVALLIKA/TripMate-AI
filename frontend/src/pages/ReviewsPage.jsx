import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { reviewService } from '../services/reviewService'
import { destinationService } from '../services/destinationService'
import ReviewCard from '../components/reviews/ReviewCard'
import ReviewForm from '../components/reviews/ReviewForm'
import ReviewSummary from '../components/reviews/ReviewSummary'
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorMessage,
  PageHeader,
  Select,
  SuccessMessage,
  Modal
} from '../components/ui'
import { apiError } from '../api/client'
import { Star, MessageSquarePlus, Filter } from 'lucide-react'

const types = ['DESTINATION', 'HOTEL', 'RESTAURANT', 'ATTRACTION']

export default function ReviewsPage() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const initialType = params.get('targetType') || 'DESTINATION'
  const initialId = params.get('targetId') || '1'

  const [target, setTarget] = useState({
    targetType: initialType,
    targetId: initialId
  })
  const [availableItems, setAvailableItems] = useState([])
  const [reviews, setReviews] = useState(null)
  const [summary, setSummary] = useState(null)
  const [err, setErr] = useState('')
  const [note, setNote] = useState('')
  const [modal, setModal] = useState(undefined)
  const [remove, setRemove] = useState(null)
  const [saving, setSaving] = useState(false)

  // Load target items for selector
  useEffect(() => {
    if (target.targetType === 'DESTINATION') {
      destinationService.all().then((d) => setAvailableItems(d || []))
    } else if (target.targetType === 'HOTEL') {
      destinationService.listHotels({}).then((res) => setAvailableItems(res?.content || []))
    } else if (target.targetType === 'RESTAURANT') {
      destinationService.listRestaurants({}).then((res) => setAvailableItems(res?.content || []))
    } else if (target.targetType === 'ATTRACTION') {
      destinationService.listAttractions({}).then((res) => setAvailableItems(res?.content || []))
    }
  }, [target.targetType])

  const loadReviews = async (tType = target.targetType, tId = target.targetId) => {
    if (!tId) return
    setReviews(null)
    setErr('')
    try {
      const [revList, revSummary] = await Promise.all([
        reviewService.list(tType, tId),
        reviewService.summary(tType, tId)
      ])
      setReviews(revList || [])
      setSummary(revSummary || null)
    } catch (x) {
      setErr(apiError(x))
    }
  }

  useEffect(() => {
    if (target.targetId) {
      loadReviews(target.targetType, target.targetId)
    }
  }, [target.targetType, target.targetId])

  const save = async (body) => {
    setSaving(true)
    try {
      if (modal) {
        await reviewService.update(modal.id, body)
      } else {
        await reviewService.create({
          ...body,
          targetType: target.targetType,
          targetId: Number(target.targetId)
        })
      }
      setModal(undefined)
      setNote('Review submitted successfully.')
      loadReviews(target.targetType, target.targetId)
    } catch (e) {
      setErr(apiError(e))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await reviewService.remove(remove.id)
      setRemove(null)
      setNote('Review deleted.')
      loadReviews(target.targetType, target.targetId)
    } catch (e) {
      setErr(apiError(e))
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Community & Feedback"
        title="Reviews & Ratings"
        description="Share ratings and read verified travel experiences for destinations, hotels, dining, and attractions."
        action={
          <Button
            onClick={() => setModal(null)}
            icon={MessageSquarePlus}
            variant="primary"
          >
            Write a Review
          </Button>
        }
      />

      <ErrorMessage>{err}</ErrorMessage>
      {note && <SuccessMessage>{note}</SuccessMessage>}

      {/* Target Selector Card */}
      <Card style={{ marginBottom: 26 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
          <Select
            label="Category"
            value={target.targetType}
            onChange={(e) => {
              const newType = e.target.value
              setTarget({ targetType: newType, targetId: '1' })
            }}
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>

          <Select
            label="Select Item"
            value={target.targetId}
            onChange={(e) => setTarget({ ...target, targetId: e.target.value })}
          >
            {availableItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name || (item.state ? `${item.city}, ${item.state}, India` : `${item.city}, ${item.country || 'India'}`)} (ID #{item.id})
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {reviews === null ? (
        <EmptyState
          icon={Star}
          title="Loading reviews…"
          description="Fetching ratings and verified feedback from the server."
        />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 24 }}>
            {summary && <ReviewSummary summary={summary} />}
            <Card>
              <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', color: '#0f172a' }}>
                {reviews[0]?.targetName || `${target.targetType} Reviews`}
              </h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                Total community reviews: {reviews.length}. Calculated directly from authenticated travelers.
              </p>
            </Card>
          </div>

          {reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {reviews.map((r) => (
                <ReviewCard
                  key={r.id}
                  review={r}
                  own={r.userId === user?.id}
                  onEdit={() => setModal(r)}
                  onDelete={() => setRemove(r)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Star}
              title="No reviews yet"
              description="Be the first traveler to share feedback for this spot!"
              action={
                <Button onClick={() => setModal(null)} icon={MessageSquarePlus}>
                  Write the First Review
                </Button>
              }
            />
          )}
        </>
      )}

      {/* Review Modal */}
      {modal !== undefined && (
        <Modal
          open={true}
          onClose={() => setModal(undefined)}
          title={modal ? 'Edit Review' : 'Write a Review'}
        >
          <ReviewForm
            review={modal}
            target={target}
            onSubmit={save}
            onCancel={() => setModal(undefined)}
            saving={saving}
            error={err}
          />
        </Modal>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        open={!!remove}
        title="Delete this review?"
        description="This will permanently delete your review and update the aggregate rating."
        confirmText="Yes, Delete"
        onCancel={() => setRemove(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

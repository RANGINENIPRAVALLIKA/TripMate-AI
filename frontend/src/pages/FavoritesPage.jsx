import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { favoriteService } from '../services/favoriteService'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorMessage,
  LoadingState,
  PageHeader,
  SuccessMessage
} from '../components/ui'
import { apiError } from '../api/client'
import {
  Heart,
  Globe2,
  Building2,
  UtensilsCrossed,
  Camera,
  Trash2,
  ArrowRight
} from 'lucide-react'

const filterTabs = [
  { label: 'All Saved', type: '', icon: Heart },
  { label: 'Destinations', type: 'DESTINATION', icon: Globe2 },
  { label: 'Hotels', type: 'HOTEL', icon: Building2 },
  { label: 'Restaurants', type: 'RESTAURANT', icon: UtensilsCrossed },
  { label: 'Attractions', type: 'ATTRACTION', icon: Camera }
]

export default function FavoritesPage() {
  const [type, setType] = useState('')
  const [items, setItems] = useState(null)
  const [err, setErr] = useState('')
  const [note, setNote] = useState('')

  const load = () => {
    setItems(null)
    favoriteService
      .list(type || null)
      .then(setItems)
      .catch((e) => setErr(apiError(e)))
  }

  useEffect(load, [type])

  const remove = async (id) => {
    try {
      await favoriteService.remove(id)
      setNote('Item removed from your favorites.')
      load()
    } catch (e) {
      setErr(apiError(e))
    }
  }

  const getTargetLink = (item) => {
    switch (item.targetType) {
      case 'DESTINATION':
        return `/destinations/${item.targetId}/nearby-places`
      case 'HOTEL':
        return `/hotels`
      case 'RESTAURANT':
        return `/restaurants`
      case 'ATTRACTION':
        return `/attractions`
      default:
        return '#'
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Curated Wishlist"
        title="Saved Favorites"
        description="Your personal collection of favorite destinations, stays, dining spots, and cultural landmarks."
      />

      <ErrorMessage>{err}</ErrorMessage>
      {note && <SuccessMessage>{note}</SuccessMessage>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {filterTabs.map((tab) => {
          const Icon = tab.icon
          const active = type === tab.type
          return (
            <button
              key={tab.label}
              onClick={() => {
                setType(tab.type)
                setNote('')
              }}
              className={`btn ${active ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {!items && !err ? (
        <LoadingState message="Loading saved favorites…" />
      ) : items?.length ? (
        <div className="trip-grid">
          {items.map((item) => (
            <Card key={item.id} hover className="travel-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Badge
                  variant={
                    item.targetType === 'DESTINATION'
                      ? 'primary'
                      : item.targetType === 'RESTAURANT'
                      ? 'coral'
                      : item.targetType === 'HOTEL'
                      ? 'success'
                      : 'default'
                  }
                >
                  {item.targetType}
                </Badge>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: '#ef4444' }}
                  title="Remove from favorites"
                  onClick={() => remove(item.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <h3 style={{ margin: '0 0 16px', fontSize: '1.25rem', color: '#0f172a', flex: 1 }}>
                {item.name}
              </h3>

              <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to={getTargetLink(item)} className="btn btn-secondary btn-sm">
                  View Details <ArrowRight size={13} />
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  style={{ color: '#ef4444' }}
                  onClick={() => remove(item.id)}
                >
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="No favorites saved yet"
          description="Browse destinations, hotels, dining spots, or attractions and tap the heart icon to save them here."
          action={
            <Link to="/destinations" className="btn btn-primary">
              <Globe2 size={16} /> Browse Destinations
            </Link>
          }
        />
      )}
    </div>
  )
}

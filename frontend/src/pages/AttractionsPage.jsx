import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { destinationService } from '../services/destinationService'
import { favoriteService } from '../services/favoriteService'
import {
  Card,
  PageHeader,
  LoadingState,
  ErrorMessage,
  EmptyState,
  Badge,
  RatingDisplay,
  Button
} from '../components/ui'
import { apiError } from '../api/client'
import { formatINR } from '../utils/currency'
import {
  Camera,
  Search,
  MapPin,
  Heart,
  Star,
  Ticket
} from 'lucide-react'

export default function AttractionsPage() {
  const [params, setParams] = useSearchParams()
  const destId = params.get('destinationId') || ''
  const [destinations, setDestinations] = useState([])
  const [attractions, setAttractions] = useState([])
  const [search, setSearch] = useState('')
  const [selectedDest, setSelectedDest] = useState(destId)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [favorites, setFavorites] = useState({})

  const load = () => {
    setLoading(true)
    destinationService
      .listAttractions({
        destinationId: selectedDest || undefined,
        q: search || undefined
      })
      .then((res) => {
        setAttractions(res?.content || [])
      })
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    destinationService
      .all()
      .then((d) => setDestinations(d || []))
      .catch(() => {})

    favoriteService
      .list('ATTRACTION')
      .then((favs) => {
        const map = {}
        if (Array.isArray(favs)) {
          favs.forEach((f) => {
            if (f.attractionId) map[f.attractionId] = f.id
          })
        }
        setFavorites(map)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    load()
  }, [selectedDest])

  const toggleFavorite = async (attractionId) => {
    const existingFavId = favorites[attractionId]
    try {
      if (existingFavId) {
        await favoriteService.remove(existingFavId)
        setFavorites((prev) => {
          const next = { ...prev }
          delete next[attractionId]
          return next
        })
      } else {
        const created = await favoriteService.add('ATTRACTION', attractionId)
        setFavorites((prev) => ({
          ...prev,
          [attractionId]: created?.id || true
        }))
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Sightseeing & Culture"
        title="Iconic Attractions"
        description="Explore historical landmarks, museums, observation decks, and natural wonders."
      />

      <ErrorMessage>{error}</ErrorMessage>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 26, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
          <input
            type="text"
            className="input-control"
            style={{ paddingLeft: 38 }}
            placeholder="Search attractions by name or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
          />
        </div>

        <select
          className="input-control"
          style={{ width: 'auto', minWidth: 200 }}
          value={selectedDest}
          onChange={(e) => setSelectedDest(e.target.value)}
        >
          <option value="">All Destinations</option>
          {destinations.map((d) => (
            <option key={d.id} value={d.id}>
              {d.city}, {d.country}
            </option>
          ))}
        </select>

        <Button onClick={load} variant="primary">
          Filter
        </Button>
      </div>

      {loading ? (
        <LoadingState message="Discovering landmarks and attractions…" />
      ) : attractions.length > 0 ? (
        <div className="destination-grid">
          {attractions.map((a) => {
            const isFav = !!favorites[a.id]
            const fee = Number(a.entryFee || 0)
            return (
              <Card key={a.id} hover className="travel-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative' }}>
                  <img src={a.imageUrl} alt={a.name} className="destination-card-img" />
                  <button
                    onClick={() => toggleFavorite(a.id)}
                    className="btn btn-ghost"
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      background: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '50%',
                      padding: 8,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}
                    title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                  >
                    <Heart size={16} fill={isFav ? '#ef4444' : 'none'} color={isFav ? '#ef4444' : '#64748b'} />
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span className="eyebrow" style={{ color: '#2563eb' }}>
                    <MapPin size={12} /> {a.destinationCity || 'Dest.'}
                  </span>
                  <RatingDisplay rating={a.rating} />
                </div>

                <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', color: '#0f172a' }}>
                  {a.name}
                </h3>

                <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, flex: 1 }}>
                  {a.description}
                </p>

                <div className="destination-card-meta">
                  <div>
                    <small style={{ display: 'block', color: '#94a3b8', fontSize: '0.75rem' }}>Entry Fee</small>
                    <strong style={{ color: fee > 0 ? '#1e40af' : '#10b981', fontSize: '1.05rem' }}>
                      {fee > 0 ? formatINR(fee) : 'Free Admission'}
                    </strong>
                  </div>

                  <Link to={`/reviews?targetType=ATTRACTION&targetId=${a.id}`} className="btn btn-secondary btn-sm">
                    <Star size={13} /> Reviews
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={Camera}
          title="No attractions found"
          description="Try broadening your destination selection or search query."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch('')
                setSelectedDest('')
              }}
            >
              Reset Filters
            </Button>
          }
        />
      )}
    </div>
  )
}

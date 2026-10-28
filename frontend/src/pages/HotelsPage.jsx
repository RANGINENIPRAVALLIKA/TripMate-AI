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
  Building2,
  Search,
  MapPin,
  Heart,
  DollarSign,
  Star
} from 'lucide-react'

export default function HotelsPage() {
  const [params, setParams] = useSearchParams()
  const destId = params.get('destinationId') || ''
  const [destinations, setDestinations] = useState([])
  const [hotels, setHotels] = useState([])
  const [search, setSearch] = useState('')
  const [selectedDest, setSelectedDest] = useState(destId)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [favorites, setFavorites] = useState({})

  const load = () => {
    setLoading(true)
    destinationService
      .listHotels({
        destinationId: selectedDest || undefined,
        q: search || undefined
      })
      .then((res) => {
        setHotels(res?.content || [])
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
      .list('HOTEL')
      .then((favs) => {
        const map = {}
        if (Array.isArray(favs)) {
          favs.forEach((f) => {
            if (f.hotelId) map[f.hotelId] = f.id
          })
        }
        setFavorites(map)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    load()
  }, [selectedDest])

  const toggleFavorite = async (hotelId) => {
    const existingFavId = favorites[hotelId]
    try {
      if (existingFavId) {
        await favoriteService.remove(existingFavId)
        setFavorites((prev) => {
          const next = { ...prev }
          delete next[hotelId]
          return next
        })
      } else {
        const created = await favoriteService.add('HOTEL', hotelId)
        setFavorites((prev) => ({
          ...prev,
          [hotelId]: created?.id || true
        }))
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Accommodations & Stays"
        title="Hotels & Resorts"
        description="Browse premier verified accommodations with ratings, nightly rates, and addresses."
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
            placeholder="Search hotels by name or address…"
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
        <LoadingState message="Loading hotels & stays…" />
      ) : hotels.length > 0 ? (
        <div className="destination-grid">
          {hotels.map((h) => {
            const isFav = !!favorites[h.id]
            return (
              <Card key={h.id} hover className="travel-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative' }}>
                  <img src={h.imageUrl} alt={h.name} className="destination-card-img" />
                  <button
                    onClick={() => toggleFavorite(h.id)}
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
                    <MapPin size={12} /> {h.destinationCity || 'Dest.'}
                  </span>
                  <RatingDisplay rating={h.rating} />
                </div>

                <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', color: '#0f172a' }}>
                  {h.name}
                </h3>

                <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#64748b', flex: 1 }}>
                  {h.address}
                </p>

                <div className="destination-card-meta">
                  <div>
                    <small style={{ display: 'block', color: '#94a3b8', fontSize: '0.75rem' }}>Nightly Rate</small>
                    <strong style={{ color: '#1e40af', fontSize: '1.1rem' }}>
                      {formatINR(h.pricePerNight || 0)} <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>/ night</span>
                    </strong>
                  </div>

                  <Link to={`/reviews?targetType=HOTEL&targetId=${h.id}`} className="btn btn-secondary btn-sm">
                    <Star size={13} /> Reviews
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title="No hotels found"
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

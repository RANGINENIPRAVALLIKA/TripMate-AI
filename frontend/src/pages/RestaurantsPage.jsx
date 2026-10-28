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
import {
  UtensilsCrossed,
  Search,
  MapPin,
  Heart,
  Star
} from 'lucide-react'

export default function RestaurantsPage() {
  const [params, setParams] = useSearchParams()
  const destId = params.get('destinationId') || ''
  const [destinations, setDestinations] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [search, setSearch] = useState('')
  const [selectedDest, setSelectedDest] = useState(destId)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [favorites, setFavorites] = useState({})

  const load = () => {
    setLoading(true)
    destinationService
      .listRestaurants({
        destinationId: selectedDest || undefined,
        q: search || undefined
      })
      .then((res) => {
        setRestaurants(res?.content || [])
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
      .list('RESTAURANT')
      .then((favs) => {
        const map = {}
        if (Array.isArray(favs)) {
          favs.forEach((f) => {
            if (f.restaurantId) map[f.restaurantId] = f.id
          })
        }
        setFavorites(map)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    load()
  }, [selectedDest])

  const toggleFavorite = async (restId) => {
    const existingFavId = favorites[restId]
    try {
      if (existingFavId) {
        await favoriteService.remove(existingFavId)
        setFavorites((prev) => {
          const next = { ...prev }
          delete next[restId]
          return next
        })
      } else {
        const created = await favoriteService.add('RESTAURANT', restId)
        setFavorites((prev) => ({
          ...prev,
          [restId]: created?.id || true
        }))
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Culinary Discoveries"
        title="Dining & Cafes"
        description="Explore top-rated restaurants, regional gastronomy, and local dining favorites."
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
            placeholder="Search restaurants by name or cuisine…"
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
        <LoadingState message="Discovering culinary spots…" />
      ) : restaurants.length > 0 ? (
        <div className="destination-grid">
          {restaurants.map((r) => {
            const isFav = !!favorites[r.id]
            return (
              <Card key={r.id} hover className="travel-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative' }}>
                  <img src={r.imageUrl} alt={r.name} className="destination-card-img" />
                  <button
                    onClick={() => toggleFavorite(r.id)}
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
                  <span className="eyebrow" style={{ color: '#ea580c' }}>
                    <MapPin size={12} /> {r.destinationCity || 'Dest.'}
                  </span>
                  <RatingDisplay rating={r.rating} />
                </div>

                <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', color: '#0f172a' }}>
                  {r.name}
                </h3>

                <div style={{ marginBottom: 10 }}>
                  <Badge variant="coral">{r.cuisine || 'Local Cuisine'}</Badge>
                </div>

                <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#64748b', flex: 1 }}>
                  {r.address}
                </p>

                <div className="destination-card-meta">
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Verified Spot
                  </span>

                  <Link to={`/reviews?targetType=RESTAURANT&targetId=${r.id}`} className="btn btn-secondary btn-sm">
                    <Star size={13} /> Reviews
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={UtensilsCrossed}
          title="No dining spots found"
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

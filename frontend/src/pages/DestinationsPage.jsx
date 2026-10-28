import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { destinationService } from '../services/destinationService'
import { favoriteService } from '../services/favoriteService'
import {
  Card,
  Badge,
  PageHeader,
  LoadingState,
  ErrorMessage,
  EmptyState,
  Button
} from '../components/ui'
import { apiError } from '../api/client'
import {
  Search,
  MapPin,
  Calendar,
  Heart,
  Sparkles,
  ArrowRight,
  Building2,
  UtensilsCrossed,
  Compass,
  Filter,
  IndianRupee,
  RotateCcw
} from 'lucide-react'

const indianStatesAndUTs = [
  'All States & UTs',
  'Telangana',
  'Andhra Pradesh',
  'Kerala',
  'Tamil Nadu',
  'Karnataka',
  'Goa',
  'Maharashtra',
  'Rajasthan',
  'Himachal Pradesh',
  'Uttarakhand',
  'Jammu & Kashmir',
  'Ladakh',
  'Delhi',
  'Uttar Pradesh',
  'Punjab',
  'Chandigarh',
  'Madhya Pradesh',
  'Gujarat',
  'West Bengal',
  'Odisha',
  'Bihar',
  'Sikkim',
  'Meghalaya',
  'Assam',
  'Arunachal Pradesh',
  'Andaman & Nicobar',
  'Lakshadweep',
  'Puducherry'
]

export default function DestinationsPage() {
  const [searchParams] = useSearchParams()
  const initialRegion = searchParams.get('state') || ''

  const [destinations, setDestinations] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const [selectedState, setSelectedState] = useState(initialRegion)
  const [selectedSeason, setSelectedSeason] = useState('')
  const [sortBy, setSortBy] = useState('city')
  const [sortDir, setSortDir] = useState('asc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [favorites, setFavorites] = useState({})

  const load = () => {
    setLoading(true)
    const stateParam = selectedState && selectedState !== 'All States & UTs' ? selectedState : undefined
    destinationService
      .list({
        q: search || undefined,
        state: stateParam,
        bestSeason: selectedSeason || undefined,
        size: 150,
        sortBy,
        sortDir
      })
      .then((data) => {
        const items = data?.content || []
        setDestinations(items)
        setTotalCount(data?.totalElements || items.length)
      })
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    favoriteService
      .list('DESTINATION')
      .then((favs) => {
        const map = {}
        if (Array.isArray(favs)) {
          favs.forEach((f) => {
            if (f.destinationId) map[f.destinationId] = f.id
          })
        }
        setFavorites(map)
      })
      .catch(() => {})
  }, [selectedState, selectedSeason, sortBy, sortDir])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    load()
  }

  const handleReset = () => {
    setSearch('')
    setSelectedState('')
    setSelectedSeason('')
    setSortBy('city')
    setSortDir('asc')
  }

  const toggleFavorite = async (destId) => {
    const existingFavId = favorites[destId]
    try {
      if (existingFavId) {
        await favoriteService.remove(existingFavId)
        setFavorites((prev) => {
          const next = { ...prev }
          delete next[destId]
          return next
        })
      } else {
        const created = await favoriteService.add('DESTINATION', destId)
        setFavorites((prev) => ({
          ...prev,
          [destId]: created?.id || true
        }))
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Explore India"
        title="Indian Destinations & Catalog"
        description="Discover over 100 authentic Indian destinations across 28 states and 8 union territories — with realistic INR budgets, best travel seasons, and local experiences."
        action={
          <Link to="/trips/planner" className="btn btn-coral">
            <Sparkles size={16} /> Plan Trip with AI
          </Link>
        }
      />

      <ErrorMessage>{error}</ErrorMessage>

      {/* Filter / Search Bar */}
      <form onSubmit={handleSearchSubmit} className="destination-filters-bar" style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 2, minWidth: 260 }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: 13, color: '#94a3b8' }} />
          <input
            type="text"
            className="input-control"
            style={{ paddingLeft: 40 }}
            placeholder="Search by city, landmark, or state (e.g. Hyderabad, Munnar, Goa)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="input-control"
          style={{ flex: 1, minWidth: 170, cursor: 'pointer' }}
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
        >
          {indianStatesAndUTs.map((st) => (
            <option key={st} value={st === 'All States & UTs' ? '' : st}>
              {st}
            </option>
          ))}
        </select>

        <select
          className="input-control"
          style={{ flex: 1, minWidth: 140, cursor: 'pointer' }}
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
        >
          <option value="">All Seasons</option>
          <option value="October">Winter / Autumn (Oct - Mar)</option>
          <option value="November">Peak Winter (Nov - Feb)</option>
          <option value="March">Spring / Summer (Mar - Jun)</option>
          <option value="June">Monsoon Season (Jun - Sep)</option>
          <option value="Year-round">Year-round</option>
        </select>

        <select
          className="input-control"
          style={{ flex: 1, minWidth: 150, cursor: 'pointer' }}
          value={`${sortBy}-${sortDir}`}
          onChange={(e) => {
            const [b, d] = e.target.value.split('-')
            setSortBy(b)
            setSortDir(d)
          }}
        >
          <option value="city-asc">Name (A to Z)</option>
          <option value="city-desc">Name (Z to A)</option>
          <option value="averageBudget-asc">Budget: Low to High</option>
          <option value="averageBudget-desc">Budget: High to Low</option>
        </select>

        <Button type="submit" variant="primary">
          Search
        </Button>

        {(search || selectedState || selectedSeason) && (
          <Button type="button" variant="secondary" icon={RotateCcw} onClick={handleReset}>
            Reset
          </Button>
        )}
      </form>

      {/* Catalog Status Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, fontSize: '0.9rem', color: '#64748b' }}>
        <span>
          Showing <strong>{destinations.length}</strong> verified Indian destinations {selectedState ? `in ${selectedState}` : 'across India'}
        </span>
      </div>

      {loading ? (
        <LoadingState message="Discovering destinations across India…" />
      ) : destinations.length > 0 ? (
        <div className="destination-grid">
          {destinations.map((d) => {
            const isFav = !!favorites[d.id]
            const formattedBudget = Number(d.averageBudget || 0).toLocaleString('en-IN')
            return (
              <Card key={d.id} hover className="travel-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={d.imageUrl || '/assets/india_travel_hero.jpg'}
                    alt={d.city}
                    className="destination-card-img"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = '/assets/india_travel_hero.jpg'
                    }}
                  />
                  <button
                    onClick={() => toggleFavorite(d.id)}
                    className="btn btn-ghost"
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      background: 'rgba(255, 255, 255, 0.92)',
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
                  <span className="eyebrow" style={{ color: '#0284c7' }}>
                    <MapPin size={12} /> {d.state ? `${d.state}, India` : (d.country || 'India')}
                  </span>
                  <Badge variant="primary">{d.bestSeason?.split('(')[0]?.trim() || 'All Year'}</Badge>
                </div>

                <h3 style={{ margin: '0 0 8px', fontSize: '1.3rem', color: '#0f172a' }}>
                  {d.city}
                </h3>

                <p style={{ margin: '0 0 16px', fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, flex: 1 }}>
                  {d.description}
                </p>

                <div style={{ display: 'flex', gap: 10, marginBottom: 14, fontSize: '0.8rem', color: '#475569' }}>
                  <Link to={`/destinations/${d.id}/nearby-places`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={13} /> Nearby Spots
                  </Link>
                  <span>·</span>
                  <Link to={`/hotels?destinationId=${d.id}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Building2 size={13} /> Stays
                  </Link>
                  <span>·</span>
                  <Link to={`/restaurants?destinationId=${d.id}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <UtensilsCrossed size={13} /> Dining
                  </Link>
                </div>

                <div className="destination-card-meta">
                  <div>
                    <small style={{ display: 'block', color: '#94a3b8', fontSize: '0.72rem' }}>Indicative Budget</small>
                    <strong style={{ color: '#0369a1', fontSize: '1.08rem' }}>
                      ₹{formattedBudget}
                    </strong>
                  </div>

                  <Link
                    to={`/trips/planner?destinationId=${d.id}&destinationName=${encodeURIComponent(d.city)}`}
                    className="btn btn-primary btn-sm"
                  >
                    Plan Trip <ArrowRight size={14} />
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={Compass}
          title="No destinations found"
          description="Try selecting a different Indian state or clearing your search keywords."
          action={
            <Button variant="secondary" onClick={handleReset}>
              Reset Filters
            </Button>
          }
        />
      )}
    </div>
  )
}

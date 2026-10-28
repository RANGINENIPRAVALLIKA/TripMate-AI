import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { nearbyPlaceService } from '../services/nearbyPlaceService'
import { destinationService } from '../services/destinationService'
import {
  Badge,
  Card,
  EmptyState,
  ErrorMessage,
  LoadingState,
  PageHeader,
  Button
} from '../components/ui'
import { apiError } from '../api/client'
import { MapPin, Navigation, ArrowLeft, ExternalLink, Globe2 } from 'lucide-react'

export default function NearbyPlacesPage() {
  const { destinationId } = useParams()
  const [destination, setDestination] = useState(null)
  const [category, setCategory] = useState('')
  const [places, setPlaces] = useState(null)
  const [err, setErr] = useState('')

  const load = () => {
    setPlaces(null)
    nearbyPlaceService
      .list(destinationId, category || null)
      .then(setPlaces)
      .catch((e) => setErr(apiError(e)))
  }

  useEffect(() => {
    destinationService
      .get(destinationId)
      .then(setDestination)
      .catch(() => {})
    load()
  }, [destinationId, category])

  if (!places && !err) return <LoadingState message="Locating nearby places…" />

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Link to="/destinations" style={{ fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={16} /> Back to Explore India
        </Link>
      </div>

      <PageHeader
        eyebrow="Local Discovery"
        title={`Nearby Places in ${destination?.city || 'Destination'}`}
        description={`Coordinates and verified highlights located around ${destination?.city}, ${destination?.state ? `${destination.state}, India` : (destination?.country || 'India')}.`}
      />

      <ErrorMessage>{err}</ErrorMessage>

      {/* Filter by Category */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {['', 'Heritage & Forts', 'Spiritual & Temples', 'Scenic Nature & Lakes', 'Historic Sight', 'Coastal Cove', 'Public Landmark'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`btn ${category === cat ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            {cat || 'All Categories'}
          </button>
        ))}
      </div>

      {places?.length ? (
        <div className="trip-grid">
          {places.map((p) => {
            const hasCoords = p.latitude != null && p.longitude != null
            const mapUrl = hasCoords
              ? `https://www.google.com/maps/search/?api=1&query=${p.latitude},${p.longitude}`
              : null

            return (
              <Card key={p.id} hover className="travel-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Badge variant="primary">{p.category || 'Point of Interest'}</Badge>
                  {hasCoords && (
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Navigation size={12} /> {Number(p.latitude).toFixed(3)}, {Number(p.longitude).toFixed(3)}
                    </span>
                  )}
                </div>

                <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', color: '#0f172a' }}>
                  {p.name}
                </h3>

                <p style={{ margin: '0 0 16px', fontSize: '0.88rem', color: '#64748b', flex: 1 }}>
                  {p.address}
                </p>

                {mapUrl && (
                  <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <MapPin size={14} /> Open in Maps <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={MapPin}
          title="No nearby places recorded"
          description="Try selecting a different category filter or browse other destinations."
        />
      )}
    </div>
  )
}

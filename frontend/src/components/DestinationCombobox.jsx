import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  Search,
  MapPin,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Compass,
  Check,
  PlusCircle,
  Calendar,
  Layers
} from 'lucide-react'

const TOP_STATES = [
  'All',
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
  'Delhi',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Gujarat',
  'West Bengal',
  'Odisha',
  'North-East',
  'Islands'
]

export default function DestinationCombobox({
  destinations = [],
  selectedDestination,
  onSelect,
  onClear,
  label = 'Select Indian Destination',
  required = false,
  error = ''
}) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [showAll, setShowAll] = useState(false)
  const [stateFilter, setStateFilter] = useState('All')

  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  // Sync query text with selected destination when selected changes
  useEffect(() => {
    if (selectedDestination) {
      const statePart = selectedDestination.state ? `, ${selectedDestination.state}` : ''
      const customTag = selectedDestination.isCustom ? ' (Custom Destination)' : ''
      setQuery(`${selectedDestination.city}${statePart}${customTag}`)
    } else {
      setQuery('')
    }
  }, [selectedDestination])

  // Filter destinations based on query and/or state filter
  const filteredDestinations = useMemo(() => {
    const q = query.trim().toLowerCase()

    // If query matches current selected destination's formatted label, don't restrict full browsing
    const isSelectedLabel = selectedDestination &&
      query.trim().toLowerCase() === `${selectedDestination.city}, ${selectedDestination.state || ''}`.toLowerCase()

    let list = destinations

    // Apply state filter if in browse-all mode
    if (stateFilter !== 'All') {
      if (stateFilter === 'North-East') {
        const neStates = ['Sikkim', 'Meghalaya', 'Assam', 'Arunachal Pradesh', 'Nagaland', 'Manipur', 'Mizoram', 'Tripura']
        list = list.filter((d) => neStates.includes(d.state))
      } else if (stateFilter === 'Islands') {
        const islandStates = ['Andaman & Nicobar', 'Lakshadweep']
        list = list.filter((d) => islandStates.includes(d.state))
      } else {
        list = list.filter((d) => d.state && d.state.toLowerCase() === stateFilter.toLowerCase())
      }
    }

    if (!q || isSelectedLabel) {
      return list
    }

    // Rank matching:
    // 1. City starts with query
    // 2. State starts with query
    // 3. City contains query
    // 4. State contains query
    return list
      .filter((d) => {
        const cityMatch = d.city && d.city.toLowerCase().includes(q)
        const stateMatch = d.state && d.state.toLowerCase().includes(q)
        return cityMatch || stateMatch
      })
      .sort((a, b) => {
        const aCityStart = a.city && a.city.toLowerCase().startsWith(q)
        const bCityStart = b.city && b.city.toLowerCase().startsWith(q)
        if (aCityStart && !bCityStart) return -1
        if (!aCityStart && bCityStart) return 1

        const aStateStart = a.state && a.state.toLowerCase().startsWith(q)
        const bStateStart = b.state && b.state.toLowerCase().startsWith(q)
        if (aStateStart && !bStateStart) return -1
        if (!aStateStart && bStateStart) return 1

        return (a.city || '').localeCompare(b.city || '')
      })
  }, [destinations, query, selectedDestination, stateFilter])

  // Visible items limit: show top 12 unless browseAll is active
  const visibleDestinations = useMemo(() => {
    if (showAll) return filteredDestinations
    return filteredDestinations.slice(0, 14)
  }, [filteredDestinations, showAll])

  // Determine whether to display the custom destination option
  const trimmedQuery = query.trim()
  const customQueryCandidate = useMemo(() => {
    if (!trimmedQuery) return null

    // Don't show custom prompt if it matches current selection
    if (selectedDestination && trimmedQuery.toLowerCase() === selectedDestination.city.toLowerCase()) {
      return null
    }

    // Check if query matches an existing city exactly
    const exactMatch = destinations.find(
      (d) => d.city.toLowerCase() === trimmedQuery.toLowerCase()
    )
    if (exactMatch) return null

    // Clean up if user typed "City, State"
    const parts = trimmedQuery.split(',').map((p) => p.trim())
    const city = parts[0]
    const state = parts.length > 1 ? parts.slice(1).join(', ') : 'India'

    return { city, state }
  }, [trimmedQuery, selectedDestination, destinations])

  // Total selectable items count (visibleDestinations + optional custom option)
  const totalSelectableCount = visibleDestinations.length + (customQueryCandidate ? 1 : 0)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setShowAll(false)
        // If query was typed but nothing selected, restore selection or clear
        if (selectedDestination) {
          const statePart = selectedDestination.state ? `, ${selectedDestination.state}` : ''
          const customTag = selectedDestination.isCustom ? ' (Custom Destination)' : ''
          setQuery(`${selectedDestination.city}${statePart}${customTag}`)
        } else {
          setQuery('')
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selectedDestination])

  // Scroll active item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${highlightedIndex}"]`)
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightedIndex])

  const handleInputChange = (e) => {
    setQuery(e.target.value)
    setIsOpen(true)
    setHighlightedIndex(0)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
    if (selectedDestination) {
      // Temporarily select query text for quick replacement
      inputRef.current?.select()
    }
  }

  const handleSelectPredefined = (dest) => {
    onSelect(dest)
    setIsOpen(false)
    setShowAll(false)
  }

  const handleSelectCustom = () => {
    if (!customQueryCandidate) return
    const customDest = {
      id: 'custom',
      city: customQueryCandidate.city,
      state: customQueryCandidate.state !== 'India' ? customQueryCandidate.state : 'India',
      country: 'India',
      isCustom: true
    }
    onSelect(customDest)
    setIsOpen(false)
    setShowAll(false)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    setQuery('')
    onClear()
    setIsOpen(true)
    setHighlightedIndex(-1)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
        e.preventDefault()
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev + 1) % totalSelectableCount)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev - 1 + totalSelectableCount) % totalSelectableCount)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && highlightedIndex < visibleDestinations.length) {
        handleSelectPredefined(visibleDestinations[highlightedIndex])
      } else if (highlightedIndex === visibleDestinations.length && customQueryCandidate) {
        handleSelectCustom()
      } else if (customQueryCandidate && visibleDestinations.length === 0) {
        handleSelectCustom()
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setShowAll(false)
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', marginBottom: 18 }}>
      {label && (
        <label
          htmlFor="destination-search-input"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 6,
            fontSize: '0.88rem',
            fontWeight: 600,
            color: '#1e293b'
          }}
        >
          <span>
            {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
          </span>
          <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 500 }}>
            {destinations.length}+ Indian Destinations Available
          </span>
        </label>
      )}

      {/* Input container */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: '#ffffff',
          border: error ? '2px solid #ef4444' : isOpen ? '2px solid #ff5722' : '1px solid #cbd5e1',
          borderRadius: 8,
          boxShadow: isOpen ? '0 0 0 3px rgba(255, 87, 34, 0.15)' : '0 1px 2px rgba(0,0,0,0.05)',
          transition: 'all 0.15s ease'
        }}
      >
        <div style={{ paddingLeft: 12, display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
          {selectedDestination ? (
            <MapPin size={18} color="#ff5722" />
          ) : (
            <Search size={18} color="#94a3b8" />
          )}
        </div>

        <input
          id="destination-search-input"
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder="Type to search (e.g. Araku, Kerala, Telangana, Munnar) or enter custom destination..."
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            padding: '11px 10px',
            fontSize: '0.94rem',
            color: '#0f172a',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontWeight: selectedDestination ? 600 : 400
          }}
        />

        {/* Clear button */}
        {(query || selectedDestination) && (
          <button
            type="button"
            id="clear-destination-btn"
            onClick={handleClear}
            title="Clear destination"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 8px',
              display: 'flex',
              alignItems: 'center',
              color: '#94a3b8',
              borderRadius: 4
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            <X size={16} />
          </button>
        )}

        {/* Dropdown toggle button */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen)
            if (!isOpen) inputRef.current?.focus()
          }}
          tabIndex={-1}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            color: '#64748b'
          }}
        >
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {error && (
        <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>
          {error}
        </div>
      )}

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 60,
            background: '#ffffff',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.18), 0 4px 10px -2px rgba(15, 23, 42, 0.08)',
            maxHeight: 420,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Top helper header */}
          <div
            style={{
              padding: '8px 12px',
              background: '#f8fafc',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              color: '#475569'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Compass size={14} color="#ff5722" />
              <span>
                {filteredDestinations.length} matches found across India
              </span>
            </div>

            <button
              type="button"
              id="browse-all-destinations-toggle"
              onClick={() => setShowAll(!showAll)}
              style={{
                background: showAll ? '#ff5722' : '#ffffff',
                color: showAll ? '#ffffff' : '#ff5722',
                border: '1px solid #ff5722',
                borderRadius: 4,
                padding: '3px 8px',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {showAll ? 'Show Top Suggestions' : `Browse All (${destinations.length})`}
            </button>
          </div>

          {/* State filter quick pills when browsing all */}
          {showAll && (
            <div
              style={{
                display: 'flex',
                gap: 6,
                padding: '6px 10px',
                background: '#f1f5f9',
                borderBottom: '1px solid #e2e8f0',
                overflowX: 'auto',
                whiteSpace: 'nowrap'
              }}
            >
              {TOP_STATES.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStateFilter(st)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 12,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: stateFilter === st ? '#1e293b' : '#ffffff',
                    color: stateFilter === st ? '#ffffff' : '#475569',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          )}

          {/* List items */}
          <div ref={listRef} style={{ overflowY: 'auto', flex: 1, maxHeight: 310 }}>
            {/* Custom Destination Option at Top if user typed something custom */}
            {customQueryCandidate && (
              <div
                data-index={visibleDestinations.length}
                onClick={handleSelectCustom}
                onMouseEnter={() => setHighlightedIndex(visibleDestinations.length)}
                style={{
                  padding: '10px 14px',
                  borderBottom: '1px dashed #fdba74',
                  background:
                    highlightedIndex === visibleDestinations.length
                      ? '#fff7ed'
                      : '#fffbeb',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'background 0.12s ease'
                }}
              >
                <div
                  style={{
                    background: '#ff5722',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <PlusCircle size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#c2410c' }}>
                    Use "{customQueryCandidate.city}"
                    {customQueryCandidate.state !== 'India' ? `, ${customQueryCandidate.state}` : ''}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#9a3412' }}>
                    Custom Indian destination • AI will tailor an authentic itinerary for this location
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    background: '#fed7aa',
                    color: '#7c2d12',
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontWeight: 600
                  }}
                >
                  Enter Custom
                </span>
              </div>
            )}

            {/* Predefined Destination Items */}
            {visibleDestinations.map((d, index) => {
              const isSelected = selectedDestination && String(selectedDestination.id) === String(d.id)
              const isHighlighted = highlightedIndex === index

              return (
                <div
                  key={d.id || `${d.city}-${index}`}
                  data-index={index}
                  onClick={() => handleSelectPredefined(d)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid #f8fafc',
                    cursor: 'pointer',
                    background: isHighlighted
                      ? '#f8fafc'
                      : isSelected
                      ? '#fff7ed'
                      : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    transition: 'background 0.1s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <MapPin
                      size={17}
                      color={isSelected ? '#ff5722' : '#94a3b8'}
                      style={{ flexShrink: 0 }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: '0.91rem',
                          fontWeight: 600,
                          color: isSelected ? '#ff5722' : '#0f172a'
                        }}
                      >
                        {d.city}
                        <span style={{ color: '#64748b', fontWeight: 500 }}>
                          , {d.state || 'India'}
                        </span>
                      </div>
                      {d.bestSeason && (
                        <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                          <Calendar size={11} color="#94a3b8" />
                          <span>Best season: {d.bestSeason}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: '#f1f5f9',
                        color: '#475569',
                        padding: '2px 8px',
                        borderRadius: 10
                      }}
                    >
                      {d.state || 'India'}
                    </span>
                    {isSelected && <Check size={16} color="#ff5722" />}
                  </div>
                </div>
              )
            })}

            {/* Empty state when no predefined destinations matched */}
            {visibleDestinations.length === 0 && !customQueryCandidate && (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b' }}>
                <MapPin size={28} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#334155' }}>
                  No destinations match "{query}"
                </div>
                <div style={{ fontSize: '0.8rem', marginTop: 4 }}>
                  Type any city, town, or hill station name to plan a custom trip.
                </div>
              </div>
            )}
          </div>

          {/* Footer indication */}
          {!showAll && filteredDestinations.length > visibleDestinations.length && (
            <div
              style={{
                padding: '8px 12px',
                background: '#f8fafc',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: '#64748b'
              }}
            >
              <span>
                Showing top {visibleDestinations.length} of {filteredDestinations.length} matches
              </span>
              <button
                type="button"
                onClick={() => setShowAll(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ff5722',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                View all &rarr;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

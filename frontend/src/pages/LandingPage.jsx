import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plane,
  Sparkles,
  Compass,
  Globe2,
  Calendar,
  Wallet,
  Users2,
  CheckSquare,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Heart,
  Mountain,
  Palmtree,
  Landmark,
  Waves,
  TreePine,
  Utensils,
  Camera,
  Film,
  CheckCircle2,
  Ticket
} from 'lucide-react'
import { Button, Card, Badge } from '../components/ui'

const popularIndianDestinations = [
  {
    city: 'Munnar & Alappuzha',
    state: 'Kerala',
    season: 'Sep - Mar',
    budget: '₹24,000',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    tag: 'Backwaters & Tea Hills'
  },
  {
    city: 'Jaipur & Udaipur',
    state: 'Rajasthan',
    season: 'Oct - Mar',
    budget: '₹32,000',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    tag: 'Royal Forts & Palaces'
  },
  {
    city: 'Manali & Solang Valley',
    state: 'Himachal Pradesh',
    season: 'Oct - Jun',
    budget: '₹22,000',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    tag: 'Himalayan Escapes'
  },
  {
    city: 'Palolem & Old Goa',
    state: 'Goa',
    season: 'Nov - Feb',
    budget: '₹18,500',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    tag: 'Beaches & Heritage'
  },
  {
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    season: 'Oct - Mar',
    budget: '₹14,000',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
    tag: 'Spiritual Ghats & Aarti'
  },
  {
    city: 'Leh & Pangong Tso',
    state: 'Ladakh',
    season: 'May - Sep',
    budget: '₹48,000',
    image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80',
    tag: 'High Altitude Pass'
  }
]

const indianRegions = [
  { id: 'all', label: 'All of India', count: '100+ destinations' },
  { id: 'south', label: 'South India', count: 'Kerala, Tamil Nadu, Karnataka, Telangana, AP' },
  { id: 'north', label: 'North India', count: 'Himachal, Uttarakhand, J&K, Ladakh, Punjab, UP' },
  { id: 'west', label: 'West India', count: 'Rajasthan, Goa, Maharashtra, Gujarat' },
  { id: 'east', label: 'East & Central', count: 'West Bengal, Odisha, MP, Bihar' },
  { id: 'northeast', label: 'North-East', count: 'Sikkim, Meghalaya, Assam, Arunachal' },
  { id: 'islands', label: 'Islands & UTs', count: 'Andaman & Nicobar, Lakshadweep, Puducherry' }
]

const travelExperiences = [
  {
    icon: Mountain,
    title: 'Himalayan & Hill Stations',
    desc: 'Misty pine trails in Ooty, Shimla, Munnar, Kodaikanal, and Darjeeling.',
    color: '#0284c7',
    bg: '#e0f2fe'
  },
  {
    icon: Landmark,
    title: 'Temples & Pilgrimages',
    desc: 'Varanasi ghats, Tirupati Balaji, Rameswaram, Golden Temple, and Madurai Meenakshi.',
    color: '#ea580c',
    bg: '#fff7ed'
  },
  {
    icon: Palmtree,
    title: 'Pristine Beaches & Coasts',
    desc: 'Golden sands of Goa, Gokarna, Varkala cliffside, and Havelock Island Radhanagar.',
    color: '#059669',
    bg: '#ecfdf5'
  },
  {
    icon: ShieldCheck,
    title: 'Forts, Palaces & Heritage',
    desc: 'Architectural grandeur of Jaipur, Hampi ruins, Khajuraho temples, and Agra Taj Mahal.',
    color: '#d97706',
    bg: '#fef3c7'
  },
  {
    icon: TreePine,
    title: 'Wildlife & National Parks',
    desc: 'Tiger reserves in Jim Corbett, Ranthambore, Kaziranga rhinos, and Periyar elephant trails.',
    color: '#16a34a',
    bg: '#f0fdf4'
  },
  {
    icon: Waves,
    title: 'Waterfalls & Backwaters',
    desc: 'Tranquil Kerala houseboats, Dudhsagar cascades, Athirappilly, and Jog Falls.',
    color: '#0891b2',
    bg: '#ecfeff'
  },
  {
    icon: Utensils,
    title: 'Regional Cuisines & Food',
    desc: 'Hyderabadi biryani, Lucknowi kebabs, Kerala sadhya, and Rajasthani dal baati churma.',
    color: '#dc2626',
    bg: '#fef2f2'
  },
  {
    icon: Film,
    title: 'Post-Trip Photo & Video Journals',
    desc: 'Record vibrant memories, upload travel clips, and share authentic travel stories.',
    color: '#9333ea',
    bg: '#faf5ff'
  }
]

export default function LandingPage() {
  const [activeRegion, setActiveRegion] = useState('all')

  return (
    <div style={{ background: '#f8fafc' }}>
      {/* Navigation Bar */}
      <header className="landing-header">
        <div className="landing-nav-container">
          <Link to="/" className="brand">
            <div className="brand-icon">
              <Plane size={18} />
            </div>
            <span>TripMate <i>AI</i></span>
          </Link>

          <nav className="landing-nav-links" style={{ display: window.innerWidth <= 768 ? 'none' : 'flex' }}>
            <Link to="/destinations" className="landing-nav-link">Explore India</Link>
            <a href="#experiences" className="landing-nav-link">Experiences</a>
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#how-it-works" className="landing-nav-link">How It Works</a>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/login" className="btn btn-secondary btn-sm">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div
          className="landing-hero-backdrop"
          style={{ backgroundImage: `url('/assets/india_travel_hero.jpg')` }}
        />
        <div className="landing-hero-content">
          <div className="hero-badge">
            <Sparkles size={14} /> India's Premier AI Travel Platform
          </div>
          <h1>
            Discover India, <span>One Journey at a Time</span>.
          </h1>
          <p>
            Experience intelligent itinerary planning tailored for India's breathtaking diversity — from Himalayan valleys and serene Kerala backwaters to majestic Rajasthan forts and sacred temple towns.
          </p>

          <div className="hero-cta-group">
            <Link to="/trips/planner" className="btn btn-coral btn-lg">
              <Sparkles size={18} /> Plan Your Trip with AI
            </Link>
            <Link to="/destinations" className="btn btn-secondary btn-lg" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
              <Compass size={18} /> Explore India
            </Link>
          </div>
        </div>
      </section>

      {/* Product Preview Mockup */}
      <section className="landing-preview-section">
        <div className="preview-card">
          <div className="preview-header-bar">
            <div className="preview-dot dot-red" />
            <div className="preview-dot dot-yellow" />
            <div className="preview-dot dot-green" />
            <span style={{ fontSize: '0.82rem', color: '#64748b', marginLeft: 10, fontWeight: 600 }}>
              TripMate AI Workspace — Kerala Backwaters & Munnar (5 Days · 4 Travelers)
            </span>
          </div>
          <div className="preview-body">
            <div className="preview-item-card" style={{ background: '#f8fafc', padding: 18, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="eyebrow"><Sparkles size={12} /> Day 2 AI Itinerary</span>
                <Badge variant="primary">4:30 PM</Badge>
              </div>
              <h4 style={{ margin: '0 0 6px', fontSize: '1rem', color: '#0f172a' }}>Sunset Shikara Cruise & Tea Trail</h4>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
                Scenic paddle cruise through narrow canals, followed by traditional tea tasting and Kathakali performance.
              </p>
              <div style={{ marginTop: 10, fontSize: '0.78rem', color: '#0284c7', fontWeight: 600 }}>
                Est. Cost: ₹650 / person · Auto & boat
              </div>
            </div>

            <div className="preview-item-card" style={{ background: '#f8fafc', padding: 18, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="eyebrow" style={{ color: '#10b981' }}><Wallet size={12} /> INR Budget Tracker</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981' }}>₹28,500 / ₹45,000</span>
              </div>
              <div style={{ height: 8, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden', margin: '8px 0' }}>
                <div style={{ width: '63%', height: '100%', background: '#10b981', borderRadius: 99 }} />
              </div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
                Healthy pacing: ₹16,500 remaining for sightseeing, stays, and authentic Malabar dinners.
              </p>
            </div>

            <div className="preview-item-card" style={{ background: '#f8fafc', padding: 18, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="eyebrow" style={{ color: '#ea580c' }}><Users2 size={12} /> Indian Group Split</span>
                <Badge variant="coral">UPI Ready</Badge>
              </div>
              <h4 style={{ margin: '0 0 6px', fontSize: '1rem', color: '#0f172a' }}>Alleppey Houseboat & Sadhya</h4>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
                Priya paid ₹14,000 · Shared equally among 4 travelers (₹3,500 each). Zero friction.
              </p>
              <div style={{ marginTop: 10, fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>
                All balances calculated automatically
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore by State and Union Territory */}
      <section style={{ maxWidth: 1200, margin: '60px auto 40px', padding: '0 24px' }}>
        <div className="section-title-center">
          <span className="eyebrow eyebrow-coral">
            <Compass size={14} /> Regional Catalog
          </span>
          <h2>Explore India by Region & State</h2>
          <p>
            Discover curated travel hubs across 28 states and 8 union territories, each with authentic seasonal guides and INR budgets.
          </p>
        </div>

        <div className="region-pills-bar">
          {indianRegions.map((region) => (
            <button
              key={region.id}
              className={`region-pill ${activeRegion === region.id ? 'active' : ''}`}
              onClick={() => setActiveRegion(region.id)}
            >
              {region.label}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Indian Destinations */}
      <section id="destinations" style={{ background: '#ffffff', padding: '70px 24px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span className="eyebrow"><Globe2 size={14} /> Curated Indian Journeys</span>
              <h2 style={{ fontSize: '2.1rem', fontWeight: 850, margin: '6px 0 0', color: '#0f172a' }}>
                Popular Indian Destinations
              </h2>
            </div>
            <Link to="/destinations" className="btn btn-secondary">
              Browse 100+ Destinations <ArrowRight size={16} />
            </Link>
          </div>

          <div className="destination-grid">
            {popularIndianDestinations.map((d) => (
              <Card key={d.city} hover className="travel-card">
                <img src={d.image} alt={d.city} className="destination-card-img" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Badge variant="primary">{d.tag}</Badge>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{d.season}</span>
                </div>
                <h3 style={{ margin: '4px 0 2px', fontSize: '1.25rem', color: '#0f172a' }}>{d.city}</h3>
                <p style={{ margin: '0 0 12px', fontSize: '0.88rem', color: '#64748b' }}>
                  <MapPin size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  {d.state}, India
                </p>
                <div className="destination-card-meta">
                  <div>
                    <small style={{ display: 'block', color: '#94a3b8', fontSize: '0.72rem' }}>Indicative Budget</small>
                    <span style={{ fontWeight: 700, color: '#0369a1', fontSize: '1.05rem' }}>{d.budget}</span>
                  </div>
                  <Link to={`/trips/planner`} className="btn btn-primary btn-sm">
                    Plan Trip
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Experiences Section */}
      <section id="experiences" style={{ maxWidth: 1200, margin: '80px auto', padding: '0 24px' }}>
        <div className="section-title-center">
          <span className="eyebrow eyebrow-coral">
            <Sparkles size={14} /> Diverse Landscapes
          </span>
          <h2>Travel Experiences Crafted for India</h2>
          <p>
            Whether seeking spiritual solace along ancient riverfronts, high-altitude trekking, or sunny coastline bliss, TripMate AI crafts every moment.
          </p>
        </div>

        <div className="experience-grid">
          {travelExperiences.map((exp, idx) => {
            const Icon = exp.icon
            return (
              <Link to="/destinations" key={idx} className="experience-card">
                <div className="experience-icon-box" style={{ background: exp.bg, color: exp.color }}>
                  <Icon size={24} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{exp.title}</h3>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5 }}>
                  {exp.desc}
                </p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="features-section">
        <div className="section-title-center">
          <span className="eyebrow eyebrow-coral">
            <Compass size={14} /> Full-Stack Indian Travel Suite
          </span>
          <h2>Everything You Need for Seamless Indian Travel</h2>
          <p>
            No more disorganized WhatsApp notes, lost IRCTC PNRs, or awkward bill splits. One modern platform built for travelers across India.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <Sparkles size={24} />
            </div>
            <h3>AI Itinerary Generator</h3>
            <p>
              Receive structured day-by-day schedules optimized with Indian travel times, temple aarti slots, rest buffers, and auto/cab suggestions.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: '#ecfdf5', color: '#059669' }}>
              <Wallet size={24} />
            </div>
            <h3>INR Budget Planning</h3>
            <p>
              Manage total and daily budgets in Indian Rupees (₹) with real category breakdowns across transport, homestays, meals, and tickets.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: '#fff7ed', color: '#ea580c' }}>
              <Users2 size={24} />
            </div>
            <h3>Group Expense Splitting</h3>
            <p>
              Split train tickets, meals, and cab fares effortlessly among friends or family with equal calculations and member balances.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
              <CheckSquare size={24} />
            </div>
            <h3>Climate-Aware Packing Lists</h3>
            <p>
              Smart packing checklists for Indian conditions: monsoon umbrellas, hill station fleece, temple modest attire, and summer hydration.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Ticket size={24} />
            </div>
            <h3>Bookings & Reservation Hub</h3>
            <p>
              Organize IRCTC train reservations, flights, hotel and homestay confirmations, and monument e-passes in a single clean timeline.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: '#faf5ff', color: '#9333ea' }}>
              <Film size={24} />
            </div>
            <h3>Travel Journal & Media Gallery</h3>
            <p>
              Capture post-journey reflections, upload high-resolution travel photos, and play short vacation video clips in an interactive gallery.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="section-title-center">
          <span className="eyebrow eyebrow-coral">Effortless Journey</span>
          <h2>How TripMate AI Powers Your Indian Tour</h2>
          <p>From initial inspiration to post-journey photo journals in three simple steps.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          <div style={{ background: '#ffffff', padding: 30, borderRadius: 16, border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'grid', placeItems: 'center', margin: '0 auto 16px', fontWeight: 800 }}>
              1
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '0 0 8px' }}>Select Destination & Style</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
              Choose an Indian city or route, dates, traveler count, INR budget, and style (Pilgrimage, Hill Station, Heritage, Beach, Wildlife).
            </p>
          </div>

          <div style={{ background: '#ffffff', padding: 30, borderRadius: 16, border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#ea580c', color: '#fff', display: 'grid', placeItems: 'center', margin: '0 auto 16px', fontWeight: 800 }}>
              2
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '0 0 8px' }}>AI Generates Smart Schedule</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
              Get realistic morning, afternoon, and evening plans with estimated INR costs, local transport tips, and dining gems.
            </p>
          </div>

          <div style={{ background: '#ffffff', padding: 30, borderRadius: 16, border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#059669', color: '#fff', display: 'grid', placeItems: 'center', margin: '0 auto 16px', fontWeight: 800 }}>
              3
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '0 0 8px' }}>Track, Split & Capture</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
              Track daily expenses, split bills with travel buddies, check off packing items, and log post-trip photos and videos.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '0 24px 80px' }}>
        <div className="landing-cta-banner">
          <h2>Ready to Explore India with AI?</h2>
          <p>
            Create your personalized Indian itinerary in seconds. Manage budgets in rupees, coordinate with friends, and preserve unforgettable memories.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-coral btn-lg">
              Start Planning Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg" style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="brand brand-dark">
              <div className="brand-icon">
                <Plane size={18} />
              </div>
              <span>TripMate <i>AI</i></span>
            </div>
            <p>
              An India-first AI travel companion crafted for exploring the sublime beauty, heritage, and flavors across every state and union territory.
            </p>
          </div>

          <div className="footer-col">
            <h4>Explore India</h4>
            <div className="footer-links">
              <Link to="/destinations">All Destinations</Link>
              <Link to="/hotels">Hotels & Homestays</Link>
              <Link to="/restaurants">Authentic Dining</Link>
              <Link to="/attractions">Heritage & Attractions</Link>
            </div>
          </div>

          <div className="footer-col">
            <h4>Workspace</h4>
            <div className="footer-links">
              <Link to="/trips/planner">AI Trip Planner</Link>
              <Link to="/trips">My Journeys</Link>
              <Link to="/dashboard">Travel Dashboard</Link>
              <Link to="/chat">AI Travel Assistant</Link>
            </div>
          </div>

          <div className="footer-col">
            <h4>Architecture</h4>
            <div className="footer-links">
              <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Java 21 & Spring Boot 3.4.8</span>
              <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>React & Vite with Motion</span>
              <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>MySQL 8.4 Database</span>
              <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Secure JWT & BCrypt Auth</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} TripMate AI — Discover India. All rights reserved.</span>
          <span>Crafted with Indian travel diversity at its core.</span>
        </div>
      </footer>
    </div>
  )
}

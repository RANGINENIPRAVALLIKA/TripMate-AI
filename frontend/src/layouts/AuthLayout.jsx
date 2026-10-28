import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Plane, Compass, Sparkles, ShieldCheck } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="auth-page-container">
      {/* Visual Left Side */}
      <section className="auth-visual-side" aria-label="TripMate AI Travel Showcase">
        <div>
          <Link to="/" className="brand brand-dark">
            <div className="brand-icon">
              <Plane size={18} />
            </div>
            <span>TripMate <i>AI</i></span>
          </Link>
        </div>

        <div className="auth-visual-content">
          <span className="eyebrow eyebrow-coral">
            <Sparkles size={14} /> Next-Gen Travel Planning
          </span>
          <h1>Turn the world into your next adventure.</h1>
          <p>
            Experience AI-driven day-by-day itineraries, intelligent expense splitting, synchronized packing checklists, and comprehensive booking management in one unified workspace.
          </p>

          <div style={{ display: 'flex', gap: 20, marginTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: '#93c5fd' }}>
              <Compass size={18} /> Smart Routing
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: '#93c5fd' }}>
              <ShieldCheck size={18} /> Bank-Grade Auth
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: '#93c5fd' }}>
              <Sparkles size={18} /> Curated Insights
            </div>
          </div>
        </div>

        <div className="auth-quote-card">
          <p>
            "TripMate AI turned our chaotic multi-city European trip into a stress-free masterpiece. From dinner spots to expense splitting, everything was effortless."
          </p>
          <div className="auth-quote-author">— Travel Enthusiast Community Review</div>
        </div>
      </section>

      {/* Form Right Side */}
      <section className="auth-form-side">
        <div className="auth-card-wrapper">
          <Outlet />
        </div>
      </section>
    </div>
  )
}

export default AuthLayout

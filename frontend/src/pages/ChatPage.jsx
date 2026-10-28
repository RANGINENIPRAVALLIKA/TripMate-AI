import React, { useEffect, useRef, useState } from 'react'
import { chatService } from '../services/chatService'
import { tripService } from '../services/tripService'
import {
  Button,
  Card,
  EmptyState,
  ErrorMessage,
  LoadingState,
  PageHeader,
  Select
} from '../components/ui'
import { apiError } from '../api/client'
import { Bot, User, Send, Sparkles, MessageSquare } from 'lucide-react'

const suggestionChips = [
  'What are must-visit experiences in Kerala?',
  'Best 3-day itinerary for Jaipur and Udaipur?',
  'What should I pack for temple visits in Varanasi?',
  'How to plan a budget-friendly trip under ₹25,000 in India?',
  'Local food & street food recommendations in Hyderabad?'
]

export default function ChatPage() {
  const [trips, setTrips] = useState([])
  const [tripId, setTripId] = useState('')
  const [messages, setMessages] = useState(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState('')
  const endRef = useRef()

  const load = async () => {
    try {
      setMessages(null)
      const history = await chatService.history(tripId || null)
      setMessages(history || [])
    } catch (e) {
      setErr(apiError(e))
    }
  }

  useEffect(() => {
    tripService
      .list()
      .then((x) => setTrips(x.content || []))
      .catch((e) => setErr(apiError(e)))
  }, [])

  useEffect(() => {
    load()
  }, [tripId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const send = async (textToSend) => {
    const text = (textToSend || message).trim()
    if (!text || sending) return
    setMessage('')
    setSending(true)
    setErr('')
    try {
      const answer = await chatService.send({
        message: text,
        tripId: tripId ? Number(tripId) : null
      })
      setMessages((current) => [...(current || []), answer])
    } catch (x) {
      setMessage(text)
      setErr(apiError(x))
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="AI Travel Co-Pilot"
        title="AI Chat Assistant"
        description="Ask for destination advice, packing essentials, itinerary optimization, or local culinary secrets."
      />

      <ErrorMessage>{err}</ErrorMessage>

      {/* Trip Context Filter */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ maxWidth: 450 }}>
          <Select
            label="Trip Context (Optional)"
            value={tripId}
            onChange={(e) => setTripId(e.target.value)}
          >
            <option value="">General Travel Guidance</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.tripName} ({t.destination})
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Chat Window */}
      <div className="chat-container">
        <div className="chat-messages">
          {!messages && <LoadingState message="Loading chat history…" />}

          {messages?.length === 0 && (
            <div style={{ margin: 'auto', textAlign: 'center', maxWidth: 480 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#e0edff',
                  color: '#2563eb',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <Bot size={28} />
              </div>
              <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>TripMate AI Travel Co-Pilot</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 20px' }}>
                Ask any travel question or pick a suggested topic below to get started.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {suggestionChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => send(chip)}
                    className="btn btn-secondary btn-sm"
                    style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                  >
                    <Sparkles size={14} color="#2563eb" /> {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages?.map((m, idx) => (
            <React.Fragment key={m.id || idx}>
              {/* User Bubble */}
              <div className="chat-bubble chat-bubble-user">
                {m.message}
              </div>

              {/* AI Bubble */}
              <div className="chat-bubble chat-bubble-ai">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: '0.78rem', color: '#2563eb', fontWeight: 700 }}>
                  <Bot size={14} /> TripMate AI
                </div>
                {m.response}
              </div>
            </React.Fragment>
          ))}

          {sending && (
            <div className="chat-bubble chat-bubble-ai">
              <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                TripMate AI is formulating guidance…
              </span>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input Bar */}
        <form
          className="chat-input-bar"
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
        >
          <input
            type="text"
            className="input-control"
            placeholder="Type your travel inquiry… (Press Enter to send)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
          />
          <Button type="submit" variant="primary" loading={sending} icon={Send}>
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}

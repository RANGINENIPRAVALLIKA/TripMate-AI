import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { packingService } from '../services/packingService'
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorMessage,
  Input,
  LoadingState,
  Modal,
  PageHeader,
  SuccessMessage
} from '../components/ui'
import { apiError } from '../api/client'
import {
  ArrowLeft,
  CheckSquare,
  CheckCircle2,
  Circle,
  Plus,
  Sparkles,
  Trash2,
  Edit2,
  PackageCheck,
  Tag
} from 'lucide-react'

const INDIAN_PACKING_PRESETS = [
  { label: 'Temple & Pilgrimage', prompt: 'Temple & spiritual pilgrimage, modest attire, slip-on shoes, prayer shawl' },
  { label: 'Hill Station & Mountains', prompt: 'Himalayan hill station, warm layers, fleece jacket, trekking shoes' },
  { label: 'Monsoon Travel', prompt: 'Monsoon travel, waterproof jacket, quick-dry clothes, umbrella, mosquito repellent' },
  { label: 'Beaches & Coastal', prompt: 'Goa coastal beaches, light cottons, sunscreen, flip-flops, sunglasses' },
  { label: 'Weekend Getaway', prompt: 'Weekend trip, carry-on only, essentials, casual kurtas, power bank' },
  { label: 'Wildlife Safari', prompt: 'Jungle safari, neutral earth tones, binoculars, insect repellent, sun hat' },
  { label: 'Family Travel', prompt: 'Family vacation with children, snacks, first aid kit, spare clothing' }
]

export default function PackingPage() {
  const { tripId } = useParams()
  const [list, setList] = useState(null)
  const [modalItem, setModalItem] = useState(null) // null = closed, {} = add new, item = edit
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [preferences, setPreferences] = useState('')
  const [activeCategory, setActiveCategory] = useState('ALL')

  // Form state
  const [formData, setFormData] = useState({ name: '', quantity: 1, category: 'General' })

  const load = () => {
    packingService
      .get(tripId)
      .then(setList)
      .catch((e) => setError(apiError(e)))
  }

  useEffect(() => {
    load()
  }, [tripId])

  const openAddModal = () => {
    setFormData({ name: '', quantity: 1, category: 'General' })
    setModalItem({})
  }

  const openEditModal = (item) => {
    setFormData({ name: item.name, quantity: item.quantity, category: item.category || 'General' })
    setModalItem(item)
  }

  const closeModal = () => {
    setModalItem(null)
  }

  const handleSaveItem = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        name: formData.name.trim(),
        quantity: Number(formData.quantity) || 1,
        category: formData.category.trim() || 'General'
      }

      if (modalItem.id) {
        await packingService.update(tripId, modalItem.id, payload)
        setNotice('Item updated.')
      } else {
        await packingService.add(tripId, payload)
        setNotice('Item added to packing list.')
      }
      closeModal()
      load()
    } catch (err) {
      setError(apiError(err))
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateAi = async () => {
    setGenerating(true)
    setError('')
    try {
      await packingService.generate(tripId, preferences.trim() || null)
      setNotice('AI packing recommendations added successfully!')
      setPreferences('')
      load()
    } catch (err) {
      setError(apiError(err))
    } finally {
      setGenerating(false)
    }
  }

  const handleToggle = async (item) => {
    try {
      await packingService.toggle(tripId, item.id)
      load()
    } catch (err) {
      setError(apiError(err))
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    try {
      await packingService.remove(tripId, confirmDelete.id)
      setConfirmDelete(null)
      setNotice('Item deleted.')
      load()
    } catch (err) {
      setError(apiError(err))
    }
  }

  if (!list && !error) return <LoadingState message="Loading packing list…" />

  const items = list?.items || []
  const packedCount = items.filter((x) => x.packed).length
  const totalCount = items.length
  const progressPct = totalCount ? Math.round((packedCount / totalCount) * 100) : 0

  // Categories list
  const categories = ['ALL', ...Array.from(new Set(items.map((x) => x.category || 'General')))]
  const filteredItems = activeCategory === 'ALL'
    ? items
    : items.filter((x) => (x.category || 'General') === activeCategory)

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Link to={`/trips/${tripId}`} style={{ fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={16} /> Back to trip workspace
        </Link>
      </div>

      <PageHeader
        eyebrow="Trip Preparation"
        title="Packing Checklist"
        description="Stay organized and make sure nothing essential gets left behind."
        action={
          <Button icon={Plus} onClick={openAddModal}>
            Add Item
          </Button>
        }
      />

      <ErrorMessage>{error}</ErrorMessage>
      {notice && <SuccessMessage>{notice}</SuccessMessage>}

      {/* Progress & AI Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Progress Card */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PackageCheck size={20} color="#1a73e8" />
              <strong style={{ fontSize: '1rem', color: '#0f172a' }}>Packing Progress</strong>
            </div>
            <Badge variant={progressPct === 100 ? 'success' : 'primary'}>
              {packedCount} / {totalCount} Packed ({progressPct}%)
            </Badge>
          </div>

          {/* Visual Progress Bar */}
          <div style={{ width: '100%', height: 10, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPct}%`,
                height: '100%',
                background: progressPct === 100 ? '#10b981' : '#1a73e8',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 8, marginBottom: 0 }}>
            {progressPct === 100
              ? '🎉 All packed! Ready for departure.'
              : `${totalCount - packedCount} items remaining to pack.`}
          </p>
        </Card>

        {/* AI Suggester Card */}
        <Card style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)', border: '1px solid #bfdbfe' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Sparkles size={18} color="#2563eb" />
            <strong style={{ fontSize: '0.98rem', color: '#1e3a8a' }}>AI Packing Assistant</strong>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#475569', margin: '0 0 12px' }}>
            Generate a personalized packing list tailored to your destination climate and travel style.
          </p>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <input
              type="text"
              className="input-control"
              placeholder="e.g. Temple visits, monsoon trek, carry-on only"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              style={{ flex: 1, fontSize: '0.88rem' }}
            />
            <Button
              loading={generating}
              disabled={generating}
              onClick={handleGenerateAi}
              size="sm"
              icon={Sparkles}
            >
              Generate
            </Button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {INDIAN_PACKING_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="btn btn-ghost btn-xs"
                style={{
                  fontSize: '0.75rem',
                  padding: '3px 8px',
                  background: preferences === preset.prompt ? '#dbeafe' : 'rgba(255,255,255,0.8)',
                  border: '1px solid #cbd5e1',
                  borderRadius: 12,
                  color: '#1e3a8a'
                }}
                onClick={() => setPreferences(preset.prompt)}
              >
                + {preset.label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Category Pills Filter */}
      {categories.length > 2 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`pill-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: activeCategory === cat ? '1px solid #1a73e8' : '1px solid #cbd5e1',
                background: activeCategory === cat ? '#eff6ff' : '#ffffff',
                color: activeCategory === cat ? '#1a73e8' : '#475569',
                fontWeight: activeCategory === cat ? 600 : 400,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      )}

      {/* Checklist Items */}
      {filteredItems.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              style={{
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: item.packed ? '#f8fafc' : '#ffffff',
                borderLeft: item.packed ? '4px solid #10b981' : '4px solid #1a73e8'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  cursor: 'pointer',
                  flex: 1
                }}
                onClick={() => handleToggle(item)}
              >
                {item.packed ? (
                  <CheckCircle2 size={22} color="#10b981" />
                ) : (
                  <Circle size={22} color="#94a3b8" />
                )}
                <div>
                  <span
                    style={{
                      fontSize: '0.98rem',
                      fontWeight: 600,
                      color: item.packed ? '#94a3b8' : '#0f172a',
                      textDecoration: item.packed ? 'line-through' : 'none'
                    }}
                  >
                    {item.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <Badge variant="default" size="sm">
                      <Tag size={11} style={{ marginRight: 3 }} /> {item.category || 'General'}
                    </Badge>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Qty: {item.quantity}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className="link-button"
                  style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                  onClick={() => openEditModal(item)}
                  title="Edit item"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  className="link-button danger"
                  style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                  onClick={() => setConfirmDelete(item)}
                  title="Delete item"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CheckSquare}
          title="No packing items found"
          description={
            items.length === 0
              ? 'Your packing list is empty. Add items manually or generate smart suggestions with AI.'
              : 'No items match the selected category filter.'
          }
          action={
            items.length === 0 && (
              <Button icon={Plus} onClick={openAddModal}>
                Add First Item
              </Button>
            )
          }
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={modalItem !== null}
        onClose={closeModal}
        title={modalItem?.id ? 'Edit Packing Item' : 'Add Packing Item'}
      >
        <form onSubmit={handleSaveItem}>
          <Input
            label="Item Name"
            placeholder="e.g. Aadhaar Card, Temple Scarf, Mosquito Repellent, Walking Sandals"
            required
            maxLength={200}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="Quantity"
              type="number"
              min="1"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
            <Input
              label="Category"
              placeholder="e.g. Clothing, Toiletries, Electronics, Documents, Medicine"
              required
              maxLength={100}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          <div className="modal-actions" style={{ marginTop: 20 }}>
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} disabled={saving}>
              {modalItem?.id ? 'Update Item' : 'Add to List'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmDelete !== null}
        title={`Delete "${confirmDelete?.name}"?`}
        description="This will permanently remove this item from your packing checklist."
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

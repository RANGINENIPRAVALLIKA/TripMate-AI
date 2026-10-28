import React, { useEffect, useState, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { journalService } from '../services/journalService'
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorMessage,
  Input,
  LoadingState,
  Modal,
  PageHeader,
  SuccessMessage,
  Textarea,
  Badge
} from '../components/ui'
import { apiError } from '../api/client'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Edit2,
  Eye,
  Plus,
  Trash2,
  Image as ImageIcon,
  Video,
  Upload,
  Film,
  Camera,
  Layers,
  Sparkles,
  ExternalLink,
  X
} from 'lucide-react'

const isVideoUrl = (url) => {
  if (!url) return false
  const clean = url.toLowerCase().split('?')[0]
  return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.includes('/video/')
}

export default function JournalPage() {
  const { tripId } = useParams()
  const [activeTab, setActiveTab] = useState('entries') // 'entries' | 'gallery'
  const [entries, setEntries] = useState(null)
  const [galleryMedia, setGalleryMedia] = useState([])
  const [viewEntry, setViewEntry] = useState(null)
  const [modalEntry, setModalEntry] = useState(null) // null = closed, {} = add, entry = edit
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmDeleteMedia, setConfirmDeleteMedia] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)

  // Media upload state
  const [uploadingEntryId, setUploadingEntryId] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [mediaCaption, setMediaCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState('')
  const fileInputRef = useRef(null)

  // Form fields
  const [formData, setFormData] = useState({
    title: '',
    journalDate: new Date().toISOString().split('T')[0],
    content: ''
  })

  const load = () => {
    journalService
      .list(tripId)
      .then(setEntries)
      .catch((e) => setError(apiError(e)))

    journalService
      .listMedia(tripId)
      .then(setGalleryMedia)
      .catch(() => {})
  }

  useEffect(() => {
    load()
  }, [tripId])

  const openAddModal = () => {
    setFormData({
      title: '',
      journalDate: new Date().toISOString().split('T')[0],
      content: ''
    })
    setModalEntry({})
  }

  const openEditModal = async (entry) => {
    try {
      const detailed = await journalService.get(tripId, entry.id)
      setFormData({
        title: detailed.title || '',
        journalDate: detailed.journalDate || '',
        content: detailed.content || ''
      })
      setModalEntry(detailed)
    } catch (err) {
      setError(apiError(err))
    }
  }

  const openViewModal = async (entry) => {
    try {
      const detailed = await journalService.get(tripId, entry.id)
      setViewEntry(detailed)
    } catch (err) {
      setError(apiError(err))
    }
  }

  const closeModal = () => {
    setModalEntry(null)
  }

  const handleSaveEntry = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        title: formData.title.trim(),
        journalDate: formData.journalDate,
        content: formData.content.trim()
      }

      if (modalEntry.id) {
        await journalService.update(tripId, modalEntry.id, payload)
        setNotice('Journal entry updated.')
      } else {
        await journalService.create(tripId, payload)
        setNotice('Journal entry recorded.')
      }
      closeModal()
      load()
    } catch (err) {
      setError(apiError(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    try {
      await journalService.remove(tripId, confirmDelete.id)
      setConfirmDelete(null)
      setNotice('Journal entry removed.')
      if (viewEntry?.id === confirmDelete.id) setViewEntry(null)
      load()
    } catch (err) {
      setError(apiError(err))
    }
  }

  // --- Media upload handler ---
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    setUploadErr('')
    if (!file) return

    const isVideo = file.type.startsWith('video/')
    const maxBytes = isVideo ? 60 * 1024 * 1024 : 15 * 1024 * 1024
    if (file.size > maxBytes) {
      setUploadErr(isVideo ? 'Video exceeds 60MB limit.' : 'Image exceeds 15MB limit.')
      return
    }
    setSelectedFile(file)
  }

  const handleUploadMedia = async (entryId) => {
    if (!selectedFile) return
    setUploading(true)
    setUploadErr('')
    try {
      const fData = new FormData()
      fData.append('file', selectedFile)
      if (mediaCaption.trim()) {
        fData.append('caption', mediaCaption.trim())
      }

      await journalService.uploadMedia(tripId, entryId, fData)
      setNotice('Memory photo/video uploaded successfully!')
      setSelectedFile(null)
      setMediaCaption('')
      if (fileInputRef.current) fileInputRef.current.value = ''

      // Refresh entry details if view modal open
      if (viewEntry && viewEntry.id === entryId) {
        const refreshed = await journalService.get(tripId, entryId)
        setViewEntry(refreshed)
      }
      load()
    } catch (err) {
      setUploadErr(apiError(err))
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteMedia = async () => {
    if (!confirmDeleteMedia) return
    try {
      await journalService.deleteMedia(tripId, confirmDeleteMedia.entryId, confirmDeleteMedia.photoId)
      setConfirmDeleteMedia(null)
      setNotice('Media file removed.')
      if (viewEntry) {
        const refreshed = await journalService.get(tripId, viewEntry.id)
        setViewEntry(refreshed)
      }
      load()
    } catch (err) {
      setError(apiError(err))
    }
  }

  if (!entries && !error) return <LoadingState message="Loading journal entries & memories…" />

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Link to={`/trips/${tripId}`} style={{ fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={16} /> Back to trip workspace
        </Link>
      </div>

      <PageHeader
        eyebrow="Travel Journal & Memory Vault"
        title="Travel Journal"
        description="Preserve your reflections, stories, high-definition photographs, and video highlights from across India."
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button icon={Plus} onClick={openAddModal}>
              Write Journal Entry
            </Button>
          </div>
        }
      />

      <ErrorMessage>{error}</ErrorMessage>
      {notice && <SuccessMessage>{notice}</SuccessMessage>}

      {/* Mode Switcher Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
        <button
          onClick={() => setActiveTab('entries')}
          className={`btn ${activeTab === 'entries' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <BookOpen size={16} /> Journal Entries ({entries?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`btn ${activeTab === 'gallery' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Camera size={16} /> Trip Memory Gallery ({galleryMedia.length})
        </button>
      </div>

      {/* TAB 1: JOURNAL ENTRIES TIMELINE */}
      {activeTab === 'entries' && (
        <>
          {entries?.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {entries.map((entry) => (
                <Card
                  key={entry.id}
                  hover
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '0.82rem', marginBottom: 8 }}>
                      <Calendar size={14} />
                      <span>{entry.journalDate}</span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', margin: '0 0 10px', color: '#0f172a' }}>
                      {entry.title}
                    </h3>
                    {entry.content && (
                      <p
                        style={{
                          fontSize: '0.9rem',
                          color: '#475569',
                          lineHeight: 1.5,
                          marginBottom: 16,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {entry.content}
                      </p>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: 14,
                      borderTop: '1px solid #f1f5f9'
                    }}
                  >
                    <Button size="sm" variant="secondary" icon={Eye} onClick={() => openViewModal(entry)}>
                      Read & Media
                    </Button>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="link-button"
                        style={{ padding: '6px 8px' }}
                        onClick={() => openEditModal(entry)}
                        title="Edit entry"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="link-button danger"
                        style={{ padding: '6px 8px' }}
                        onClick={() => setConfirmDelete(entry)}
                        title="Delete entry"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No journal entries yet"
              description="Capture your first memory, reflection, temple experience, or travel tale from this trip."
              action={
                <Button icon={Plus} onClick={openAddModal}>
                  Write First Entry
                </Button>
              }
            />
          )}
        </>
      )}

      {/* TAB 2: TRIP MEMORY GALLERY */}
      {activeTab === 'gallery' && (
        <>
          {galleryMedia.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
              {galleryMedia.map((m) => {
                const isVid = isVideoUrl(m.imageUrl)
                return (
                  <Card key={m.id} style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ width: '100%', height: 200, background: '#0f172a', position: 'relative' }}>
                      {isVid ? (
                        <video
                          src={m.imageUrl}
                          controls
                          playsInline
                          preload="metadata"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <img
                          src={m.imageUrl}
                          alt={m.caption || 'Travel memory'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                      <div style={{ position: 'absolute', top: 8, left: 8 }}>
                        <Badge variant={isVid ? 'coral' : 'primary'} size="sm">
                          {isVid ? <><Film size={12} /> Video</> : <><Camera size={12} /> Photo</>}
                        </Badge>
                      </div>
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>
                        {m.caption || 'Travel Memory'}
                      </p>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={Camera}
              title="No photos or videos uploaded yet"
              description="Open any journal entry to upload photographs and travel video clips."
              action={
                <Button icon={Plus} onClick={() => setActiveTab('entries')}>
                  View Journal Entries
                </Button>
              }
            />
          )}
        </>
      )}

      {/* Add / Edit Entry Modal */}
      <Modal
        open={modalEntry !== null}
        onClose={closeModal}
        title={modalEntry?.id ? 'Edit Journal Entry' : 'New Journal Entry'}
        maxWidth="640px"
      >
        <form onSubmit={handleSaveEntry}>
          <Input
            label="Entry Title"
            placeholder="e.g. Dawn Boat Ride on Varanasi Ghats, Munnar Tea Estate Stroll"
            required
            maxLength={250}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <Input
            label="Date"
            type="date"
            required
            value={formData.journalDate}
            onChange={(e) => setFormData({ ...formData, journalDate: e.target.value })}
          />
          <Textarea
            label="Journal Content"
            placeholder="Write down what you saw, tasted, felt, and experienced today across India…"
            required
            rows={8}
            maxLength={10000}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          />

          <div className="modal-actions" style={{ marginTop: 20 }}>
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} disabled={saving}>
              {modalEntry?.id ? 'Update Entry' : 'Save Entry'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Entry & Media Upload Modal */}
      <Modal
        open={viewEntry !== null}
        onClose={() => setViewEntry(null)}
        title={viewEntry?.title || 'Journal Entry Details'}
        maxWidth="760px"
      >
        {viewEntry && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '0.88rem', marginBottom: 16 }}>
              <Calendar size={15} />
              <span>{viewEntry.journalDate}</span>
            </div>
            <div
              style={{
                fontSize: '0.96rem',
                lineHeight: 1.7,
                color: '#334155',
                whiteSpace: 'pre-wrap',
                padding: '16px',
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                marginBottom: 20
              }}
            >
              {viewEntry.content}
            </div>

            {/* Attached Photos & Videos */}
            <div style={{ marginTop: 20, marginBottom: 20 }}>
              <h4 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Camera size={18} color="#2563eb" />
                Attached Photos & Video Clips ({viewEntry.photos?.length || 0})
              </h4>

              {viewEntry.photos && viewEntry.photos.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                  {viewEntry.photos.map((p) => {
                    const isVid = isVideoUrl(p.imageUrl)
                    return (
                      <div
                        key={p.id}
                        style={{
                          borderRadius: 8,
                          overflow: 'hidden',
                          border: '1px solid #e2e8f0',
                          background: '#ffffff',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <div style={{ width: '100%', height: 140, background: '#0f172a', position: 'relative' }}>
                          {isVid ? (
                            <video
                              src={p.imageUrl}
                              controls
                              playsInline
                              preload="metadata"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <img
                              src={p.imageUrl}
                              alt={p.caption || 'Photo'}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          )}
                        </div>
                        <div style={{ padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                            {p.caption || (isVid ? 'Video Clip' : 'Photo')}
                          </span>
                          <button
                            className="link-button danger"
                            style={{ padding: '2px 4px', fontSize: '0.78rem' }}
                            onClick={() => setConfirmDeleteMedia({ entryId: viewEntry.id, photoId: p.id })}
                            title="Delete media"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p style={{ fontSize: '0.86rem', color: '#64748b', fontStyle: 'italic', margin: '0 0 16px' }}>
                  No photos or videos attached yet. Upload below!
                </p>
              )}
            </div>

            {/* Upload New Photo or Video Box */}
            <div style={{ background: '#eff6ff', padding: '16px 20px', borderRadius: 10, border: '1px dashed #93c5fd', marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Upload size={16} color="#2563eb" />
                <strong style={{ fontSize: '0.92rem', color: '#1e40af' }}>Add Photo or Short Video</strong>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 12px' }}>
                Supported formats: JPG, PNG, WEBP (up to 15MB) and MP4, WEBM (up to 60MB).
              </p>

              {uploadErr && <ErrorMessage>{uploadErr}</ErrorMessage>}

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr auto', gap: 10, alignItems: 'center' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                  onChange={handleFileSelect}
                  style={{ fontSize: '0.82rem' }}
                />
                <input
                  type="text"
                  className="input-control"
                  placeholder="Caption (e.g. Sunset over Lake Pichola)"
                  value={mediaCaption}
                  onChange={(e) => setMediaCaption(e.target.value)}
                  style={{ fontSize: '0.84rem' }}
                />
                <Button
                  size="sm"
                  variant="primary"
                  loading={uploading}
                  disabled={uploading || !selectedFile}
                  onClick={() => handleUploadMedia(viewEntry.id)}
                >
                  Upload
                </Button>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: 24 }}>
              <Button variant="secondary" onClick={() => setViewEntry(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Entry Confirmation */}
      <ConfirmDialog
        open={confirmDelete !== null}
        title={`Delete "${confirmDelete?.title}"?`}
        description="Are you sure you want to permanently delete this journal entry and its attached photos/videos?"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
      />

      {/* Delete Media Confirmation */}
      <ConfirmDialog
        open={confirmDeleteMedia !== null}
        title="Delete this media file?"
        description="Are you sure you want to remove this photo or video from this entry?"
        onCancel={() => setConfirmDeleteMedia(null)}
        onConfirm={handleDeleteMedia}
      />
    </div>
  )
}

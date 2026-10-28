import React, { useState } from 'react'
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  Star
} from 'lucide-react'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  icon: Icon,
  disabled,
  ...props
}) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="btn-spinner" size={16} />
      ) : (
        Icon && <Icon size={16} className="btn-icon" />
      )}
      {children}
    </button>
  )
}

export function Input({ label, error, helper, icon: Icon, className = '', ...props }) {
  return (
    <label className={`form-field ${className}`}>
      {label && <span className="field-label">{label}</span>}
      <div className="input-wrapper">
        {Icon && <Icon size={18} className="input-icon" />}
        <input className={`input-control ${error ? 'is-invalid' : ''} ${Icon ? 'has-icon' : ''}`} {...props} />
      </div>
      {error && <small className="field-error"><AlertCircle size={13} /> {error}</small>}
      {helper && !error && <small className="field-helper">{helper}</small>}
    </label>
  )
}

export function Select({ label, error, children, className = '', icon: Icon, ...props }) {
  return (
    <label className={`form-field ${className}`}>
      {label && <span className="field-label">{label}</span>}
      <div className="input-wrapper">
        {Icon && <Icon size={18} className="input-icon" />}
        <select className={`input-control select-control ${error ? 'is-invalid' : ''} ${Icon ? 'has-icon' : ''}`} {...props}>
          {children}
        </select>
      </div>
      {error && <small className="field-error"><AlertCircle size={13} /> {error}</small>}
    </label>
  )
}

export function Textarea({ label, error, helper, className = '', ...props }) {
  return (
    <label className={`form-field ${className}`}>
      {label && <span className="field-label">{label}</span>}
      <textarea className={`input-control textarea-control ${error ? 'is-invalid' : ''}`} rows={4} {...props} />
      {error && <small className="field-error"><AlertCircle size={13} /> {error}</small>}
      {helper && !error && <small className="field-helper">{helper}</small>}
    </label>
  )
}

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <section className={`card ${hover ? 'card-hover' : ''} ${className}`} {...props}>
      {children}
    </section>
  )
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'primary' }) {
  return (
    <Card className={`stat-card stat-${variant}`}>
      <div className="stat-card-header">
        <span className="stat-title">{title}</span>
        {Icon && <div className="stat-icon-badge"><Icon size={20} /></div>}
      </div>
      <div className="stat-value">{value}</div>
      {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      {trend && <span className="stat-trend">{trend}</span>}
    </Card>
  )
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  return (
    <span className={`badge badge-${variant} badge-${size} ${className}`}>
      {children}
    </span>
  )
}

export function Spinner({ size = 28 }) {
  return <Loader2 className="spinner-icon" size={size} aria-label="Loading" />
}

export function LoadingState({ message = 'Loading content…' }) {
  return (
    <div className="loading-state">
      <Spinner size={36} />
      <p>{message}</p>
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title = 'No records found',
  description = 'Get started by creating your first entry or exploring options.',
  action
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        {Icon ? <Icon size={36} /> : <Info size={36} />}
      </div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  )
}

export function ErrorMessage({ children }) {
  if (!children) return null
  return (
    <div className="alert alert-danger" role="alert">
      <AlertCircle size={18} className="alert-icon" />
      <div className="alert-content">{children}</div>
    </div>
  )
}

export function SuccessMessage({ children }) {
  if (!children) return null
  return (
    <div className="alert alert-success" role="alert">
      <CheckCircle2 size={18} className="alert-icon" />
      <div className="alert-content">{children}</div>
    </div>
  )
}

export function PageHeader({ eyebrow, title, description, action, breadcrumb }) {
  return (
    <header className="page-header">
      <div className="page-header-text">
        {breadcrumb && <nav className="breadcrumb">{breadcrumb}</nav>}
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </header>
  )
}

export function SectionHeader({ title, description, action, eyebrow }) {
  return (
    <div className="section-header">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="section-action">{action}</div>}
    </div>
  )
}

export function Modal({ open, onClose, title, children, maxWidth = '560px' }) {
  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-container"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmDialog({
  open,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel
}) {
  if (!open) return null
  return (
    <Modal open={open} onClose={onCancel} title={title} maxWidth="450px">
      <p className="confirm-desc">{description}</p>
      <div className="modal-actions">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={variant} loading={loading} onClick={onConfirm}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}

export function RatingDisplay({ rating, count, size = 16 }) {
  const num = Number(rating || 0)
  return (
    <div className="rating-pill">
      <Star size={size} className="star-icon filled" />
      <span className="rating-val">{num.toFixed(1)}</span>
      {count !== undefined && <span className="rating-count">({count})</span>}
    </div>
  )
}

export function Skeleton({ height = 24, width = '100%', borderRadius = 8, className = '' }) {
  return (
    <div
      className={`skeleton-pulse ${className}`}
      style={{ height, width, borderRadius }}
      aria-hidden="true"
    />
  )
}

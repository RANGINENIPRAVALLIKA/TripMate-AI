import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { budgetExpenseService as api } from '../services/budgetExpenseService'
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
  StatCard,
  SuccessMessage
} from '../components/ui'
import { apiError } from '../api/client'
import { formatINR } from '../utils/currency'
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Edit2,
  PieChart,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet
} from 'lucide-react'

export default function BudgetExpensesPage() {
  const { tripId } = useParams()
  const [budget, setBudget] = useState(undefined)
  const [summary, setSummary] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [err, setErr] = useState('')
  const [notice, setNotice] = useState('')
  const [editBudget, setEditBudget] = useState(false)
  const [modalExpense, setModalExpense] = useState(null) // null = closed, {} = add, item = edit
  const [removeExpense, setRemoveExpense] = useState(null)
  const [saving, setSaving] = useState(false)

  // Budget form state
  const [budgetForm, setBudgetForm] = useState({
    totalBudget: '',
    allocatedAmount: '',
    currency: 'INR'
  })

  // Expense form state
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    categoryId: ''
  })

  const load = async () => {
    try {
      const [budgetRes, summaryRes, expRes] = await Promise.all([
        api.getBudget(tripId).catch((e) => (e.response?.status === 404 ? null : Promise.reject(e))),
        api.summary(tripId).catch(() => null),
        api.expenses(tripId)
      ])
      setBudget(budgetRes)
      setSummary(summaryRes)
      setExpenses(expRes.content || [])
    } catch (e) {
      setErr(apiError(e))
    }
  }

  useEffect(() => {
    load()
  }, [tripId])

  const openBudgetModal = () => {
    setBudgetForm({
      totalBudget: budget?.totalBudget ?? '',
      allocatedAmount: budget?.allocatedAmount ?? '',
      currency: budget?.currency || 'INR'
    })
    setEditBudget(true)
  }

  const openAddExpenseModal = () => {
    setExpenseForm({
      title: '',
      amount: '',
      expenseDate: new Date().toISOString().split('T')[0],
      categoryId: ''
    })
    setModalExpense({})
  }

  const openEditExpenseModal = (e) => {
    setExpenseForm({
      title: e.title || '',
      amount: e.amount || '',
      expenseDate: e.expenseDate || new Date().toISOString().split('T')[0],
      categoryId: e.categoryId || ''
    })
    setModalExpense(e)
  }

  const handleSaveBudget = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErr('')
    try {
      const payload = {
        tripId: Number(tripId),
        totalBudget: Number(budgetForm.totalBudget),
        allocatedAmount: budgetForm.allocatedAmount === '' ? null : Number(budgetForm.allocatedAmount),
        currency: budgetForm.currency.trim().toUpperCase() || 'INR'
      }

      if (budget) {
        await api.updateBudget(tripId, payload)
        setNotice('Budget targets updated.')
      } else {
        await api.createBudget(tripId, payload)
        setNotice('Trip budget established.')
      }
      setEditBudget(false)
      load()
    } catch (ex) {
      setErr(apiError(ex))
    } finally {
      setSaving(false)
    }
  }

  const handleSaveExpense = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErr('')
    try {
      const payload = {
        tripId: Number(tripId),
        title: expenseForm.title.trim(),
        amount: Number(expenseForm.amount),
        expenseDate: expenseForm.expenseDate,
        categoryId: expenseForm.categoryId ? Number(expenseForm.categoryId) : null
      }

      if (modalExpense.id) {
        await api.updateExpense(tripId, modalExpense.id, payload)
        setNotice('Expense item updated.')
      } else {
        await api.addExpense(tripId, payload)
        setNotice('Expense recorded.')
      }
      setModalExpense(null)
      load()
    } catch (ex) {
      setErr(apiError(ex))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteExpense = async () => {
    if (!removeExpense) return
    try {
      await api.removeExpense(tripId, removeExpense.id)
      setRemoveExpense(null)
      setNotice('Expense deleted.')
      load()
    } catch (ex) {
      setErr(apiError(ex))
    }
  }

  if (budget === undefined && !err) return <LoadingState message="Calculating budget & expenses…" />

  const totalBudgetVal = Number(summary?.totalBudget ?? budget?.totalBudget ?? 0)
  const totalExpensesVal = Number(summary?.totalExpenses ?? 0)
  const remainingBudgetVal = Number(summary?.remainingBudget ?? (totalBudgetVal - totalExpensesVal))
  const spentPct = totalBudgetVal > 0 ? Math.round((totalExpensesVal / totalBudgetVal) * 100) : 0
  const isOverBudget = remainingBudgetVal < 0

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Link to={`/trips/${tripId}`} style={{ fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={16} /> Back to trip workspace
        </Link>
      </div>

      <PageHeader
        eyebrow="Financial Tracking"
        title="Budget & Expenses"
        description="Monitor planned allocations versus real spend across your itinerary."
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" icon={Wallet} onClick={openBudgetModal}>
              {budget ? 'Edit Budget' : 'Set Budget'}
            </Button>
            <Button icon={Plus} onClick={openAddExpenseModal}>
              Add Expense
            </Button>
          </div>
        }
      />

      <ErrorMessage>{err}</ErrorMessage>
      {notice && <SuccessMessage>{notice}</SuccessMessage>}

      {/* KPI Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard
          title="Total Budget"
          value={formatINR(totalBudgetVal)}
          subtitle={budget ? `Currency: ${budget.currency || 'INR'}` : 'No budget set'}
          icon={Wallet}
          variant="primary"
        />
        <StatCard
          title="Total Spent"
          value={formatINR(totalExpensesVal)}
          subtitle={`${spentPct}% of target budget`}
          icon={TrendingUp}
          variant={isOverBudget ? 'danger' : 'coral'}
        />
        <StatCard
          title={isOverBudget ? 'Budget Deficit' : 'Remaining Balance'}
          value={formatINR(Math.abs(remainingBudgetVal))}
          subtitle={isOverBudget ? 'Exceeded planned target' : 'Available to spend'}
          icon={TrendingDown}
          variant={isOverBudget ? 'danger' : 'success'}
        />
      </div>

      {/* Visual Budget Meter */}
      {totalBudgetVal > 0 && (
        <Card style={{ marginBottom: 24, padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
              Spending Progress
            </span>
            <Badge variant={isOverBudget ? 'danger' : spentPct > 85 ? 'coral' : 'success'}>
              {spentPct}% spent
            </Badge>
          </div>
          <div style={{ width: '100%', height: 12, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(100, spentPct)}%`,
                height: '100%',
                background: isOverBudget ? '#ef4444' : spentPct > 85 ? '#ea580c' : '#10b981',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </Card>
      )}

      {/* Expenses List */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#0f172a' }}>
            Expense Transactions
          </h2>
          <span style={{ fontSize: '0.86rem', color: '#64748b' }}>
            {expenses.length} recorded {expenses.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {expenses.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {expenses.map((e) => (
              <div
                key={e.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '1px solid #f1f5f9',
                  background: '#f8fafc',
                  transition: 'background 0.2s ease'
                }}
              >
                <div>
                  <strong style={{ fontSize: '1rem', color: '#0f172a', display: 'block', marginBottom: 4 }}>
                    {e.title}
                  </strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', color: '#64748b' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={13} /> {e.expenseDate}
                    </span>
                    {e.status && (
                      <Badge variant="default" size="sm">
                        {e.status}
                      </Badge>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                    {formatINR(e.amount)}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="link-button"
                      style={{ padding: '6px 8px' }}
                      onClick={() => openEditExpenseModal(e)}
                      title="Edit expense"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      className="link-button danger"
                      style={{ padding: '6px 8px' }}
                      onClick={() => setRemoveExpense(e)}
                      title="Delete expense"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={DollarSign}
            title="No expenses logged yet"
            description="Keep track of receipts, dining bills, ticket bookings, and purchases."
            action={
              <Button icon={Plus} onClick={openAddExpenseModal}>
                Log First Expense
              </Button>
            }
          />
        )}
      </Card>

      {/* Set/Edit Budget Modal */}
      <Modal
        open={editBudget}
        onClose={() => setEditBudget(false)}
        title={budget ? 'Edit Trip Budget' : 'Set Trip Budget'}
      >
        <form onSubmit={handleSaveBudget}>
          <Input
            label="Total Planned Budget (₹ INR)"
            type="number"
            min="0"
            step="100"
            required
            placeholder="e.g. 35000"
            value={budgetForm.totalBudget}
            onChange={(e) => setBudgetForm({ ...budgetForm, totalBudget: e.target.value })}
          />
          <Input
            label="Allocated Amount (optional)"
            type="number"
            min="0"
            step="100"
            placeholder="e.g. 20000"
            value={budgetForm.allocatedAmount}
            onChange={(e) => setBudgetForm({ ...budgetForm, allocatedAmount: e.target.value })}
          />
          <Input
            label="Currency Code"
            maxLength={3}
            placeholder="INR"
            value={budgetForm.currency}
            onChange={(e) => setBudgetForm({ ...budgetForm, currency: e.target.value.toUpperCase() })}
          />

          <div className="modal-actions" style={{ marginTop: 20 }}>
            <Button type="button" variant="secondary" onClick={() => setEditBudget(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} disabled={saving}>
              Save Budget
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Expense Modal */}
      <Modal
        open={modalExpense !== null}
        onClose={() => setModalExpense(null)}
        title={modalExpense?.id ? 'Edit Expense' : 'Add Expense'}
      >
        <form onSubmit={handleSaveExpense}>
          <Input
            label="Expense Description / Title"
            required
            maxLength={200}
            placeholder="e.g. IRCTC Train Tickets, Houseboat Stay, Kathakali Show"
            value={expenseForm.title}
            onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
          />
          <Input
            label="Amount (₹ INR)"
            type="number"
            min="1"
            step="1"
            required
            placeholder="e.g. 1500"
            value={expenseForm.amount}
            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
          />
          <Input
            label="Date of Expense"
            type="date"
            required
            value={expenseForm.expenseDate}
            onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
          />

          <div className="modal-actions" style={{ marginTop: 20 }}>
            <Button type="button" variant="secondary" onClick={() => setModalExpense(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} disabled={saving}>
              {modalExpense?.id ? 'Update Expense' : 'Save Expense'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={removeExpense !== null}
        title={`Delete expense "${removeExpense?.title}"?`}
        description="Are you sure you want to delete this recorded transaction?"
        onCancel={() => setRemoveExpense(null)}
        onConfirm={handleDeleteExpense}
      />
    </div>
  )
}

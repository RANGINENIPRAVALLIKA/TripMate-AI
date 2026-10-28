import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { groupExpenseService as api } from '../services/groupExpenseService'
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
  Select,
  SuccessMessage
} from '../components/ui'
import { apiError } from '../api/client'
import { formatINR } from '../utils/currency'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Plus,
  Trash2,
  UserPlus,
  Users2,
  Wallet
} from 'lucide-react'

export default function GroupExpensesPage() {
  const { tripId } = useParams()
  const [group, setGroup] = useState(null) // null = loading, false = doesn't exist, obj = exists
  const [expenses, setExpenses] = useState([])
  const [balances, setBalances] = useState([])
  const [settlements, setSettlements] = useState([])
  const [err, setErr] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  // Modals
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberUserId, setNewMemberUserId] = useState('')
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [confirmRemoveMember, setConfirmRemoveMember] = useState(null)

  // Create group form
  const [createGroupName, setCreateGroupName] = useState('')

  // Expense form
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    paidByMemberId: '',
    participantMemberIds: []
  })

  const load = async () => {
    try {
      const groupData = await api.get(tripId)
      setGroup(groupData)

      const [expRes, balRes, settRes] = await Promise.all([
        api.expenses(tripId),
        api.balances(tripId),
        api.settlements(tripId)
      ])
      setExpenses(expRes)
      setBalances(balRes)
      setSettlements(settRes)
    } catch (e) {
      if (e.response?.status === 404) {
        setGroup(false)
      } else {
        setErr(apiError(e))
      }
    }
  }

  useEffect(() => {
    load()
  }, [tripId])

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErr('')
    try {
      await api.create(tripId, { name: createGroupName.trim() })
      setNote('Travel group created!')
      load()
    } catch (x) {
      setErr(apiError(x))
    } finally {
      setSaving(false)
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!newMemberUserId) return
    setSaving(true)
    setErr('')
    try {
      await api.addMember(tripId, Number(newMemberUserId))
      setNewMemberUserId('')
      setShowAddMember(false)
      setNote('Group member added.')
      load()
    } catch (x) {
      setErr(apiError(x))
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveMember = async () => {
    if (!confirmRemoveMember) return
    try {
      await api.removeMember(tripId, confirmRemoveMember.userId)
      setConfirmRemoveMember(null)
      setNote('Member removed.')
      load()
    } catch (x) {
      setErr(apiError(x))
    }
  }

  const openAddExpense = () => {
    const memberIds = (group?.members || []).map((m) => m.id)
    setExpenseForm({
      description: '',
      amount: '',
      paidByMemberId: memberIds[0] || '',
      participantMemberIds: memberIds
    })
    setShowExpenseModal(true)
  }

  const toggleParticipant = (memberId) => {
    const current = expenseForm.participantMemberIds
    if (current.includes(memberId)) {
      setExpenseForm({
        ...expenseForm,
        participantMemberIds: current.filter((id) => id !== memberId)
      })
    } else {
      setExpenseForm({
        ...expenseForm,
        participantMemberIds: [...current, memberId]
      })
    }
  }

  const handleSaveExpense = async (e) => {
    e.preventDefault()
    if (expenseForm.participantMemberIds.length === 0) {
      setErr('Please select at least one person to split the expense with.')
      return
    }
    setSaving(true)
    setErr('')
    try {
      await api.addExpense(tripId, {
        description: expenseForm.description.trim(),
        amount: Number(expenseForm.amount),
        paidByMemberId: Number(expenseForm.paidByMemberId),
        participantMemberIds: expenseForm.participantMemberIds
      })
      setShowExpenseModal(false)
      setNote('Group expense logged and split.')
      load()
    } catch (x) {
      setErr(apiError(x))
    } finally {
      setSaving(false)
    }
  }

  if (group === null && !err) return <LoadingState message="Loading group splitting ledger…" />

  // If no group exists yet
  if (group === false) {
    return (
      <div>
        <div style={{ marginBottom: 12 }}>
          <Link to={`/trips/${tripId}`} style={{ fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={16} /> Back to trip workspace
          </Link>
        </div>

        <PageHeader
          eyebrow="Collaborative Finances"
          title="Group Expense Splitter"
          description="Split restaurant checks, fuel, and bookings seamlessly with friends."
        />

        <ErrorMessage>{err}</ErrorMessage>

        <Card style={{ maxWidth: 560, margin: '20px auto 0', padding: 30, textAlign: 'center' }}>
          <div className="feature-icon-wrapper" style={{ margin: '0 auto 16px', background: '#fff7ed', color: '#ea580c' }}>
            <Users2 size={26} />
          </div>
          <h2 style={{ fontSize: '1.35rem', marginBottom: 10, color: '#0f172a' }}>
            Create Travel Group
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: 24, lineHeight: 1.5 }}>
            No expense splitting group is linked to this trip yet. Set up a group to add companions and automatically balance shared costs.
          </p>

          <form onSubmit={handleCreateGroup} style={{ textAlign: 'left' }}>
            <Input
              label="Group Name"
              placeholder="e.g. Kyoto Adventure Crew, EuroTrip Squad"
              required
              maxLength={150}
              value={createGroupName}
              onChange={(e) => setCreateGroupName(e.target.value)}
            />
            <div style={{ marginTop: 20 }}>
              <Button type="submit" loading={saving} disabled={saving} style={{ width: '100%' }}>
                Initialize Group Splitter
              </Button>
            </div>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Link to={`/trips/${tripId}`} style={{ fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={16} /> Back to trip workspace
        </Link>
      </div>

      <PageHeader
        eyebrow="Group Ledger"
        title={group.name}
        description="Fair expense splitting and automated settlement calculation among travelers."
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" icon={UserPlus} onClick={() => setShowAddMember(true)}>
              Add Member
            </Button>
            <Button icon={Plus} onClick={openAddExpense}>
              Add Expense
            </Button>
          </div>
        }
      />

      <ErrorMessage>{err}</ErrorMessage>
      {note && <SuccessMessage>{note}</SuccessMessage>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Members Card */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users2 size={18} color="#1a73e8" />
              <strong style={{ fontSize: '1rem', color: '#0f172a' }}>Group Members ({group.members?.length || 0})</strong>
            </div>
            <Button size="sm" variant="secondary" icon={UserPlus} onClick={() => setShowAddMember(true)}>
              Invite
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {group.members?.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  background: '#f8fafc',
                  borderRadius: 8,
                  border: '1px solid #f1f5f9'
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.92rem', color: '#0f172a', display: 'block' }}>
                    {m.fullName}
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {m.memberRole} · User #{m.userId}
                  </span>
                </div>
                {m.memberRole !== 'ADMIN' && (
                  <button
                    className="link-button danger"
                    style={{ fontSize: '0.82rem' }}
                    onClick={() => setConfirmRemoveMember(m)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Balances Card */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Wallet size={18} color="#ea580c" />
            <strong style={{ fontSize: '1rem', color: '#0f172a' }}>Current Balances</strong>
          </div>

          {balances.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {balances.map((b) => {
                const net = Number(b.netBalance || 0)
                return (
                  <div
                    key={b.memberId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      background: '#f8fafc',
                      borderRadius: 8,
                      border: '1px solid #f1f5f9'
                    }}
                  >
                    <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0f172a' }}>
                      {b.name}
                    </span>
                    <Badge variant={net > 0 ? 'success' : net < 0 ? 'danger' : 'default'}>
                      {net > 0
                        ? `Gets back ${formatINR(net)}`
                        : net < 0
                        ? `Owes ${formatINR(Math.abs(net))}`
                        : 'Settled'}
                    </Badge>
                  </div>
                )
              })}
            </div>
          ) : (
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
              No expenses split yet. Balances will appear when you add group charges.
            </p>
          )}
        </Card>
      </div>

      {/* Settlements Suggestions */}
      {settlements.length > 0 && (
        <Card style={{ marginBottom: 24, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <CheckCircle2 size={18} color="#16a34a" />
            <strong style={{ fontSize: '1rem', color: '#166534' }}>Suggested Settle-Up Transfers</strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {settlements.map((s, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: '0.92rem',
                  color: '#14532d'
                }}
              >
                <span>Member #{s.fromMemberId}</span>
                <ArrowRight size={14} color="#16a34a" />
                <span>Member #{s.toMemberId}</span>
                <strong style={{ marginLeft: 8, color: '#166534' }}>
                  {formatINR(s.amount)}
                </strong>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Group Expenses List */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#0f172a' }}>
            Shared Expenses History
          </h2>
          <span style={{ fontSize: '0.86rem', color: '#64748b' }}>
            {expenses.length} records
          </span>
        </div>

        {expenses.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {expenses.map((x) => (
              <div
                key={x.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: '#f8fafc',
                  borderRadius: 8,
                  border: '1px solid #f1f5f9'
                }}
              >
                <div>
                  <strong style={{ fontSize: '1rem', color: '#0f172a', display: 'block', marginBottom: 4 }}>
                    {x.description}
                  </strong>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Paid by Member #{x.paidByMemberId} · Split with {x.shares?.length || 0} participants
                  </span>
                </div>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1a73e8' }}>
                  {formatINR(x.amount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Wallet}
            title="No group expenses recorded"
            description="Add a bill or payment to divide the cost between members."
            action={
              <Button icon={Plus} onClick={openAddExpense}>
                Add Shared Expense
              </Button>
            }
          />
        )}
      </Card>

      {/* Add Member Modal */}
      <Modal
        open={showAddMember}
        onClose={() => setShowAddMember(false)}
        title="Add Group Member"
      >
        <form onSubmit={handleAddMember}>
          <Input
            label="User ID to Add"
            type="number"
            min="1"
            required
            placeholder="Enter user numeric ID (e.g. 1, 2)"
            value={newMemberUserId}
            onChange={(e) => setNewMemberUserId(e.target.value)}
          />
          <div className="modal-actions" style={{ marginTop: 20 }}>
            <Button type="button" variant="secondary" onClick={() => setShowAddMember(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} disabled={saving}>
              Add to Group
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Group Expense Modal */}
      <Modal
        open={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        title="Add Shared Expense"
        maxWidth="600px"
      >
        <form onSubmit={handleSaveExpense}>
          <Input
            label="Expense Description"
            placeholder="e.g. Traditional Thali Dinner, Kerala Houseboat Cruise, Local Cab Fare"
            required
            maxLength={200}
            value={expenseForm.description}
            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="Total Amount (₹ INR)"
              type="number"
              min="1"
              step="1"
              required
              placeholder="e.g. 3500"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
            />

            <Select
              label="Paid By"
              required
              value={expenseForm.paidByMemberId}
              onChange={(e) => setExpenseForm({ ...expenseForm, paidByMemberId: e.target.value })}
            >
              {group.members?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName}
                </option>
              ))}
            </Select>
          </div>

          <div style={{ marginTop: 14 }}>
            <label className="field-label" style={{ marginBottom: 8, display: 'block' }}>
              Split Equally Among:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              {group.members?.map((m) => (
                <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={expenseForm.participantMemberIds.includes(m.id)}
                    onChange={() => toggleParticipant(m.id)}
                  />
                  <span>{m.fullName}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="modal-actions" style={{ marginTop: 20 }}>
            <Button type="button" variant="secondary" onClick={() => setShowExpenseModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} disabled={saving}>
              Save & Split Expense
            </Button>
          </div>
        </form>
      </Modal>

      {/* Remove Member Confirmation */}
      <ConfirmDialog
        open={confirmRemoveMember !== null}
        title={`Remove ${confirmRemoveMember?.fullName}?`}
        description="Are you sure you want to remove this member from the expense group?"
        onCancel={() => setConfirmRemoveMember(null)}
        onConfirm={handleRemoveMember}
      />
    </div>
  )
}

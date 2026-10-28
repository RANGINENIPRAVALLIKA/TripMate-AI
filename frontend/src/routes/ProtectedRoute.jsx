import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoadingState } from '../components/ui'
export function ProtectedRoute() { const { user, loading } = useAuth(); if (loading) return <LoadingState />; return user ? <Outlet /> : <Navigate to="/login" replace /> }
export function AdminRoute() { const { isAdmin } = useAuth(); return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace /> }

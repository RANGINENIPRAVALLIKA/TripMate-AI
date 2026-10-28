import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AuthLayout from './layouts/AuthLayout'
import AppLayout from './layouts/AppLayout'
import { ProtectedRoute, AdminRoute } from './routes/ProtectedRoute'

import LandingPage from './pages/LandingPage'
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage
} from './pages/AuthPages'

import DashboardPage from './pages/DashboardPage'
import TripsPage from './pages/TripsPage'
import AiPlannerPage from './pages/AiPlannerPage'
import TripDetailsPage from './pages/TripDetailsPage'
import ItineraryPage from './pages/ItineraryPage'
import PackingPage from './pages/PackingPage'
import JournalPage from './pages/JournalPage'
import BookingsPage from './pages/BookingsPage'
import GroupExpensesPage from './pages/GroupExpensesPage'
import BudgetExpensesPage from './pages/BudgetExpensesPage'
import DestinationsPage from './pages/DestinationsPage'
import HotelsPage from './pages/HotelsPage'
import RestaurantsPage from './pages/RestaurantsPage'
import AttractionsPage from './pages/AttractionsPage'
import FavoritesPage from './pages/FavoritesPage'
import NearbyPlacesPage from './pages/NearbyPlacesPage'
import ReviewsPage from './pages/ReviewsPage'
import ProfilePage from './pages/ProfilePage'
import AnalyticsPage from './pages/AnalyticsPage'
import ChatPage from './pages/ChatPage'
import AdminDashboardPage from './pages/AdminDashboardPage'

export default function App() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Protected Application Workspace */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Trips & Workspace */}
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/trips/planner" element={<AiPlannerPage />} />
          <Route path="/trips/:tripId" element={<TripDetailsPage />} />
          <Route path="/trips/:tripId/itinerary" element={<ItineraryPage />} />
          <Route path="/trips/:tripId/packing" element={<PackingPage />} />
          <Route path="/trips/:tripId/journal" element={<JournalPage />} />
          <Route path="/trips/:tripId/bookings" element={<BookingsPage />} />
          <Route path="/trips/:tripId/group-expenses" element={<GroupExpensesPage />} />
          <Route path="/trips/:tripId/budget-expenses" element={<BudgetExpensesPage />} />

          {/* Discovery & Exploration */}
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/destinations/:destinationId/nearby-places" element={<NearbyPlacesPage />} />
          <Route path="/hotels" element={<HotelsPage />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/attractions" element={<AttractionsPage />} />

          {/* Travel Tools */}
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/chat" element={<ChatPage />} />

          {/* Admin Protected Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

import client, { apiData } from '../api/client'
export const itineraryService = {
  list: (tripId) => apiData(client.get(`/trips/${tripId}/itineraries`)), create: (tripId, body) => apiData(client.post(`/trips/${tripId}/itineraries`, body)), update: (tripId, id, body) => apiData(client.put(`/trips/${tripId}/itineraries/${id}`, body)), remove: (tripId, id) => apiData(client.delete(`/trips/${tripId}/itineraries/${id}`)),
  activities: (itineraryId) => apiData(client.get(`/itineraries/${itineraryId}/activities`)), createActivity: (itineraryId, body) => apiData(client.post(`/itineraries/${itineraryId}/activities`, body)), updateActivity: (id, body) => apiData(client.put(`/activities/${id}`, body)), removeActivity: (id) => apiData(client.delete(`/activities/${id}`)), reorderActivities: (itineraryId, activityIds) => apiData(client.put(`/itineraries/${itineraryId}/activities/reorder`, { activityIds }))
}

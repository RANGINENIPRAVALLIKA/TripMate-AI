import client, { apiData } from '../api/client'

export const journalService = {
  list: (tripId) => apiData(client.get(`/trips/${tripId}/journal`)),
  get: (tripId, entryId) => apiData(client.get(`/trips/${tripId}/journal/${entryId}`)),
  create: (tripId, body) => apiData(client.post(`/trips/${tripId}/journal`, body)),
  update: (tripId, entryId, body) => apiData(client.put(`/trips/${tripId}/journal/${entryId}`, body)),
  remove: (tripId, entryId) => apiData(client.delete(`/trips/${tripId}/journal/${entryId}`)),

  uploadMedia: (tripId, entryId, formData) =>
    apiData(
      client.post(`/trips/${tripId}/journal/${entryId}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    ),
  deleteMedia: (tripId, entryId, photoId) =>
    apiData(client.delete(`/trips/${tripId}/journal/${entryId}/photos/${photoId}`)),
  listMedia: (tripId) => apiData(client.get(`/trips/${tripId}/journal/media`))
}

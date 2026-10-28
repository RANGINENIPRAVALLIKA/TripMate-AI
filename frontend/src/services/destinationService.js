import client, { apiData } from '../api/client'

export const destinationService = {
  list: (params) => apiData(client.get('/destinations', { params })),
  all: () => apiData(client.get('/destinations/all')),
  get: (id) => apiData(client.get(`/destinations/${id}`)),
  hotels: (id) => apiData(client.get(`/destinations/${id}/hotels`)),
  restaurants: (id) => apiData(client.get(`/destinations/${id}/restaurants`)),
  attractions: (id) => apiData(client.get(`/destinations/${id}/attractions`)),
  nearby: (id, category) => apiData(client.get(`/destinations/${id}/nearby-places`, { params: category ? { category } : {} })),
  listHotels: (params) => apiData(client.get('/hotels', { params })),
  getHotel: (id) => apiData(client.get(`/hotels/${id}`)),
  listRestaurants: (params) => apiData(client.get('/restaurants', { params })),
  getRestaurant: (id) => apiData(client.get(`/restaurants/${id}`)),
  listAttractions: (params) => apiData(client.get('/attractions', { params })),
  getAttraction: (id) => apiData(client.get(`/attractions/${id}`)),
  createCustom: (data) => apiData(client.post('/destinations/custom', data))
}


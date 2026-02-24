import apiClient from './client'

// Auth Services
export const authAPI = {
  register: (userData) => apiClient.post('/clients/register/', userData),
  login: (email, password) => apiClient.post('/auth/login/', { email, password }),
  logout: () => apiClient.post('/auth/logout/'),
  getProfile: () => apiClient.get('/auth/me/'),
  updateProfile: (userData) => apiClient.put('/clients/', userData),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password/', { email }),
  resetPassword: (token, new_password) => apiClient.post('/auth/reset-password/', { token, new_password }),
}

// Products Services
export const productsAPI = {
  getAll: (params) => apiClient.get('/products/', { params }),
  getAllAdmin: () => apiClient.get('/products/admin-all/'),
  getById: (id) => apiClient.get(`/products/${id}`),
  getCategories: () => apiClient.get('/categories/'),
  search: (query) => apiClient.get('/products/search/', { params: { q: query } }),
  create: (productData) => apiClient.post('/products/', productData),
  update: (id, productData) => apiClient.put(`/products/${id}`, productData),
  remove: (id) => apiClient.delete(`/products/${id}`),
}

// Orders Services
export const ordersAPI = {
  placeOrder: (orderData) => apiClient.post('/orders/place/', orderData),
  getMyOrders: () => apiClient.get('/orders/my-orders/'),
  cancel: (id) => apiClient.post(`/orders/${id}/cancel/`),
  requestReturn: (id) => apiClient.post(`/orders/${id}/return/`),
  // Admin
  adminGetAll: () => apiClient.get('/orders/admin-all/'),
  adminUpdateStatus: (id, statusStr) => apiClient.patch(`/orders/${id}/status/`, { status: statusStr }),
  adminContactReturn: (id) => apiClient.post(`/orders/${id}/contact-return/`),
}

// Users (admin)
export const usersAPI = {
  adminGetAll: () => apiClient.get('/clients/admin-all/'),
  adminToggleRole: (id) => apiClient.patch(`/clients/${id}/role/`),
}

// Bills Services
export const billsAPI = {
  getByOrder: (orderId) => apiClient.get(`/bills/order/${orderId}`),
  downloadPDF: (billId) => apiClient.get(`/bills/${billId}/pdf`, { responseType: 'blob' }),
}

// Address Services
export const addressAPI = {
  getAll: () => apiClient.get('/addresses/'),
  create: (addressData) => apiClient.post('/addresses/', addressData),
  update: (id, addressData) => apiClient.put(`/addresses/${id}`, addressData),
  delete: (id) => apiClient.delete(`/addresses/${id}`),
}

// Categories Services
export const categoriesAPI = {
  getAll: () => apiClient.get('/categories/'),
  create: (data) => apiClient.post('/categories/', data),
  update: (id, data) => apiClient.put(`/categories/${id}`, data),
  remove: (id) => apiClient.delete(`/categories/${id}`),
}

// Brands Services
export const brandsAPI = {
  getAll: () => apiClient.get('/brands/'),
  getById: (id) => apiClient.get(`/brands/${id}`),
  getProducts: (id) => apiClient.get(`/brands/${id}/products`),
  create: (data) => apiClient.post('/brands/', data),
  update: (id, data) => apiClient.put(`/brands/${id}`, data),
  remove: (id) => apiClient.delete(`/brands/${id}`),
}

// Spotify Integration
export const spotifyAPI = {
  getUser: () => apiClient.get('/spotify/user'),
  linkAccount: (code) => apiClient.post('/spotify/link', { code }),
  getPlaylists: () => apiClient.get('/spotify/playlists'),
  getRecommendations: () => apiClient.get('/spotify/recommendations'),
}

// AI Services
export const aiAPI = {
  getSongRecommendation: (preferences) => apiClient.post('/ai/recommend', preferences),
  generateImage: (prompt) => apiClient.post('/ai/generate-image', { prompt }),
}

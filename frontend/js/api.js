/**
 * API Helper Module
 * Centralized API communication layer with auth token management
 */

const API_BASE = '/api';

/**
 * Get the current Firebase auth token
 * @returns {Promise<string|null>} The ID token or null
 */
async function getAuthToken() {
  const user = firebase.auth().currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/users/me')
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
async function apiRequest(endpoint, options = {}) {
  const token = await getAuthToken();

  if (!token) {
    window.location.href = '/login';
    throw new Error('Not authenticated');
  }

  const config = {
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  };

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);

    if (response.status === 401) {
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    if (error.message === 'Session expired') throw error;
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ============================================
// API Methods
// ============================================

const api = {
  // --- User Endpoints ---
  createUser: (data) => apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  getCurrentUser: () => apiRequest('/users/me'),

  getUser: (id) => apiRequest(`/users/${id}`),

  getAllUsers: () => apiRequest('/users'),

  updateUser: (id, formData) => {
    const options = { method: 'PUT' };
    if (formData instanceof FormData) {
      options.body = formData;
    } else {
      options.body = JSON.stringify(formData);
    }
    return apiRequest(`/users/${id}`, options);
  },

  getSuggestions: (id) => apiRequest(`/users/${id}/suggestions`),

  connectUser: (id) => apiRequest(`/users/${id}/connect`, {
    method: 'POST'
  }),

  getConnections: () => apiRequest('/users/me/connections'),

  // --- Post Endpoints ---
  createPost: (formData) => apiRequest('/posts', {
    method: 'POST',
    body: formData
  }),

  getPosts: (page = 1) => apiRequest(`/posts?page=${page}`),

  toggleLike: (postId) => apiRequest(`/posts/${postId}/like`, {
    method: 'POST'
  }),

  addComment: (postId, text) => apiRequest(`/posts/${postId}/comment`, {
    method: 'POST',
    body: JSON.stringify({ text })
  }),

  // --- Job Endpoints ---
  getJobs: () => apiRequest('/jobs'),

  createJob: (data) => apiRequest('/jobs', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  getJobById: (id) => apiRequest(`/jobs/${id}`),

  // --- AI Endpoints ---
  enhanceBio: (bio) => apiRequest('/ai/enhance-bio', {
    method: 'POST',
    body: JSON.stringify({ bio })
  }),

  enhanceCaption: (caption) => apiRequest('/ai/enhance-caption', {
    method: 'POST',
    body: JSON.stringify({ caption })
  }),

  // --- Notification Endpoints ---
  getNotifications: () => apiRequest('/notifications'),

  markNotificationsRead: () => apiRequest('/notifications/read', {
    method: 'PUT'
  })
};

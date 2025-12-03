const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://gittogether-backend-7p59.onrender.com/api/v1').replace(/\/+$/, '')

const normalizeEndpoint = (endpoint: string) => (endpoint.startsWith('/') ? endpoint : `/${endpoint}`)

const triggerForcedLogout = (reason?: string) => {
  if (typeof window === 'undefined') {
    return
  }
  try {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  } catch (error) {
    console.warn('Failed to clear auth storage on logout', error)
  }
  window.dispatchEvent(new CustomEvent('auth-logout', { detail: { reason } }))
  if (window.location.pathname !== '/') {
    window.location.href = '/'
  }
}

const parseJsonSafe = async (response: Response) => {
  const text = await response.text()
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch (error) {
    console.warn('Failed to parse JSON response, returning raw text.', error)
    return text
  }
}

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  const normalizedEndpoint = normalizeEndpoint(endpoint)
  const fullUrl = `${API_BASE}${normalizedEndpoint}`

  console.log('Making API call to:', fullUrl)

  const headers = new Headers(options.headers || {})

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorPayload = await parseJsonSafe(response)
    console.error('API call failed:', response.status, response.statusText, 'URL:', fullUrl, 'Payload:', errorPayload)

    if (response.status === 401) {
      triggerForcedLogout('token_expired')
      throw new Error('Your session expired. Please sign in again.')
    }

    throw new Error(typeof errorPayload === 'string' ? errorPayload : response.statusText)
  }

  return parseJsonSafe(response)
}

const buildQueryString = (params: Record<string, unknown> = {}) => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, String(item)))
    } else {
      searchParams.append(key, String(value))
    }
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export const api = {
  // Auth
  getGoogleAuthUrl: () => apiCall('/auth/google'),
  handleGoogleCallback: (code: string, state?: string) =>
    apiCall('/auth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ code, state })
    }),
  getProfile: () => apiCall('/auth/me'),
  updateProfile: (data: any) => apiCall('/auth/me', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  uploadProfileImage: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    return apiCall('/auth/me/profile-picture', {
      method: 'POST',
      body: formData,
    })
  },
  deleteProfileImage: () => apiCall('/auth/me/profile-picture', {
    method: 'DELETE',
  }),

  // Users
  getUserPublicProfile: (userId: number) => apiCall(`/users/${userId}`),

  // Posts
  getTeamPosts: (params: Record<string, unknown> = {}) => apiCall(`/posts/${buildQueryString(params)}`),
  getTeamPost: (id: number) => apiCall(`/posts/${id}`),
  createTeamPost: (data: any) => apiCall('/posts/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateTeamPost: (id: number, data: any) => apiCall(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteTeamPost: (id: number) => apiCall(`/posts/${id}`, {
    method: 'DELETE',
  }),
  getMyPosts: () => apiCall('/posts/my'),

  // Requests
  createTeamRequest: (postId: number, message?: string) => apiCall('/requests/', {
    method: 'POST',
    body: JSON.stringify({ post_id: postId, message }),
  }),
  getMyRequests: () => apiCall('/requests/sent'),
  getRequestsForMyPosts: () => apiCall('/requests/received'),
  updateTeamRequestStatus: (requestId: number, status: string, responseMessage?: string) => apiCall(`/requests/${requestId}`, {
    method: 'PUT',
    body: JSON.stringify({ status, response_message: responseMessage }),
  }),
  deleteTeamRequest: (requestId: number) => apiCall(`/requests/${requestId}`, {
    method: 'DELETE',
  }),

  // Teams & chat
  getMyTeams: () => apiCall('/teams/mine'),
  getTeamMessages: (teamId: number) => apiCall(`/teams/${teamId}/messages`),
  sendTeamMessage: (teamId: number, content: string) => apiCall(`/teams/${teamId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  }),
  removeTeamMember: (teamId: number, memberId: number) => apiCall(`/teams/${teamId}/members/${memberId}`, {
    method: 'DELETE',
  }),

  // Skills
  getSkills: () => apiCall('/posts/skills/'),
  getUserSkills: () => apiCall('/users/me/skills'),
  addUserSkill: (skillId: number) => apiCall(`/users/me/skills/${skillId}`, {
    method: 'POST'
  }),
  removeUserSkill: (skillId: number) => apiCall(`/users/me/skills/${skillId}`, {
    method: 'DELETE'
  }),
  getSkillCategories: () => apiCall('/posts/skills/categories'),

  // Dashboard
  getDashboardSummary: () => apiCall('/dashboard/summary'),
  getDashboardActivity: () => apiCall('/dashboard/activity'),
  getDashboardNotifications: () => apiCall('/dashboard/notifications'),
}
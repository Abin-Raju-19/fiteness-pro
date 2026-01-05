const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

let accessToken = null

export function setAccessToken(token) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

export function clearAccessToken() {
  accessToken = null
}

async function request(path, options = {}) {
  const headers = {
    ...(options.headers || {})
  }
  if ((options.method && options.method !== 'GET') || options.body) {
    headers['Content-Type'] = 'application/json'
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: options.credentials || 'include',
    ...options,
    headers
  })

  const contentType = res.headers.get('content-type')
  const isJson = contentType && contentType.includes('application/json')
  const data = isJson ? await res.json() : null

  if (!res.ok) {
    // If server returns 401, attempt a refresh flow once using HttpOnly cookie
    if (res.status === 401) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include'
        })
        if (refreshRes.ok) {
          const body = await refreshRes.json()
          setAccessToken(body.accessToken)
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('accessToken', body.accessToken)
          }
          // retry original request once
          return await request(path, options)
        }
      } catch {
          // ignore and fallthrough to logout
      }

      try {
        clearAccessToken()
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('accessToken')
          // Mark session expired so UI can show a modal before redirect
          window.localStorage.setItem('sessionExpired', '1')
          window.location.href = '/login'
        }
      } catch {
        // ignore
      }
    }

    const message = data?.error || data?.message || `Request failed (${res.status})`
    throw new Error(message)
  }

  return data
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body), credentials: 'include' }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body), credentials: 'include' }),
  // helper for endpoints that need explicit credentials (logout)
  postWithCredentials: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body), credentials: 'include' })
}



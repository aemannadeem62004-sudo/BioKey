import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const enrollUser = async (username, password, repetitions) => {
  const response = await api.post('/api/auth/enroll', {
    username,
    password,
    repetitions
  })
  return response.data
}

export const loginUser = async (username, password, phrase, keystrokes) => {
  const response = await api.post('/api/auth/login', {
    username,
    password,
    phrase,
    keystrokes: keystrokes.map(k => ({
      key: k.key,
      event_type: k.event_type,
      timestamp: k.timestamp
    }))
  })
  return response.data
}

export const healthCheck = async () => {
  const response = await api.get('/health')
  return response.data
}
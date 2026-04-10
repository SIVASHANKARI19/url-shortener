import api from '../utils/axios'

export const register = async ({ name, email, password }) => {
  const { data } = await api.post('/api/auth/register', { name, email, password })
  return data
}

export const login = async ({ email, password }) => {
  const { data } = await api.post('/api/auth/login', { email, password })
  return data
}
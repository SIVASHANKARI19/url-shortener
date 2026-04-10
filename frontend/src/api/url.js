import api from '../utils/axios'

export const createUrl = async ({ originalUrl, customCode }) => {
  const { data } = await api.post('/api/urls', { originalUrl, customCode })
  return data
}

export const getUrls = async () => {
  const { data } = await api.get('/api/urls')
  return data
}

export const updateUrl = async (id, payload) => {
  const { data } = await api.put(`/api/urls/${id}`, payload)
  return data
}

export const deleteUrl = async (id) => {
  const { data } = await api.delete(`/api/urls/${id}`)
  return data
}

export const getAnalytics = async (id) => {
  const { data } = await api.get(`/api/urls/${id}/analytics`)
  return data
}
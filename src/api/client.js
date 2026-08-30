import axios from 'axios'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
})

export function apiErrorMessage(error) {
  if (error?.response?.data?.validationErrors) {
    const values = Object.values(error.response.data.validationErrors)
    if (values.length) return values.join(' · ')
  }
  return error?.response?.data?.message || error?.message || 'Unexpected API error'
}

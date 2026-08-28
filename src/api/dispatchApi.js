import axios from 'axios'
import { apiErrorMessage } from './client'

export const DISPATCH_API_BASE_URL = (import.meta.env.VITE_DISPATCH_API_BASE_URL || '/dispatch-api').replace(/\/$/, '')

export const dispatchClient = axios.create({
  baseURL: DISPATCH_API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

export const dispatchApi = {
  // POST /api/v1/dispatch/seed-data - Seeds initial collection points (C1-C6), roads, and harvest batches
  seedData: async () => {
    const res = await dispatchClient.post('/api/v1/dispatch/seed-data')
    return res.data
  },

  // GET /api/v1/dispatch/next-route?truckNode=C1 - Fetches live route calculated via Max-Heap + Dijkstra
  getNextRoute: async (truckNode = 'C1') => {
    const res = await dispatchClient.get('/api/v1/dispatch/next-route', {
      params: { truckNode },
    })
    return res.data
  },

  // POST /api/v1/dispatch/calculate-route - In-memory route calculation with request payload
  calculateRoute: async (payload) => {
    const res = await dispatchClient.post('/api/v1/dispatch/calculate-route', payload)
    return res.data
  },

  // PUT /api/v1/dispatch/roads/{id}/status - Dynamic update for road open/closure or monsoon status
  updateRoadStatus: async (id, statusDto) => {
    const res = await dispatchClient.put(`/api/v1/dispatch/roads/${id}/status`, statusDto)
    return res.data
  },

  // PUT /api/v1/dispatch/batches/{id}/collect - Marks batch as COLLECTED and recalculates route from truckNode
  markBatchCollected: async (batchId, truckNode = 'C1') => {
    const res = await dispatchClient.put(`/api/v1/dispatch/batches/${batchId}/collect`, null, {
      params: { truckNode },
    })
    return res.data
  },
}

export { apiErrorMessage }

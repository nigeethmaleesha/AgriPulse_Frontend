import axios from 'axios'
import { apiErrorMessage } from './client'

// In development, Vite proxies /module4-api to the Module 4 Spring Boot app on :8081.
// Set VITE_MODULE4_API_BASE_URL to an absolute URL when deploying behind another host.
export const MODULE4_API_BASE_URL = (import.meta.env.VITE_MODULE4_API_BASE_URL || '/module4-api').replace(/\/$/, '')

export const spoilageClient = axios.create({
  baseURL: MODULE4_API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

function csvSizes(sizes) {
  return Array.isArray(sizes) ? sizes.join(',') : String(sizes || '').trim()
}

export const spoilageApi = {
  getRanking: async (method = 'merge') => (await spoilageClient.get('/api/spoilage/ranking', { params: { method } })).data,
  addBatch: async (payload) => (await spoilageClient.post('/api/spoilage/batches', payload)).data,
  runRankingBenchmark: async (sizes) => (await spoilageClient.post('/api/spoilage/benchmark', null, { params: { sizes: csvSizes(sizes) } })).data,

  reloadQueue: async () => (await spoilageClient.post('/api/spoilage/priority/reload')).data,
  getTop: async () => (await spoilageClient.get('/api/spoilage/priority/top')).data,
  popTop: async () => (await spoilageClient.post('/api/spoilage/priority/pop')).data,
  createAndEnqueue: async (payload) => (await spoilageClient.post('/api/spoilage/priority/batches', payload)).data,
  enqueueExisting: async (batchId) => (await spoilageClient.post(`/api/spoilage/priority/enqueue/${batchId}`)).data,
  refreshPriority: async (batchId) => (await spoilageClient.put(`/api/spoilage/priority/refresh/${batchId}`)).data,
  getHeap: async () => (await spoilageClient.get('/api/spoilage/priority/heap')).data,
  getOrdered: async () => (await spoilageClient.get('/api/spoilage/priority/ordered')).data,
  getStatus: async () => (await spoilageClient.get('/api/spoilage/priority/status')).data,
  clearQueue: async () => (await spoilageClient.delete('/api/spoilage/priority/clear')).data,
  getBenchmarkPresets: async () => (await spoilageClient.get('/api/spoilage/priority/benchmark/presets')).data,
  runPriorityBenchmark: async (sizes, incomingOperations) => (await spoilageClient.post('/api/spoilage/priority/benchmark', null, { params: { sizes: csvSizes(sizes), incomingOperations } })).data,
  getPriorityBenchmarkResults: async () => (await spoilageClient.get('/api/spoilage/priority/benchmark/results')).data,
}

export { apiErrorMessage }

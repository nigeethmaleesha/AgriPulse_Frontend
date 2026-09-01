import axios from 'axios'

// In development, Vite proxies /module2-api to the Module 2 Spring Boot app on :8083.
// Set VITE_MODULE2_API_BASE_URL to an absolute URL when deploying behind another host.
// NOTE: this is a dedicated client (not the shared `apiClient`) because the Module 2
// backend runs as its own Spring Boot process on its own port, separate from Module 3.
export const MODULE2_API_BASE_URL = (import.meta.env.VITE_MODULE2_API_BASE_URL || '/module2-api').replace(/\/$/, '')

export const module2Client = axios.create({
  baseURL: MODULE2_API_BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
})

export const allocationApi = {
  // Farm Management Endpoints
  registerFarm: async (farmData) => (await module2Client.post('/api/farms', farmData)).data,
  getAllFarms: async () => (await module2Client.get('/api/farms')).data,
  getFarmById: async (id) => (await module2Client.get(`/api/farms/${id}`)).data,

  // Fertilizer Request Endpoints
  createFertilizerRequest: async (dto) => (await module2Client.post('/api/fertilizer/requests', dto)).data,
  getAllFertilizerRequests: async () => (await module2Client.get('/api/fertilizer/requests')).data,
  getPendingFertilizerRequests: async () => (await module2Client.get('/api/fertilizer/requests/pending')).data,

  // Fertilizer Allocation Endpoints (Production 0/1 Knapsack & Baselines)
  allocateKnapsack: async (totalCapacity) =>
    (await module2Client.post('/api/fertilizer/allocate', { totalCapacity })).data,

  allocateFractional: async (totalCapacity) =>
    (await module2Client.post('/api/fertilizer/allocate/fractional', { totalCapacity })).data,

  allocateGreedy: async (totalCapacity) =>
    (await module2Client.post('/api/fertilizer/allocate/greedy', { totalCapacity })).data,

  getFertilizerBenchmark: async () => (await module2Client.get('/api/fertilizer/benchmark')).data,

  // Pump Allocation Benchmark Endpoints
  getPumpBenchmark: async (numberOfFarms = 2000, availablePumps = 50) =>
    (await module2Client.get('/api/pumps/benchmark', { params: { numberOfFarms, availablePumps } })).data,
}
import axios from 'axios'

const root = '/api/scheduling'

export const MODULE5_API_BASE_URL = (import.meta.env.VITE_MODULE5_API_BASE_URL || '/module5-api').replace(/\/$/, '')

export const module5Client = axios.create({
  baseURL: MODULE5_API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

export const schedulingApi = {
  runGenetic: async (payload) => (await module5Client.post(`${root}/genetic`, payload)).data,
  runAnnealing: async (payload) => (await module5Client.post(`${root}/annealing`, payload)).data,
  compareSchedules: async (payload) => (await module5Client.post(`${root}/compare`, payload)).data,
  getBenchmarkPresets: async () => (await module5Client.get(`${root}/benchmark/presets`)).data,
  // Spring binds List<Integer> sizes from repeated `sizes=10&sizes=30` query params, not the
  // `sizes[]=10&sizes[]=30` axios's default array serialization produces — build it by hand.
  runBenchmark: async (sizes) => {
    const params = new URLSearchParams()
    ;(sizes || []).forEach((s) => params.append('sizes', s))
    const query = params.toString()
    return (await module5Client.post(`${root}/benchmark${query ? `?${query}` : ''}`)).data
  },
}

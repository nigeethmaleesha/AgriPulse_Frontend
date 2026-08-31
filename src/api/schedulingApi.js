import { apiClient } from './client'

const root = '/api/scheduling'

export const schedulingApi = {
  runGenetic: async (payload) => (await apiClient.post(`${root}/genetic`, payload)).data,
  runAnnealing: async (payload) => (await apiClient.post(`${root}/annealing`, payload)).data,
  compareSchedules: async (payload) => (await apiClient.post(`${root}/compare`, payload)).data,
  getBenchmarkPresets: async () => (await apiClient.get(`${root}/benchmark/presets`)).data,
  // Spring binds List<Integer> sizes from repeated `sizes=10&sizes=30` query params, not the
  // `sizes[]=10&sizes[]=30` axios's default array serialization produces — build it by hand.
  runBenchmark: async (sizes) => {
    const params = new URLSearchParams()
    ;(sizes || []).forEach((s) => params.append('sizes', s))
    const query = params.toString()
    return (await apiClient.post(`${root}/benchmark${query ? `?${query}` : ''}`)).data
  },
}

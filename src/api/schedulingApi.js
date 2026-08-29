import { apiClient } from './client'

const root = '/api/scheduling'

export const schedulingApi = {
  runGenetic: async (payload) => (await apiClient.post(`${root}/genetic`, payload)).data,
  runAnnealing: async (payload) => (await apiClient.post(`${root}/annealing`, payload)).data,
  compareSchedules: async (payload) => (await apiClient.post(`${root}/compare`, payload)).data,
  getBenchmarkPresets: async () => (await apiClient.get(`${root}/benchmark/presets`)).data,
  runBenchmark: async (sizes) => (await apiClient.post(`${root}/benchmark`, null, { params: { sizes } })).data,
}

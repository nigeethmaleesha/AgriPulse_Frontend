import { apiClient } from './client'

const root = '/api/network'

export const networkApi = {
  getGraph: async () => (await apiClient.get(`${root}/graph`)).data,
  clearGraph: async () => (await apiClient.delete(`${root}/graph`)).data,
  loadDemoGraph: async () => (await apiClient.post(`${root}/graph/demo`)).data,
  getNodes: async () => (await apiClient.get(`${root}/nodes`)).data,
  createNode: async (payload) => (await apiClient.post(`${root}/nodes`, payload)).data,
  updateNode: async (id, payload) => (await apiClient.put(`${root}/nodes/${id}`, payload)).data,
  deleteNode: async (id) => apiClient.delete(`${root}/nodes/${id}`),

  getEdges: async () => (await apiClient.get(`${root}/edges`)).data,
  createEdge: async (payload) => (await apiClient.post(`${root}/edges`, payload)).data,
  updateEdge: async (id, payload) => (await apiClient.put(`${root}/edges/${id}`, payload)).data,
  deleteEdge: async (id) => apiClient.delete(`${root}/edges/${id}`),

  runMaxFlow: async (payload) => (await apiClient.post(`${root}/max-flow`, payload)).data,
  getMaxFlowResults: async () => (await apiClient.get(`${root}/max-flow/results`)).data,

  analyzeBottlenecks: async (payload) => (await apiClient.post(`${root}/bottlenecks/analyze`, payload)).data,
  runScenario: async (payload) => (await apiClient.post(`${root}/bottlenecks/scenario`, payload)).data,
  runScenarios: async (payload) => (await apiClient.post(`${root}/bottlenecks/scenarios`, payload)).data,
  getBottleneckPresets: async () => (await apiClient.get(`${root}/bottlenecks/presets`)).data,

  getBenchmarkPresets: async () => (await apiClient.get(`${root}/benchmark/presets`)).data,
  runMaxFlowBenchmark: async (payload) => (await apiClient.post(`${root}/benchmark`, payload)).data,
  runBottleneckBenchmark: async (payload) => (await apiClient.post(`${root}/benchmark/bottlenecks`, payload)).data,
}

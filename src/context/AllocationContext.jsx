import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { allocationApi } from '../api/allocationApi'
import { apiErrorMessage } from '../api/client'

const AllocationContext = createContext(null)

export function AllocationProvider({ children }) {
  const [farms, setFarms] = useState([])
  const [requests, setRequests] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [allocationResult, setAllocationResult] = useState(null)
  const [fertilizerBenchmark, setFertilizerBenchmark] = useState([])
  const [pumpBenchmark, setPumpBenchmark] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [backendConnected, setBackendConnected] = useState(false)

  const fetchInitialData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [farmsData, requestsData, pendingData] = await Promise.all([
        allocationApi.getAllFarms().catch(() => []),
        allocationApi.getAllFertilizerRequests().catch(() => []),
        allocationApi.getPendingFertilizerRequests().catch(() => []),
      ])
      setFarms(farmsData || [])
      setRequests(requestsData || [])
      setPendingRequests(pendingData || [])
      setBackendConnected(true)
    } catch (err) {
      setError(apiErrorMessage(err))
      setBackendConnected(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  const registerFarm = async (farmData) => {
    try {
      const savedFarm = await allocationApi.registerFarm(farmData)
      setFarms((prev) => [...prev, savedFarm])
      return savedFarm
    } catch (err) {
      throw new Error(apiErrorMessage(err))
    }
  }

  const submitFertilizerRequest = async (dto) => {
    try {
      const savedRequest = await allocationApi.createFertilizerRequest(dto)
      setRequests((prev) => [savedRequest, ...prev])
      setPendingRequests((prev) => [savedRequest, ...prev])
      await fetchInitialData()
      return savedRequest
    } catch (err) {
      throw new Error(apiErrorMessage(err))
    }
  }

  const runKnapsackAllocation = async (capacity) => {
    try {
      const result = await allocationApi.allocateKnapsack(capacity)
      setAllocationResult(result)
      await fetchInitialData()
      return result
    } catch (err) {
      throw new Error(apiErrorMessage(err))
    }
  }

  const runFertilizerBenchmark = async () => {
    try {
      const data = await allocationApi.getFertilizerBenchmark()
      setFertilizerBenchmark(data)
      return data
    } catch (err) {
      throw new Error(apiErrorMessage(err))
    }
  }

  const runPumpBenchmark = async (numberOfFarms = 2000, availablePumps = 50) => {
    try {
      const data = await allocationApi.getPumpBenchmark(numberOfFarms, availablePumps)
      setPumpBenchmark(data)
      return data
    } catch (err) {
      throw new Error(apiErrorMessage(err))
    }
  }

  const value = {
    farms,
    requests,
    pendingRequests,
    allocationResult,
    fertilizerBenchmark,
    pumpBenchmark,
    loading,
    error,
    backendConnected,
    refreshData: fetchInitialData,
    registerFarm,
    submitFertilizerRequest,
    runKnapsackAllocation,
    runFertilizerBenchmark,
    runPumpBenchmark,
  }

  return <AllocationContext.Provider value={value}>{children}</AllocationContext.Provider>
}

export function useAllocation() {
  const context = useContext(AllocationContext)
  if (!context) {
    throw new Error('useAllocation must be used within an AllocationProvider')
  }
  return context
}

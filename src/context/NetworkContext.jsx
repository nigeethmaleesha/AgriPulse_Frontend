import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { networkApi } from '../api/networkApi'
import { apiErrorMessage } from '../api/client'

const NetworkContext = createContext(null)

export function NetworkProvider({ children }) {
  const [graph, setGraph] = useState({ nodes: [], edges: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)

  const refreshGraph = useCallback(async () => {
    setLoading(true)
    try {
      const data = await networkApi.getGraph()
      setGraph({ nodes: data?.nodes || [], edges: data?.edges || [] })
      setError('')
      setLastUpdated(new Date())
      return data
    } catch (err) {
      setError(apiErrorMessage(err))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshGraph().catch(() => undefined)
  }, [refreshGraph])

  const value = useMemo(() => ({
    graph,
    loading,
    error,
    lastUpdated,
    refreshGraph,
    apiOnline: !loading && !error,
  }), [graph, loading, error, lastUpdated, refreshGraph])

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
}

export function useNetwork() {
  const value = useContext(NetworkContext)
  if (!value) throw new Error('useNetwork must be used inside NetworkProvider')
  return value
}

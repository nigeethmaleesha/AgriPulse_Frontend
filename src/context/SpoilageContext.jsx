import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { spoilageApi } from '../api/spoilageApi'

const SpoilageContext = createContext(null)

export function SpoilageProvider({ children }) {
  const [status, setStatus] = useState({ size: 0, empty: true, highestRiskBatch: null })
  const [apiOnline, setApiOnline] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  const refreshStatus = useCallback(async () => {
    setLoading(true)
    try {
      const data = await spoilageApi.getStatus()
      setStatus(data || { size: 0, empty: true, highestRiskBatch: null })
      setApiOnline(true)
      setLastUpdated(new Date())
      return data
    } catch (error) {
      setApiOnline(false)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshStatus().catch(() => undefined)
  }, [refreshStatus])

  const value = useMemo(() => ({ status, setStatus, apiOnline, loading, lastUpdated, refreshStatus }), [status, apiOnline, loading, lastUpdated, refreshStatus])
  return <SpoilageContext.Provider value={value}>{children}</SpoilageContext.Provider>
}

export function useSpoilage() {
  const value = useContext(SpoilageContext)
  if (!value) throw new Error('useSpoilage must be used inside SpoilageProvider')
  return value
}

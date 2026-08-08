import { useEffect, useMemo, useState } from 'react'
import { getBrowserOnlineState, subscribeToConnectivity } from '../services/connectivity.js'

export function useConnectivity() {
  const [browserOnline, setBrowserOnline] = useState(getBrowserOnlineState)
  const [demoMode, setDemoMode] = useState('auto')

  useEffect(() => subscribeToConnectivity(setBrowserOnline), [])

  return useMemo(() => ({
    browserOnline,
    demoMode,
    isOnline: browserOnline && demoMode !== 'offline',
    isSlow: demoMode === 'slow',
    setDemoMode,
  }), [browserOnline, demoMode])
}

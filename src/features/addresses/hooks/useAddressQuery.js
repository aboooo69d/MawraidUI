import { useEffect, useMemo, useState } from 'react'
import { isAddressSessionExpired } from '../validation'

export function useAddressQuery(load, onSessionExpired) {
  const [attempt, setAttempt] = useState(0)
  const query = useMemo(() => ({ load }), [load, attempt])
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!query.load) return
    let active = true
    async function fetchAddresses() {
      try {
        const data = await query.load()
        if (active) setResult({ query, data })
      } catch (err) {
        if (!active) return
        if (isAddressSessionExpired(err)) onSessionExpired()
        else setResult({ query, err })
      }
    }
    fetchAddresses()
    return () => {
      active = false
    }
  }, [query, onSessionExpired])

  if (!load) return {}
  if (result?.query !== query) return { loading: true }
  return { ...result, retry: () => setAttempt((count) => count + 1) }
}

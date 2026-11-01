import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'danmu-search-history'
const MAX_HISTORY = 10

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setHistory(JSON.parse(stored))
    } catch {}
  }, [])

  const addHistory = useCallback((keyword: string) => {
    const trimmed = keyword.trim()
    if (!trimmed) return

    setHistory(prev => {
      const filtered = prev.filter(h => h !== trimmed)
      const next = [trimmed, ...filtered].slice(0, MAX_HISTORY)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { history, addHistory, clearHistory }
}

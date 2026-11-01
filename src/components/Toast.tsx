import { useState, useEffect, useCallback, useRef } from 'react'

export interface ToastMessage {
  id: number
  type: 'success' | 'error' | 'info'
  text: string
}

let toastId = 0
let addToastFn: ((msg: Omit<ToastMessage, 'id'>) => void) | null = null

// 全局调用方法
export function showToast(type: ToastMessage['type'], text: string) {
  addToastFn?.({ type, text })
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const timerRefs = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const addToast = useCallback((msg: Omit<ToastMessage, 'id'>) => {
    const id = ++toastId
    setToasts(prev => [...prev, { ...msg, id }])

    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
      timerRefs.current.delete(id)
    }, 3000)
    timerRefs.current.set(id, timer)
  }, [])

  useEffect(() => {
    addToastFn = addToast
    return () => { addToastFn = null }
  }, [addToast])

  const removeToast = (id: number) => {
    const timer = timerRefs.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timerRefs.current.delete(id)
    }
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
        >
          <span className="toast-icon">
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
          </span>
          <span className="toast-text">{toast.text}</span>
        </div>
      ))}
    </div>
  )
}

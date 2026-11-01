import { useRef, useEffect } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'
import { useDanmaku } from '@/hooks/useDanmaku'

export function DanmakuCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { danmaku } = useSettingsStore()

  // 使用弹幕 hook
  useDanmaku(canvasRef)

  // 调整 canvas 大小
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (!parent) return
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  return (
    <div className="danmaku-container">
      <canvas
        ref={canvasRef}
        className="danmaku-canvas"
        style={{ opacity: danmaku.enabled ? 1 : 0 }}
      />
    </div>
  )
}

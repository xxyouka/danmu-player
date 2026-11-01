import { useRef, useEffect, useCallback } from 'react'
import { Danmaku, DanmakuSource } from '@/types/danmaku'
import { usePlayerStore } from '@/stores/playerStore'
import { useSettingsStore } from '@/stores/settingsStore'

interface DanmakuItem extends Danmaku {
  x: number
  y: number
  width: number
  speed: number
}

interface Track {
  y: number
}

// 二分查找：找到第一个 time >= target 的索引
function binarySearchAfter(danmaku: Danmaku[], target: number): number {
  let lo = 0, hi = danmaku.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (danmaku[mid].time < target) lo = mid + 1
    else hi = mid
  }
  return lo
}

const DANMAKU_CACHE_KEY = 'danmu-cache'

export function useDanmaku(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const danmakuRef = useRef<DanmakuItem[]>([])
  const animationRef = useRef<number>()
  const tracksRef = useRef<Track[]>([])
  const danmakuDataRef = useRef<Danmaku[]>([])
  const spawnedSetRef = useRef<Set<number>>(new Set())
  const loadSongIdRef = useRef<number | null>(null)
  const lastSearchIndexRef = useRef(0) // 二分查找游标

  const { currentTime, isPlaying, currentSong } = usePlayerStore()
  const { danmaku: settings } = useSettingsStore()
  const danmakuEnabled = settings.enabled

  // 初始化弹幕轨道
  const initTracks = useCallback(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const trackHeight = settings.fontSize + 6
    const trackCount = Math.floor(canvas.height / trackHeight)

    tracksRef.current = Array.from({ length: trackCount }, (_, i) => ({
      y: i * trackHeight + trackHeight / 2
    }))
  }, [canvasRef, settings.fontSize])

  // 从缓存加载弹幕
  const loadFromCache = useCallback((songId: number): Danmaku[] | null => {
    try {
      const cached = localStorage.getItem(`${DANMAKU_CACHE_KEY}-${songId}`)
      if (cached) return JSON.parse(cached)
    } catch {}
    return null
  }, [])

  // 保存弹幕到缓存
  const saveToCache = useCallback((songId: number, data: Danmaku[]) => {
    try {
      localStorage.setItem(`${DANMAKU_CACHE_KEY}-${songId}`, JSON.stringify(data))
    } catch {}
  }, [])

  // 加载弹幕数据（带竞态保护 + 缓存）
  const loadDanmaku = useCallback(async (songId: number, songName: string, artist: string) => {
    loadSongIdRef.current = songId

    // 先检查缓存
    const cached = loadFromCache(songId)
    if (cached && cached.length > 0) {
      console.log('Loaded danmaku from cache:', cached.length)
      danmakuDataRef.current = cached
      spawnedSetRef.current.clear()
      lastSearchIndexRef.current = 0
      return
    }

    try {
      console.log('Loading danmaku for:', songName, artist)
      const keyword = `${songName} ${artist}`
      const videos = await window.electronAPI.bilibiliSearch(keyword)

      if (loadSongIdRef.current !== songId) return

      if (!videos || videos.length === 0) {
        console.log('No videos found for danmaku')
        danmakuDataRef.current = []
        spawnedSetRef.current.clear()
        return
      }

      const bvid = videos[0].bvid
      console.log('Fetching danmaku from video:', bvid)
      const rawDanmaku = await window.electronAPI.bilibiliDanmaku(bvid)

      if (loadSongIdRef.current !== songId) return

      const danmaku: Danmaku[] = rawDanmaku.map((dm) => {
        const rawColor = dm.color || 16777215
        const defaultColor = rawColor === 0 ? '#ffffff' :
          rawColor === 16777215 ? '#ffffff' :
            `#${rawColor.toString(16).padStart(6, '0')}`
        return {
          time: dm.time,
          text: dm.text,
          color: defaultColor,
          source: DanmakuSource.MV
        }
      })

      console.log('Loaded', danmaku.length, 'danmaku items')
      danmakuDataRef.current = danmaku
      spawnedSetRef.current.clear()
      lastSearchIndexRef.current = 0

      // 缓存到本地
      saveToCache(songId, danmaku)
    } catch (error) {
      console.error('Load danmaku error:', error)
      if (loadSongIdRef.current === songId) {
        danmakuDataRef.current = []
        spawnedSetRef.current.clear()
      }
    }
  }, [loadFromCache, saveToCache])

  // 歌曲切换时自动加载弹幕
  useEffect(() => {
    if (!currentSong) return
    loadDanmaku(currentSong.id, currentSong.name, currentSong.artists.map(a => a.name).join(' '))
  }, [currentSong?.id, loadDanmaku])

  // 渲染弹幕（带描边）
  const render = useCallback(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 更新位置并清理已消失的弹幕
    danmakuRef.current = danmakuRef.current.filter(dm => {
      dm.x -= dm.speed
      return dm.x + dm.width > 0
    })

    // 绘制弹幕（带描边提升可读性）
    ctx.font = `bold ${settings.fontSize}px "Microsoft YaHei", sans-serif`
    ctx.globalAlpha = settings.opacity
    ctx.lineWidth = 2
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.lineJoin = 'round'

    danmakuRef.current.forEach(dm => {
      ctx.strokeText(dm.text, dm.x, dm.y)
      ctx.fillStyle = dm.color
      ctx.fillText(dm.text, dm.x, dm.y)
    })

    ctx.globalAlpha = 1

    if (isPlaying && danmakuEnabled) {
      animationRef.current = requestAnimationFrame(render)
    }
  }, [canvasRef, isPlaying, danmakuEnabled, settings.fontSize, settings.opacity, settings.speed])

  // 添加弹幕（基于实时位置的轨道检测）
  const addDanmaku = useCallback((dm: Danmaku, index: number) => {
    if (!canvasRef.current) return
    if (spawnedSetRef.current.has(index)) return
    spawnedSetRef.current.add(index)

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (tracksRef.current.length === 0) {
      initTracks()
    }
    const tracks = tracksRef.current
    if (tracks.length === 0) return

    ctx.font = `bold ${settings.fontSize}px "Microsoft YaHei", sans-serif`
    const width = ctx.measureText(dm.text).width
    const speed = 1 + settings.speed * 2

    const GAP = 20
    let bestTrack: Track | null = null
    let bestRightEdge = Infinity

    for (const track of tracks) {
      let rightEdge = 0
      for (const existing of danmakuRef.current) {
        if (existing.y === track.y) {
          const edge = existing.x + existing.width
          if (edge > rightEdge) rightEdge = edge
        }
      }
      if (rightEdge < canvas.width && rightEdge < bestRightEdge) {
        bestRightEdge = rightEdge
        bestTrack = track
      }
    }

    if (!bestTrack) return

    danmakuRef.current.push({
      ...dm,
      x: Math.max(canvas.width, bestRightEdge + GAP),
      y: bestTrack.y,
      width,
      speed
    })
  }, [canvasRef, settings, initTracks])

  // 时间更新时添加新弹幕（二分查找 + 密度控制）
  useEffect(() => {
    if (!danmakuEnabled || !isPlaying) return
    if (danmakuDataRef.current.length === 0) return

    const SOURCE_COLORS: Record<DanmakuSource, string> = {
      [DanmakuSource.MV]: '#ffffff',
      [DanmakuSource.REACTION]: '#ff69b4',
      [DanmakuSource.HOT_COMMENT]: '#ffd700',
    }

    const windowSize = 0.15 // 150ms 窗口
    const MAX_PER_FRAME = 3 // 每帧最多添加 3 条弹幕，防止密度爆炸
    let added = 0

    // 二分查找优化：只扫描时间窗口内的弹幕
    const data = danmakuDataRef.current
    const searchStart = binarySearchAfter(data, currentTime - windowSize)
    const searchEnd = binarySearchAfter(data, currentTime + windowSize)

    for (let i = searchStart; i < searchEnd && added < MAX_PER_FRAME; i++) {
      const dm = data[i]
      if (spawnedSetRef.current.has(i)) continue

      // 按来源过滤
      if (!settings.sources.includes(dm.source)) continue

      // 按来源着色
      const finalDm = settings.colorBySource
        ? { ...dm, color: SOURCE_COLORS[dm.source] || dm.color }
        : dm

      addDanmaku(finalDm, i)
      added++
    }
  }, [currentTime, danmakuEnabled, isPlaying, addDanmaku, settings.sources, settings.colorBySource])

  // 动画控制
  useEffect(() => {
    if (isPlaying && danmakuEnabled) {
      animationRef.current = requestAnimationFrame(render)
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, danmakuEnabled, render])

  // 歌曲切换时重置游标
  useEffect(() => {
    lastSearchIndexRef.current = 0
  }, [currentSong?.id])

  return { loadDanmaku }
}

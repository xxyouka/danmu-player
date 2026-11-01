import { useEffect, useCallback } from 'react'
import { usePlayerStore } from '@/stores/playerStore'
import { LyricLine } from '@/types/music'

export function useLyric() {
  const { currentSong, setLyrics, setTranslatedLyrics } = usePlayerStore()

  // 解析 LRC 歌词
  const parseLyric = useCallback((lrc: string): LyricLine[] => {
    const lines = lrc.split('\n')
    const result: LyricLine[] = []

    for (const line of lines) {
      const matches = line.matchAll(/\[(\d{1,3}):(\d{2})(?:\.(\d{1,3}))?\]/g)
      const text = line.replace(/\[(\d{1,3}):(\d{2})(?:\.(\d{1,3}))?\]/g, '').trim()

      if (!text) continue

      for (const match of matches) {
        const minutes = parseInt(match[1])
        const seconds = parseInt(match[2])
        const msStr = match[3] || '0'
        const ms = parseInt(msStr)
        const divisor = msStr.length === 1 ? 10 : msStr.length === 2 ? 100 : 1000
        const time = minutes * 60 + seconds + ms / divisor
        result.push({ time, text })
      }
    }

    return result.sort((a, b) => a.time - b.time)
  }, [])

  // 加载歌词（同时加载原文和翻译）
  useEffect(() => {
    if (!currentSong) return
    const songId = currentSong.id

    const loadLyric = async () => {
      try {
        const result = await window.electronAPI.neteaseLyric(songId)
        const lyrics = parseLyric(result.lrc)
        const translated = parseLyric(result.tlyric)
        setLyrics(lyrics)
        setTranslatedLyrics(translated)
      } catch (error) {
        console.error('Load lyric error:', error)
        setLyrics([])
        setTranslatedLyrics([])
      }
    }

    loadLyric()
  }, [currentSong?.id, parseLyric, setLyrics, setTranslatedLyrics])

  return { parseLyric }
}

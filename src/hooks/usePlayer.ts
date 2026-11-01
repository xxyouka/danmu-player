import { useRef, useEffect, useCallback } from 'react'
import { usePlayerStore } from '@/stores/playerStore'
import { showToast } from '@/components/Toast'

export function usePlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const songIdRef = useRef<number | null>(null)
  const {
    currentSong,
    volume,
    isMuted,
    setPlaying,
    setCurrentTime,
    setCurrentSong,
    setDuration,
    nextSong
  } = usePlayerStore()

  // 播放/暂停
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return
    const playing = usePlayerStore.getState().isPlaying
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(!playing)
  }, [setPlaying])

  // 跳转
  const seek = useCallback((time: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }, [setCurrentTime])

  // 音量
  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  // 歌曲切换 - 获取URL并自动播放（带竞态保护）
  useEffect(() => {
    if (!audioRef.current || !currentSong) return

    const songId = currentSong.id
    songIdRef.current = songId

    const loadAndPlay = async () => {
      let url = currentSong.url

      // 如果没有URL，自动获取
      if (!url) {
        console.log('No URL for song, fetching:', songId)
        const fetchedUrl = await window.electronAPI.neteaseSongUrl(songId)

        // 竞态检查：如果歌曲已经切换，丢弃结果
        if (songIdRef.current !== songId) return

        url = fetchedUrl || undefined
        if (url) {
          setCurrentSong({ ...currentSong, url })
        }
      }

      // 再次检查竞态
      if (songIdRef.current !== songId || !audioRef.current || !url) return

      console.log('Loading song:', url)
      audioRef.current.src = url
      audioRef.current.load()

      try {
        await audioRef.current.play()
        // 最终竞态检查
        if (songIdRef.current === songId) {
          setPlaying(true)
        }
      } catch (error) {
        console.error('Auto-play failed:', error)
        if (songIdRef.current === songId) {
          setPlaying(false)
        }
      }
    }

    loadAndPlay()
  }, [currentSong?.id])

  // 音频错误处理
  const handleError = useCallback(() => {
    if (!audioRef.current) return
    const error = audioRef.current.error
    console.error('Audio error:', error?.code, error?.message)
    setPlaying(false)
    showToast('error', '播放出错，自动跳到下一首')
    // 自动跳到下一首
    setTimeout(() => nextSong(), 1000)
  }, [nextSong, setPlaying])

  // 时间更新
  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return
    setCurrentTime(audioRef.current.currentTime)
  }, [setCurrentTime])

  // 加载完成
  const handleLoadedMetadata = useCallback(() => {
    if (!audioRef.current) return
    setDuration(audioRef.current.duration)
  }, [setDuration])

  // 播放结束
  const handleEnded = useCallback(() => {
    nextSong()
  }, [nextSong])

  return {
    audioRef,
    togglePlay,
    seek,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleEnded,
    handleError
  }
}

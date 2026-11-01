import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Song, LyricLine } from '@/types/music'

interface PlayerState {
  // 播放状态
  isPlaying: boolean
  currentSong: Song | null
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  playMode: 'sequence' | 'shuffle' | 'repeat'

  // 歌词
  lyrics: LyricLine[]
  translatedLyrics: LyricLine[]
  currentLyricIndex: number

  // 播放列表
  playlist: Song[]

  // 收藏
  favorites: Song[]

  // Actions
  setPlaying: (playing: boolean) => void
  setCurrentSong: (song: Song | null) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  setPlayMode: (mode: 'sequence' | 'shuffle' | 'repeat') => void
  setLyrics: (lyrics: LyricLine[]) => void
  setTranslatedLyrics: (lyrics: LyricLine[]) => void
  setCurrentLyricIndex: (index: number) => void
  setPlaylist: (songs: Song[]) => void
  addToPlaylist: (song: Song) => void
  removeFromPlaylist: (songId: number) => void
  clearPlaylist: () => void
  nextSong: () => void
  prevSong: () => void
  addToFavorites: (song: Song) => void
  removeFromFavorites: (songId: number) => void
  isFavorite: (songId: number) => boolean
}

export const usePlayerStore = create<PlayerState>()(persist((set, get) => ({
  isPlaying: false,
  currentSong: null,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  playMode: 'sequence',
  lyrics: [],
  translatedLyrics: [],
  currentLyricIndex: -1,
  playlist: [],
  favorites: [],

  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentSong: (song) => set({ currentSong: song, currentTime: 0, currentLyricIndex: -1 }),
  setCurrentTime: (time) => {
    const { lyrics } = get()
    let lyricIndex = -1
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (time >= lyrics[i].time) {
        lyricIndex = i
        break
      }
    }
    set({ currentTime: time, currentLyricIndex: lyricIndex })
  },
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => {
    set({ volume })
  },
  toggleMute: () => {
    const { isMuted, volume } = get()
    if (isMuted) {
      set({ isMuted: false, volume: volume === 0 ? 0.5 : volume })
    } else {
      set({ isMuted: true })
    }
  },
  setPlayMode: (mode) => set({ playMode: mode }),
  setLyrics: (lyrics) => set({ lyrics }),
  setTranslatedLyrics: (lyrics) => set({ translatedLyrics: lyrics }),
  setCurrentLyricIndex: (index) => set({ currentLyricIndex: index }),
  setPlaylist: (songs) => set({ playlist: songs }),
  addToPlaylist: (song) => {
    const { playlist } = get()
    if (!playlist.find(s => s.id === song.id)) {
      set({ playlist: [...playlist, song] })
    }
  },
  removeFromPlaylist: (songId) => {
    const { playlist, currentSong } = get()
    const newPlaylist = playlist.filter(s => s.id !== songId)
    set({ playlist: newPlaylist })

    if (currentSong?.id === songId) {
      if (newPlaylist.length > 0) {
        const currentIndex = playlist.findIndex(s => s.id === songId)
        const nextIndex = Math.min(currentIndex, newPlaylist.length - 1)
        set({ currentSong: newPlaylist[nextIndex], currentTime: 0, currentLyricIndex: -1 })
      } else {
        set({ currentSong: null, isPlaying: false, currentTime: 0, currentLyricIndex: -1 })
      }
    }
  },
  clearPlaylist: () => set({ playlist: [], currentSong: null, isPlaying: false, currentTime: 0, currentLyricIndex: -1 }),
  nextSong: () => {
    const { playlist, currentSong, playMode } = get()
    if (playlist.length === 0) return

    const currentIndex = currentSong ? playlist.findIndex(s => s.id === currentSong.id) : -1
    let nextIndex: number

    if (playMode === 'repeat') {
      nextIndex = currentIndex >= 0 ? currentIndex : 0
    } else if (playMode === 'shuffle') {
      if (playlist.length === 1) {
        nextIndex = 0
      } else {
        do {
          nextIndex = Math.floor(Math.random() * playlist.length)
        } while (nextIndex === currentIndex)
      }
    } else {
      nextIndex = currentIndex >= 0 ? (currentIndex + 1) % playlist.length : 0
    }

    set({ currentSong: playlist[nextIndex], currentTime: 0, currentLyricIndex: -1 })
  },
  prevSong: () => {
    const { playlist, currentSong } = get()
    if (playlist.length === 0) return

    const currentIndex = currentSong ? playlist.findIndex(s => s.id === currentSong.id) : -1
    const prevIndex = currentIndex >= 0
      ? (currentIndex - 1 + playlist.length) % playlist.length
      : playlist.length - 1

    set({ currentSong: playlist[prevIndex], currentTime: 0, currentLyricIndex: -1 })
  },

  // 收藏功能
  addToFavorites: (song) => {
    const { favorites } = get()
    if (!favorites.find(s => s.id === song.id)) {
      set({ favorites: [...favorites, song] })
    }
  },
  removeFromFavorites: (songId) => {
    const { favorites } = get()
    set({ favorites: favorites.filter(s => s.id !== songId) })
  },
  isFavorite: (songId) => {
    return get().favorites.some(s => s.id === songId)
  },
}), {
  name: 'danmu-player-store',
  partialize: (state) => ({
    volume: state.volume,
    isMuted: state.isMuted,
    playMode: state.playMode,
    playlist: state.playlist,
    favorites: state.favorites,
    currentSong: state.currentSong ? { ...state.currentSong, url: undefined } : null,
  })
}))

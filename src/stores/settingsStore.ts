import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DanmakuSource } from '@/types/danmaku'

interface SettingsState {
  // 界面
  theme: 'dark' | 'light'
  coverRotation: boolean
  miniMode: boolean

  // 弹幕设置
  danmaku: {
    enabled: boolean
    sources: DanmakuSource[]
    fontSize: number
    opacity: number
    speed: number
    colorBySource: boolean
  }

  // Actions
  setTheme: (theme: 'dark' | 'light') => void
  toggleCoverRotation: () => void
  toggleMiniMode: () => void
  toggleDanmaku: () => void
  updateDanmakuSettings: (settings: Partial<SettingsState['danmaku']>) => void
}

export const useSettingsStore = create<SettingsState>()(persist((set) => ({
  theme: 'dark',
  coverRotation: true,
  miniMode: false,

  danmaku: {
    enabled: true,
    sources: [DanmakuSource.MV, DanmakuSource.REACTION, DanmakuSource.HOT_COMMENT],
    fontSize: 14,
    opacity: 0.8,
    speed: 0.5,
    colorBySource: true
  },

  setTheme: (theme) => set({ theme }),
  toggleCoverRotation: () => set(state => ({ coverRotation: !state.coverRotation })),
  toggleMiniMode: () => set(state => ({ miniMode: !state.miniMode })),
  toggleDanmaku: () =>
    set(state => ({
      danmaku: { ...state.danmaku, enabled: !state.danmaku.enabled }
    })),
  updateDanmakuSettings: (settings) =>
    set(state => ({
      danmaku: { ...state.danmaku, ...settings }
    }))
}), {
  name: 'danmu-player-settings'
}))

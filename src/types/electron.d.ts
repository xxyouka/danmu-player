import { BilibiliVideo } from './danmaku'

export interface SearchResult {
  id: number
  name: string
  artists: { id: number; name: string }[]
  album: { id: number; name: string; picUrl?: string }
  duration: number
}

export interface RawDanmaku {
  time: number
  text: string
  color: number
  mode: number
}

export interface UserInfo {
  nickname: string
  avatar: string
}

export interface SongDetail {
  id: number
  name: string
  ar: { id: number; name: string }[]
  al: { id: number; name: string; picUrl: string }
  dt: number
  [key: string]: any
}

export interface ElectronAPI {
  windowMinimize: () => void
  windowMaximize: () => void
  windowClose: () => void

  neteaseSetCookie: (cookie: string) => Promise<{ success: boolean; nickname?: string; avatar?: string; message?: string }>
  neteaseSearch: (keyword: string) => Promise<SearchResult[]>
  neteaseSongUrl: (id: number) => Promise<string | null>
  neteaseSongDetail: (id: number) => Promise<SongDetail | null>
  neteaseLyric: (id: number) => Promise<{ lrc: string; tlyric: string }>
  neteaseUserInfo: () => Promise<UserInfo | null>

  bilibiliSearch: (keyword: string) => Promise<BilibiliVideo[]>
  bilibiliDanmaku: (bvid: string) => Promise<RawDanmaku[]>

  // 媒体键事件（返回清理函数）
  onMediaPlayPause: (callback: () => void) => () => void
  onMediaNext: (callback: () => void) => () => void
  onMediaPrevious: (callback: () => void) => () => void
  onMediaStop: (callback: () => void) => () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

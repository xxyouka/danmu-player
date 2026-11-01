import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // 窗口控制
  windowMinimize: () => ipcRenderer.send('window-minimize'),
  windowMaximize: () => ipcRenderer.send('window-maximize'),
  windowClose: () => ipcRenderer.send('window-close'),

  // 网易云API
  neteaseSetCookie: (cookie: string) => ipcRenderer.invoke('netease-set-cookie', cookie),
  neteaseSearch: (keyword: string) => ipcRenderer.invoke('netease-search', keyword),
  neteaseSongUrl: (id: number) => ipcRenderer.invoke('netease-song-url', id),
  neteaseSongDetail: (id: number) => ipcRenderer.invoke('netease-song-detail', id),
  neteaseLyric: (id: number) => ipcRenderer.invoke('netease-lyric', id) as Promise<{ lrc: string; tlyric: string }>,
  neteaseUserInfo: () => ipcRenderer.invoke('netease-user-info'),

  // B站API
  bilibiliSearch: (keyword: string) => ipcRenderer.invoke('bilibili-search', keyword),
  bilibiliDanmaku: (bvid: string) => ipcRenderer.invoke('bilibili-danmaku', bvid),

  // 媒体键事件（返回清理函数）
  onMediaPlayPause: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('media-play-pause', handler)
    return () => ipcRenderer.removeListener('media-play-pause', handler)
  },
  onMediaNext: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('media-next', handler)
    return () => ipcRenderer.removeListener('media-next', handler)
  },
  onMediaPrevious: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('media-previous', handler)
    return () => ipcRenderer.removeListener('media-previous', handler)
  },
  onMediaStop: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('media-stop', handler)
    return () => ipcRenderer.removeListener('media-stop', handler)
  }
})

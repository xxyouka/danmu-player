import { app, BrowserWindow, ipcMain, Tray, Menu, globalShortcut, nativeImage } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { is } from '@electron-toolkit/utils'
import { NeteaseApi } from './netease'
import { BilibiliApi } from './bilibili'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

// 窗口状态持久化
const windowStatePath = join(app.getPath('userData'), 'window-state.json')
const defaultWindowState = { width: 1200, height: 800, x: undefined as number | undefined, y: undefined as number | undefined }

function loadWindowState() {
  try {
    if (existsSync(windowStatePath)) {
      const data = JSON.parse(readFileSync(windowStatePath, 'utf-8'))
      return { ...defaultWindowState, ...data }
    }
  } catch {}
  return defaultWindowState
}

function saveWindowState() {
  if (!mainWindow || mainWindow.isDestroyed()) return
  try {
    const bounds = mainWindow.getBounds()
    writeFileSync(windowStatePath, JSON.stringify(bounds))
  } catch {}
}

function createWindow() {
  const state = loadWindowState()

  mainWindow = new BrowserWindow({
    width: state.width,
    height: state.height,
    x: state.x,
    y: state.y,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0a0a0a',
    show: false, // 先隐藏，ready-to-show 后再显示
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // 窗口准备好后显示（避免白屏闪烁）
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // 窗口关闭时保存状态
  mainWindow.on('resize', saveWindowState)
  mainWindow.on('move', saveWindowState)

  // 关闭时最小化到托盘而非退出
  mainWindow.on('close', (e) => {
    if (!(app as any).isQuitting) {
      e.preventDefault()
      mainWindow?.hide()
    }
  })

  // 加载应用
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// 系统托盘
function createTray() {
  // 尝试多个图标路径
  const iconPaths = [
    join(__dirname, '../../resources/icon.png'),
    join(__dirname, '../../build/icon.png'),
    join(app.getPath('exe'), '../resources/icon.png'),
  ]

  let icon: Electron.NativeImage | null = null
  for (const iconPath of iconPaths) {
    try {
      const img = nativeImage.createFromPath(iconPath)
      if (!img.isEmpty()) {
        icon = img
        break
      }
    } catch {}
  }

  if (!icon) {
    // 创建一个简单的绿色圆形图标作为 fallback
    icon = nativeImage.createEmpty()
  }

  tray = new Tray(icon)
  tray.setToolTip('DanmuPlayer 弹幕音乐播放器')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: () => {
        mainWindow?.show()
        mainWindow?.focus()
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        ;(app as any).isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    mainWindow?.show()
    mainWindow?.focus()
  })
}

// 媒体键支持
function registerMediaKeys() {
  const mediaKeys = [
    'MediaPlayPause',
    'MediaNextTrack',
    'MediaPreviousTrack',
    'MediaStop'
  ]

  mediaKeys.forEach(key => {
    try {
      globalShortcut.register(key, () => {
        if (!mainWindow) return
        switch (key) {
          case 'MediaPlayPause':
            mainWindow.webContents.send('media-play-pause')
            break
          case 'MediaNextTrack':
            mainWindow.webContents.send('media-next')
            break
          case 'MediaPreviousTrack':
            mainWindow.webContents.send('media-previous')
            break
          case 'MediaStop':
            mainWindow.webContents.send('media-stop')
            break
        }
      })
    } catch (e) {
      console.warn(`Failed to register ${key}:`, e)
    }
  })
}

// IPC 窗口控制（注册一次，不在 createWindow 内）
ipcMain.on('window-minimize', () => mainWindow?.minimize())
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})
ipcMain.on('window-close', () => mainWindow?.close())

// 网易云API
const neteaseApi = new NeteaseApi()

ipcMain.handle('netease-set-cookie', async (_, cookie: string) => {
  return await neteaseApi.setCookie(cookie)
})

ipcMain.handle('netease-search', async (_, keyword: string) => {
  return await neteaseApi.search(keyword)
})

ipcMain.handle('netease-song-url', async (_, id: number) => {
  return await neteaseApi.getSongUrl(id)
})

ipcMain.handle('netease-song-detail', async (_, id: number) => {
  return await neteaseApi.getSongDetail(id)
})

ipcMain.handle('netease-lyric', async (_, id: number) => {
  return await neteaseApi.getLyric(id)
})

ipcMain.handle('netease-user-info', async () => {
  return await neteaseApi.getUserInfo()
})

// B站API
const bilibiliApi = new BilibiliApi()
ipcMain.handle('bilibili-search', async (_, keyword: string) => {
  return await bilibiliApi.search(keyword)
})

ipcMain.handle('bilibili-danmaku', async (_, bvid: string) => {
  return await bilibiliApi.getDanmaku(bvid)
})

app.whenReady().then(() => {
  createWindow()
  createTray()
  registerMediaKeys()
})

app.on('window-all-closed', () => {
  // 有托盘时不退出
  if (process.platform !== 'darwin' && !tray) {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  } else {
    mainWindow?.show()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

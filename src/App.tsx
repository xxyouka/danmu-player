import { useEffect, useState } from 'react'
import { AlbumCover } from './components/AlbumCover'
import { SongInfo } from './components/SongInfo'
import { DanmakuCanvas } from './components/DanmakuCanvas'
import { PlayerControls } from './components/PlayerControls'
import { LyricDisplay } from './components/LyricDisplay'
import { Sidebar } from './components/Sidebar'
import { LoginPanel } from './components/LoginPanel'
import { ToastContainer } from './components/Toast'
import { ShareButton } from './components/ShareButton'
import { usePlayer } from './hooks/usePlayer'
import { useLyric } from './hooks/useLyric'
import { usePlayerStore } from './stores/playerStore'
import { useSettingsStore } from './stores/settingsStore'

export default function App() {
  const { audioRef, seek, handleTimeUpdate, handleLoadedMetadata, handleEnded, handleError } = usePlayer()
  useLyric()

  const { currentSong } = usePlayerStore()
  const { theme, miniMode, toggleMiniMode } = useSettingsStore()

  // 应用主题
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // 登录状态
  const [showLogin, setShowLogin] = useState(false)
  const [userInfo, setUserInfo] = useState<{ nickname: string; avatar: string } | null>(null)

  // 启动时恢复登录状态
  useEffect(() => {
    window.electronAPI.neteaseUserInfo().then(info => {
      if (info) setUserInfo(info)
    }).catch(() => {})
  }, [])

  // 快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          {
            const playing = usePlayerStore.getState().isPlaying
            usePlayerStore.getState().setPlaying(!playing)
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          usePlayerStore.getState().nextSong()
          break
        case 'ArrowLeft':
          e.preventDefault()
          usePlayerStore.getState().prevSong()
          break
        case 'ArrowUp':
          e.preventDefault()
          {
            const vol = usePlayerStore.getState().volume
            usePlayerStore.getState().setVolume(Math.min(1, vol + 0.05))
          }
          break
        case 'ArrowDown':
          e.preventDefault()
          {
            const vol = usePlayerStore.getState().volume
            usePlayerStore.getState().setVolume(Math.max(0, vol - 0.05))
          }
          break
        case 'm':
        case 'M':
          usePlayerStore.getState().toggleMute()
          break
        case 'd':
        case 'D':
          useSettingsStore.getState().toggleDanmaku()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // 媒体键事件监听
  useEffect(() => {
    const cleanups = [
      window.electronAPI.onMediaPlayPause(() => {
        const playing = usePlayerStore.getState().isPlaying
        usePlayerStore.getState().setPlaying(!playing)
      }),
      window.electronAPI.onMediaNext(() => {
        usePlayerStore.getState().nextSong()
      }),
      window.electronAPI.onMediaPrevious(() => {
        usePlayerStore.getState().prevSong()
      }),
      window.electronAPI.onMediaStop(() => {
        usePlayerStore.getState().setPlaying(false)
      }),
    ]
    return () => cleanups.forEach(fn => fn())
  }, [])

  return (
    <div className={`app ${miniMode ? 'mini-mode' : ''}`}>
      {/* 背景 */}
      <div
        className="background"
        style={{
          backgroundImage: currentSong?.album?.picUrl
            ? `url(${currentSong.album.picUrl})`
            : 'none'
        }}
      />

      {/* 标题栏 */}
      <div className="titlebar">
        <div className="titlebar-drag">
          <span className="titlebar-title">DanmuPlayer</span>
        </div>
        <div className="login-status">
          {userInfo ? (
            <div className="user-info">
              {userInfo.avatar && <img src={userInfo.avatar} alt="" className="user-avatar" />}
              <span className="user-name">{userInfo.nickname}</span>
            </div>
          ) : (
            <button className="login-btn-small" onClick={() => setShowLogin(true)}>
              登录
            </button>
          )}
        </div>
        <div className="titlebar-buttons">
          <button className="titlebar-button" onClick={toggleMiniMode} title={miniMode ? '展开' : '迷你模式'}>
            {miniMode ? '□' : '—'}
          </button>
          <button className="titlebar-button" onClick={() => window.electronAPI.windowMinimize()}>─</button>
          <button className="titlebar-button" onClick={() => window.electronAPI.windowMaximize()}>□</button>
          <button className="titlebar-button close" onClick={() => window.electronAPI.windowClose()}>×</button>
        </div>
      </div>

      {/* 主内容 */}
      {!miniMode && (
        <div className="main-content">
          <Sidebar />

          <div className="center-area">
            <div className="cover-section">
              <AlbumCover />
              <SongInfo />
              <ShareButton />
            </div>

            <div className="danmaku-section">
              <DanmakuCanvas />
            </div>

            <div className="lyric-section">
              <LyricDisplay onSeek={seek} />
            </div>
          </div>
        </div>
      )}

      {/* 迷你模式：只显示歌曲信息 */}
      {miniMode && (
        <div className="mini-content">
          <div className="mini-info">
            {currentSong?.album?.picUrl && (
              <img src={currentSong.album.picUrl} alt="" className="mini-cover" />
            )}
            <div className="mini-text">
              <div className="mini-name">{currentSong?.name || '未播放'}</div>
              <div className="mini-artist">
                {currentSong?.artists?.map(a => a.name).join(' / ') || '-'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 底部播放控制 */}
      <div className="bottom-bar">
        <PlayerControls />
      </div>

      {/* 隐藏的音频元素 */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={handleError}
      />

      {/* 登录面板 */}
      <LoginPanel
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={(nickname, avatar) => setUserInfo({ nickname, avatar })}
      />

      {/* Toast 通知 */}
      <ToastContainer />
    </div>
  )
}

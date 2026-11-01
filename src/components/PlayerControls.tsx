import { usePlayerStore } from '@/stores/playerStore'
import { usePlayer } from '@/hooks/usePlayer'
import { showToast } from './Toast'

export function PlayerControls() {
  const {
    isPlaying, currentTime, duration, volume, isMuted, playMode,
    currentSong, isFavorite, addToFavorites, removeFromFavorites
  } = usePlayerStore()
  const { togglePlay, seek } = usePlayer()
  const { setVolume, toggleMute, setPlayMode, nextSong, prevSong } = usePlayerStore()

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
    const sec = Math.floor(seconds % 60)
    return `${min}:${sec.toString().padStart(2, '0')}`
  }

  const handleToggleFavorite = () => {
    if (!currentSong) return
    if (isFavorite(currentSong.id)) {
      removeFromFavorites(currentSong.id)
      showToast('info', '已取消收藏')
    } else {
      addToFavorites(currentSong)
      showToast('success', '已收藏')
    }
  }

  return (
    <div className="player-controls">
      {/* 进度条 */}
      <div className="progress-bar">
        <span className="time">{formatTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime || 0}
          onChange={(e) => seek(Number(e.target.value))}
          className="progress-slider"
          style={{ '--progress': `${duration ? (currentTime / duration) * 100 : 0}%` } as React.CSSProperties}
        />
        <span className="time">{formatTime(duration)}</span>
      </div>

      {/* 控制按钮 */}
      <div className="controls">
        <div className="controls-left">
          <button
            className={`mode-btn active`}
            onClick={() => {
              const modes: Array<'sequence' | 'shuffle' | 'repeat'> = ['sequence', 'shuffle', 'repeat']
              const currentIndex = modes.indexOf(playMode)
              setPlayMode(modes[(currentIndex + 1) % modes.length])
            }}
          >
            {playMode === 'sequence' ? '↻' : playMode === 'shuffle' ? '⤮' : '⟳'}
          </button>
        </div>

        <div className="controls-center">
          <button className="control-btn" onClick={prevSong}>
            ⏮
          </button>
          <button className="play-btn" onClick={togglePlay}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button className="control-btn" onClick={nextSong}>
            ⏭
          </button>
        </div>

        <div className="controls-right">
          <button
            className={`fav-btn ${currentSong && isFavorite(currentSong.id) ? 'active' : ''}`}
            onClick={handleToggleFavorite}
            title={currentSong && isFavorite(currentSong.id) ? '取消收藏' : '收藏'}
          >
            {currentSong && isFavorite(currentSong.id) ? '❤' : '♡'}
          </button>
          <button className="volume-btn" onClick={toggleMute}>
            {isMuted ? '🔇' : volume > 0.5 ? '🔊' : volume > 0 ? '🔉' : '🔇'}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="volume-slider"
          />
        </div>
      </div>
    </div>
  )
}

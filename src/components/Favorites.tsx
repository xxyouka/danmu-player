import { usePlayerStore } from '@/stores/playerStore'
import { Song } from '@/types/music'
import { showToast } from './Toast'
import { useSongContextMenu, ContextMenu } from './ContextMenu'

export function Favorites() {
  const { favorites, currentSong, setCurrentSong, setPlaying, addToPlaylist, removeFromFavorites } = usePlayerStore()
  const { showSongMenu } = useSongContextMenu()

  const handlePlay = (song: Song) => {
    setCurrentSong(song)
    addToPlaylist(song)
    setPlaying(true)
    showToast('success', `正在播放: ${song.name}`)
  }

  const handleRemove = (e: React.MouseEvent, songId: number) => {
    e.stopPropagation()
    removeFromFavorites(songId)
    showToast('info', '已取消收藏')
  }

  const handleContextMenu = (e: React.MouseEvent, song: Song) => {
    showSongMenu(e, song, {
      onPlay: () => handlePlay(song),
      onAddToPlaylist: () => { addToPlaylist(song); showToast('info', '已添加到播放列表') },
      onToggleFavorite: () => { removeFromFavorites(song.id); showToast('info', '已取消收藏') },
      isFavorite: true,
    })
  }

  return (
    <div className="playlist">
      <div className="playlist-header">
        <h3>我的收藏</h3>
        <span className="playlist-count">{favorites.length} 首</span>
      </div>

      <div className="playlist-songs">
        {favorites.map((song, index) => (
          <div
            key={song.id}
            className={`playlist-item ${currentSong?.id === song.id ? 'active' : ''}`}
            onClick={() => handlePlay(song)}
            onContextMenu={(e) => handleContextMenu(e, song)}
          >
            <span className="playlist-index">{index + 1}</span>
            <div className="playlist-info">
              <div className="playlist-name">{song.name}</div>
              <div className="playlist-artist">
                {song.artists.map(a => a.name).join(' / ')}
              </div>
            </div>
            <button
              className="playlist-remove"
              onClick={(e) => handleRemove(e, song.id)}
              title="取消收藏"
            >
              ×
            </button>
          </div>
        ))}

        {favorites.length === 0 && (
          <div className="playlist-empty">
            暂无收藏，播放歌曲时点击 ❤ 收藏
          </div>
        )}
      </div>

      <ContextMenu />
    </div>
  )
}

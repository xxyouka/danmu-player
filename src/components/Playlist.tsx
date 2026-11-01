import { usePlayerStore } from '@/stores/playerStore'
import { Song } from '@/types/music'
import { showToast } from './Toast'
import { useSongContextMenu, ContextMenu } from './ContextMenu'

export function Playlist() {
  const {
    playlist, currentSong, setCurrentSong, setPlaying, removeFromPlaylist,
    clearPlaylist, addToFavorites, removeFromFavorites, isFavorite, addToPlaylist
  } = usePlayerStore()
  const { showSongMenu } = useSongContextMenu()

  const handlePlay = (song: Song) => {
    setCurrentSong(song)
    setPlaying(true)
  }

  const handleRemove = (e: React.MouseEvent, songId: number) => {
    e.stopPropagation()
    removeFromPlaylist(songId)
  }

  const handleClear = () => {
    clearPlaylist()
    showToast('info', '播放列表已清空')
  }

  const handleContextMenu = (e: React.MouseEvent, song: Song) => {
    showSongMenu(e, song, {
      onPlay: () => handlePlay(song),
      onAddToPlaylist: () => { addToPlaylist(song); showToast('info', '已添加到播放列表') },
      onToggleFavorite: () => {
        if (isFavorite(song.id)) {
          removeFromFavorites(song.id)
          showToast('info', '已取消收藏')
        } else {
          addToFavorites(song)
          showToast('success', '已收藏')
        }
      },
      isFavorite: isFavorite(song.id),
      onRemove: () => removeFromPlaylist(song.id),
    })
  }

  return (
    <div className="playlist">
      <div className="playlist-header">
        <h3>播放列表</h3>
        <div className="playlist-actions">
          <span className="playlist-count">{playlist.length} 首</span>
          {playlist.length > 0 && (
            <button className="playlist-clear" onClick={handleClear} title="清空列表">
              清空
            </button>
          )}
        </div>
      </div>

      <div className="playlist-songs">
        {playlist.map((song, index) => (
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
              title="移除"
            >
              ×
            </button>
          </div>
        ))}

        {playlist.length === 0 && (
          <div className="playlist-empty">
            暂无歌曲，请搜索添加
          </div>
        )}
      </div>

      <ContextMenu />
    </div>
  )
}

import { usePlayerStore } from '@/stores/playerStore'

export function SongInfo() {
  const { currentSong } = usePlayerStore()

  if (!currentSong) {
    return (
      <div className="song-info">
        <div className="song-name">未播放歌曲</div>
        <div className="song-artist">-</div>
      </div>
    )
  }

  const artistNames = currentSong.artists.map(a => a.name).join(' / ')

  return (
    <div className="song-info">
      <div className="song-name">{currentSong.name}</div>
      <div className="song-artist">{artistNames}</div>
      <div className="song-album">{currentSong.album.name}</div>
    </div>
  )
}

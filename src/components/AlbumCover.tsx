import { usePlayerStore } from '@/stores/playerStore'
import { useSettingsStore } from '@/stores/settingsStore'

export function AlbumCover() {
  const { currentSong, isPlaying } = usePlayerStore()
  const { coverRotation } = useSettingsStore()

  const coverUrl = currentSong?.album?.picUrl
  const isRotating = isPlaying && coverRotation

  return (
    <div className="album-cover">
      <div className={`cover-wrapper ${isRotating ? 'rotating' : ''}`}>
        {coverUrl ? (
          <img src={coverUrl} alt={currentSong?.album?.name} />
        ) : (
          <div className="cover-placeholder">
            <span>♪</span>
          </div>
        )}
      </div>
    </div>
  )
}

import { usePlayerStore } from '@/stores/playerStore'
import { showToast } from './Toast'

export function ShareButton() {
  const { currentSong } = usePlayerStore()

  const handleShare = async () => {
    if (!currentSong) {
      showToast('info', '请先播放一首歌曲')
      return
    }

    const artists = currentSong.artists.map(a => a.name).join(' / ')
    const text = `🎵 ${currentSong.name} - ${artists}\n💿 ${currentSong.album.name}\n\n— DanmuPlayer 弹幕音乐播放器`

    try {
      await navigator.clipboard.writeText(text)
      showToast('success', '歌曲信息已复制到剪贴板')
    } catch {
      // fallback
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      showToast('success', '歌曲信息已复制到剪贴板')
    }
  }

  return (
    <button
      className="share-btn"
      onClick={handleShare}
      title="分享歌曲"
      disabled={!currentSong}
    >
      📤
    </button>
  )
}

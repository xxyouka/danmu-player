import { useState, useCallback, useRef, useEffect } from 'react'
import { usePlayerStore } from '@/stores/playerStore'
import { Song } from '@/types/music'
import { SearchResult } from '@/types/electron'
import { showToast } from './Toast'
import { useSearchHistory } from '@/hooks/useSearchHistory'
import { useSongContextMenu, ContextMenu } from './ContextMenu'

export function SearchPanel() {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [playingId, setPlayingId] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const { setCurrentSong, addToPlaylist, setPlaying, isFavorite, addToFavorites, removeFromFavorites } = usePlayerStore()
  const { history, addHistory, clearHistory } = useSearchHistory()
  const { showSongMenu } = useSongContextMenu()
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const keywordRef = useRef(keyword)
  keywordRef.current = keyword
  const resultRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    return () => clearTimeout(searchTimerRef.current)
  }, [])

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return

    setLoading(true)
    setSelectedIndex(-1)
    addHistory(query)
    try {
      const songs = await window.electronAPI.neteaseSearch(query)
      setResults(songs)
      if (songs.length === 0) {
        showToast('info', '未找到相关歌曲')
      }
    } catch (err) {
      console.error('Search error:', err)
      setResults([])
      showToast('error', '搜索失败，请重试')
    } finally {
      setLoading(false)
    }
  }, [addHistory])

  const handleInputChange = (value: string) => {
    setKeyword(value)
    clearTimeout(searchTimerRef.current)
    if (value.trim()) {
      searchTimerRef.current = setTimeout(() => handleSearch(value), 500)
    } else {
      setResults([])
    }
  }

  const handleHistoryClick = (term: string) => {
    setKeyword(term)
    handleSearch(term)
  }

  const handlePlay = useCallback(async (song: SearchResult) => {
    if (playingId) return
    setPlayingId(song.id)

    try {
      const url = await window.electronAPI.neteaseSongUrl(song.id)
      if (!url) {
        showToast('error', '无法获取歌曲链接')
        setPlayingId(null)
        return
      }

      const songData: Song = {
        id: song.id,
        name: song.name,
        artists: song.artists?.map(a => ({ id: a.id, name: a.name })) || [{ id: 0, name: '未知' }],
        album: {
          id: song.album?.id || 0,
          name: song.album?.name || '未知专辑',
          picUrl: song.album?.picUrl || ''
        },
        duration: (song.duration || 0) / 1000,
        url
      }

      setCurrentSong(songData)
      addToPlaylist(songData)
      setPlaying(true)
      showToast('success', `正在播放: ${songData.name}`)
    } catch (err) {
      console.error('Play error:', err)
      showToast('error', '播放失败，请重试')
    } finally {
      setPlayingId(null)
    }
  }, [playingId, setCurrentSong, addToPlaylist, setPlaying])

  const handleContextMenu = (e: React.MouseEvent, song: SearchResult) => {
    e.preventDefault()
    const songData: Song = {
      id: song.id,
      name: song.name,
      artists: song.artists?.map(a => ({ id: a.id, name: a.name })) || [{ id: 0, name: '未知' }],
      album: { id: song.album?.id || 0, name: song.album?.name || '未知专辑', picUrl: song.album?.picUrl || '' },
      duration: (song.duration || 0) / 1000,
    }
    showSongMenu(e, songData, {
      onPlay: () => handlePlay(song),
      onAddToPlaylist: () => { addToPlaylist(songData); showToast('info', '已添加到播放列表') },
      onToggleFavorite: () => {
        if (isFavorite(song.id)) {
          removeFromFavorites(song.id)
          showToast('info', '已取消收藏')
        } else {
          addToFavorites(songData)
          showToast('success', '已收藏')
        }
      },
      isFavorite: isFavorite(song.id),
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      clearTimeout(searchTimerRef.current)
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handlePlay(results[selectedIndex])
      } else {
        handleSearch(keywordRef.current)
      }
      return
    }

    if (results.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => {
        const next = prev < results.length - 1 ? prev + 1 : 0
        resultRefs.current[next]?.scrollIntoView({ block: 'nearest' })
        return next
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => {
        const next = prev > 0 ? prev - 1 : results.length - 1
        resultRefs.current[next]?.scrollIntoView({ block: 'nearest' })
        return next
      })
    }
  }

  const formatDuration = (ms: number) => {
    const min = Math.floor(ms / 60000)
    const sec = Math.floor((ms % 60000) / 1000)
    return `${min}:${String(sec).padStart(2, '0')}`
  }

  const showHistory = !keyword.trim() && results.length === 0 && history.length > 0

  return (
    <div className="search-panel">
      <div className="search-box">
        <input
          type="text"
          placeholder="搜索歌曲、歌手..."
          value={keyword}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={() => handleSearch(keywordRef.current)} disabled={loading}>
          {loading ? '...' : '🔍'}
        </button>
      </div>

      {/* 搜索历史 */}
      {showHistory && (
        <div className="search-history">
          <div className="search-history-header">
            <span>最近搜索</span>
            <button className="search-history-clear" onClick={clearHistory}>清空</button>
          </div>
          {history.map((term, i) => (
            <div
              key={i}
              className="search-history-item"
              onClick={() => handleHistoryClick(term)}
            >
              <span className="search-history-icon">🕐</span>
              <span>{term}</span>
            </div>
          ))}
        </div>
      )}

      <div className="search-results">
        {results.map((song, index) => (
          <div
            key={song.id}
            ref={el => { resultRefs.current[index] = el }}
            className={`song-item ${playingId === song.id ? 'playing' : ''} ${selectedIndex === index ? 'selected' : ''}`}
            onClick={() => handlePlay(song)}
            onMouseEnter={() => setSelectedIndex(index)}
            onContextMenu={(e) => handleContextMenu(e, song)}
          >
            <div className="song-item-info">
              <div className="song-item-name">{song.name}</div>
              <div className="song-item-artist">
                {song.artists.map(a => a.name).join(' / ')}
              </div>
            </div>
            <div className="song-item-duration">
              {playingId === song.id ? '...' : formatDuration(song.duration)}
            </div>
          </div>
        ))}

        {!loading && results.length === 0 && keyword.trim() && (
          <div className="playlist-empty">未找到相关歌曲</div>
        )}

        {!loading && results.length === 0 && !keyword.trim() && history.length === 0 && (
          <div className="playlist-empty">输入关键词搜索音乐</div>
        )}
      </div>

      <ContextMenu />
    </div>
  )
}

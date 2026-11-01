import { useRef, useEffect } from 'react'
import { usePlayerStore } from '@/stores/playerStore'

interface LyricDisplayProps {
  onSeek?: (time: number) => void
}

export function LyricDisplay({ onSeek }: LyricDisplayProps) {
  const { lyrics, translatedLyrics, currentLyricIndex } = usePlayerStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const isAutoScrollRef = useRef(true)

  // 用户手动滚动时暂停自动滚动
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let scrollTimeout: ReturnType<typeof setTimeout>
    const handleScroll = () => {
      isAutoScrollRef.current = false
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        isAutoScrollRef.current = true
      }, 5000)
    }

    container.addEventListener('scroll', handleScroll)
    return () => {
      container.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  // 自动滚动到当前歌词
  useEffect(() => {
    if (!containerRef.current || currentLyricIndex < 0 || !isAutoScrollRef.current) return

    const currentLine = containerRef.current.children[currentLyricIndex] as HTMLElement
    if (currentLine) {
      currentLine.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [currentLyricIndex])

  const handleClick = (time: number) => {
    onSeek?.(time)
    isAutoScrollRef.current = true
  }

  // 查找当前时间对应的翻译歌词
  const getTranslatedLine = (index: number): string | null => {
    if (translatedLyrics.length === 0 || !lyrics[index]) return null
    const time = lyrics[index].time
    const translated = translatedLyrics.find(t => Math.abs(t.time - time) < 0.5)
    return translated?.text || null
  }

  if (lyrics.length === 0) {
    return (
      <div className="lyric-display">
        <div className="lyric-placeholder">暂无歌词</div>
      </div>
    )
  }

  return (
    <div className="lyric-display" ref={containerRef}>
      {lyrics.map((line, index) => {
        const translated = getTranslatedLine(index)
        return (
          <div
            key={index}
            className={`lyric-line ${index === currentLyricIndex ? 'active' : ''} ${
              index < currentLyricIndex ? 'past' : ''
            } ${onSeek ? 'clickable' : ''}`}
            onClick={() => handleClick(line.time)}
          >
            <div className="lyric-text">{line.text}</div>
            {translated && <div className="lyric-translated">{translated}</div>}
          </div>
        )
      })}
    </div>
  )
}

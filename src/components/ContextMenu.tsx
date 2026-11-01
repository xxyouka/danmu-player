import { useEffect, useRef, useState, useCallback } from 'react'
import { Song } from '@/types/music'

export interface ContextMenuAction {
  label: string
  icon?: string
  onClick: () => void
  danger?: boolean
}

interface ContextMenuState {
  x: number
  y: number
  actions: ContextMenuAction[]
}

let showMenuFn: ((x: number, y: number, actions: ContextMenuAction[]) => void) | null = null

export function showContextMenu(x: number, y: number, actions: ContextMenuAction[]) {
  showMenuFn?.(x, y, actions)
}

export function ContextMenu() {
  const [menu, setMenu] = useState<ContextMenuState | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const showMenu = useCallback((x: number, y: number, actions: ContextMenuAction[]) => {
    // 确保菜单不超出窗口
    const maxX = window.innerWidth - 180
    const maxY = window.innerHeight - actions.length * 36 - 16
    setMenu({
      x: Math.min(x, maxX),
      y: Math.min(y, maxY),
      actions
    })
  }, [])

  useEffect(() => {
    showMenuFn = showMenu
    return () => { showMenuFn = null }
  }, [showMenu])

  // 点击外部关闭
  useEffect(() => {
    if (!menu) return
    const handleClick = () => setMenu(null)
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(null) }
    window.addEventListener('click', handleClick)
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('click', handleClick)
      window.removeEventListener('keydown', handleKey)
    }
  }, [menu])

  if (!menu) return null

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ left: menu.x, top: menu.y }}
    >
      {menu.actions.map((action, i) => (
        <div
          key={i}
          className={`context-menu-item ${action.danger ? 'danger' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            action.onClick()
            setMenu(null)
          }}
        >
          {action.icon && <span className="context-menu-icon">{action.icon}</span>}
          <span>{action.label}</span>
        </div>
      ))}
    </div>
  )
}

// 歌曲右键菜单工具函数
export function useSongContextMenu() {
  const showSongMenu = useCallback((
    e: React.MouseEvent,
    _song: Song,
    options: {
      onPlay: () => void
      onAddToPlaylist: () => void
      onToggleFavorite: () => void
      isFavorite: boolean
      onRemove?: () => void
    }
  ) => {
    e.preventDefault()
    e.stopPropagation()

    const actions: ContextMenuAction[] = [
      { label: '立即播放', icon: '▶', onClick: options.onPlay },
      { label: '添加到播放列表', icon: '+', onClick: options.onAddToPlaylist },
      {
        label: options.isFavorite ? '取消收藏' : '收藏',
        icon: options.isFavorite ? '💔' : '❤',
        onClick: options.onToggleFavorite
      },
    ]

    if (options.onRemove) {
      actions.push({
        label: '从列表移除',
        icon: '✕',
        onClick: options.onRemove,
        danger: true
      })
    }

    showContextMenu(e.clientX, e.clientY, actions)
  }, [])

  return { showSongMenu }
}

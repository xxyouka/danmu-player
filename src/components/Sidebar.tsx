import { useState } from 'react'
import { SearchPanel } from './SearchPanel'
import { Playlist } from './Playlist'
import { Favorites } from './Favorites'
import { SettingsPanel } from './SettingsPanel'

type SidebarTab = 'search' | 'playlist' | 'favorites' | 'settings' | null

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<SidebarTab>(null)

  const toggleTab = (tab: SidebarTab) => {
    setActiveTab(activeTab === tab ? null : tab)
  }

  return (
    <>
      <div className="sidebar">
        <button
          className={`sidebar-btn ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => toggleTab('search')}
          title="搜索"
        >
          🔍
        </button>
        <button
          className={`sidebar-btn ${activeTab === 'playlist' ? 'active' : ''}`}
          onClick={() => toggleTab('playlist')}
          title="播放列表"
        >
          📋
        </button>
        <button
          className={`sidebar-btn ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => toggleTab('favorites')}
          title="我的收藏"
        >
          ❤
        </button>
        <button
          className={`sidebar-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => toggleTab('settings')}
          title="设置"
        >
          ⚙️
        </button>
      </div>

      {activeTab === 'search' && (
        <div className="sidebar-panel">
          <SearchPanel />
        </div>
      )}

      {activeTab === 'playlist' && (
        <div className="sidebar-panel">
          <Playlist />
        </div>
      )}

      {activeTab === 'favorites' && (
        <div className="sidebar-panel">
          <Favorites />
        </div>
      )}

      <SettingsPanel
        isOpen={activeTab === 'settings'}
        onClose={() => setActiveTab(null)}
      />
    </>
  )
}

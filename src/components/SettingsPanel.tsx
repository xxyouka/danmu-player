import { useSettingsStore } from '@/stores/settingsStore'
import { usePlayerStore } from '@/stores/playerStore'
import { DanmakuSource } from '@/types/danmaku'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { theme, coverRotation, danmaku, setTheme, toggleCoverRotation, toggleDanmaku, updateDanmakuSettings } = useSettingsStore()
  const { playMode, setPlayMode } = usePlayerStore()

  if (!isOpen) return null

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>设置</h2>
          <button className="settings-close" onClick={onClose}>×</button>
        </div>

        <div className="settings-content">
          {/* 播放设置 */}
          <div className="settings-section">
            <h3>播放</h3>
            <div className="settings-item">
              <label>播放模式</label>
              <div className="settings-options">
                {(['sequence', 'shuffle', 'repeat'] as const).map((mode) => (
                  <button
                    key={mode}
                    className={`option-btn ${playMode === mode ? 'active' : ''}`}
                    onClick={() => setPlayMode(mode)}
                  >
                    {mode === 'sequence' ? '顺序' : mode === 'shuffle' ? '随机' : '单曲'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 弹幕设置 */}
          <div className="settings-section">
            <h3>弹幕</h3>
            <div className="settings-item">
              <label>弹幕开关</label>
              <div className="settings-toggle">
                <button
                  className={`toggle-btn ${danmaku.enabled ? 'active' : ''}`}
                  onClick={toggleDanmaku}
                >
                  {danmaku.enabled ? '开' : '关'}
                </button>
              </div>
            </div>

            <div className="settings-item">
              <label>弹幕来源</label>
              <div className="settings-checkboxes">
                {[
                  { source: DanmakuSource.MV, label: '官方MV' },
                  { source: DanmakuSource.REACTION, label: 'Reaction' },
                  { source: DanmakuSource.HOT_COMMENT, label: '热评' }
                ].map(({ source, label }) => (
                  <label key={source} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={danmaku.sources.includes(source)}
                      onChange={(e) => {
                        const sources = e.target.checked
                          ? [...danmaku.sources, source]
                          : danmaku.sources.filter(s => s !== source)
                        updateDanmakuSettings({ sources })
                      }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="settings-item">
              <label>弹幕字号</label>
              <input
                type="range"
                min={12}
                max={24}
                value={danmaku.fontSize}
                onChange={(e) => updateDanmakuSettings({ fontSize: Number(e.target.value) })}
              />
              <span>{danmaku.fontSize}px</span>
            </div>

            <div className="settings-item">
              <label>透明度</label>
              <input
                type="range"
                min={0.3}
                max={1}
                step={0.1}
                value={danmaku.opacity}
                onChange={(e) => updateDanmakuSettings({ opacity: Number(e.target.value) })}
              />
              <span>{Math.round(danmaku.opacity * 100)}%</span>
            </div>

            <div className="settings-item">
              <label>滚动速度</label>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.1}
                value={danmaku.speed}
                onChange={(e) => updateDanmakuSettings({ speed: Number(e.target.value) })}
              />
              <span>{Math.round(danmaku.speed * 100)}%</span>
            </div>

            <div className="settings-item">
              <label>颜色区分来源</label>
              <div className="settings-toggle">
                <button
                  className={`toggle-btn ${danmaku.colorBySource ? 'active' : ''}`}
                  onClick={() => updateDanmakuSettings({ colorBySource: !danmaku.colorBySource })}
                >
                  {danmaku.colorBySource ? '开' : '关'}
                </button>
              </div>
            </div>
          </div>

          {/* 界面设置 */}
          <div className="settings-section">
            <h3>界面</h3>
            <div className="settings-item">
              <label>主题</label>
              <div className="settings-options">
                <button
                  className={`option-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  深色
                </button>
                <button
                  className={`option-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  浅色
                </button>
              </div>
            </div>

            <div className="settings-item">
              <label>封面旋转</label>
              <div className="settings-toggle">
                <button
                  className={`toggle-btn ${coverRotation ? 'active' : ''}`}
                  onClick={toggleCoverRotation}
                >
                  {coverRotation ? '开' : '关'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

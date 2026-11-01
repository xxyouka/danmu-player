import { useState } from 'react'
import { showToast } from './Toast'

interface LoginPanelProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: (nickname: string, avatar: string) => void
}

export function LoginPanel({ isOpen, onClose, onLoginSuccess }: LoginPanelProps) {
  const [cookie, setCookie] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'guide' | 'input'>('guide')

  if (!isOpen) return null

  const handleLogin = async () => {
    if (!cookie.trim()) {
      setError('请输入Cookie')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 设置cookie并获取用户信息
      const result = await window.electronAPI.neteaseSetCookie(cookie)
      if (result.success) {
        onLoginSuccess(result.nickname || '已登录', result.avatar || '')
        showToast('success', `登录成功: ${result.nickname}`)
        onClose()
      } else {
        const msg = result.message || '登录失败，请检查Cookie是否正确'
        setError(msg)
        showToast('error', msg)
      }
    } catch (err: any) {
      setError(err.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel login-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>登录网易云音乐</h2>
          <button className="settings-close" onClick={onClose}>×</button>
        </div>

        <div className="settings-content">
          {step === 'guide' ? (
            <div className="login-guide">
              <p className="login-tip">通过浏览器Cookie登录，可播放VIP歌曲</p>

              <div className="guide-steps">
                <h4>获取Cookie步骤：</h4>
                <ol>
                  <li>打开浏览器，访问 <code>music.163.com</code></li>
                  <li>登录你的网易云账号</li>
                  <li>按 <code>F12</code> 打开开发者工具</li>
                  <li>切换到 <code>Application</code> (应用) 标签</li>
                  <li>左侧找到 <code>Cookies</code> → <code>https://music.163.com</code></li>
                  <li>找到 <code>MUSIC_U</code> 这一项，复制它的值</li>
                </ol>
              </div>

              <button className="login-btn" onClick={() => setStep('input')}>
                我已获取Cookie
              </button>
            </div>
          ) : (
            <div className="login-form">
              <p className="login-tip">粘贴你的 MUSIC_U Cookie</p>

              <div className="form-group">
                <label>Cookie (MUSIC_U)</label>
                <textarea
                  placeholder="粘贴 MUSIC_U 的值..."
                  value={cookie}
                  onChange={(e) => setCookie(e.target.value)}
                  rows={3}
                />
              </div>

              {error && <div className="login-error">{error}</div>}

              <div className="login-actions">
                <button className="login-btn-secondary" onClick={() => setStep('guide')}>
                  返回
                </button>
                <button
                  className="login-btn"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? '登录中...' : '登录'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

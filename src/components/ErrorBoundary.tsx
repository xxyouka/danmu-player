import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-boundary-icon">⚠️</div>
            <h2>应用遇到了问题</h2>
            <p className="error-boundary-message">
              {this.state.error?.message || '未知错误'}
            </p>
            <div className="error-boundary-actions">
              <button className="error-boundary-btn" onClick={this.handleReset}>
                重试
              </button>
              <button className="error-boundary-btn primary" onClick={this.handleReload}>
                重新加载
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

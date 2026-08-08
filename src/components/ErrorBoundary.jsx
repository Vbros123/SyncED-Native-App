import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <main className="fatal-fallback" role="alert">
        <div>
          <p>SyncED recovery</p>
          <h1>Your saved work is still on this device.</h1>
          <p>The app could not display this screen. Reload SyncED to try again; locally saved lessons and progress will not be removed.</p>
          <button onClick={() => window.location.reload()}>Reload SyncED</button>
        </div>
      </main>
    )
  }
}

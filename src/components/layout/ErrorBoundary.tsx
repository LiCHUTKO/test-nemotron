import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Last-resort failure containment — never a blank screen. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[aether] uncaught render error', error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="fatal" role="alert">
          <p className="mono fatal-eyebrow">AETHER // FAULT CONTAINMENT</p>
          <h1>Something failed to render</h1>
          <p className="fatal-msg">{this.state.error.message}</p>
          <button type="button" className="btn btn-primary" onClick={() => this.setState({ error: null })}>
            Recover interface
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

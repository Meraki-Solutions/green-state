import * as React from 'react';

export class ErrorBoundary extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = { error: undefined };
  }

  static getDerivedStateFromError(error) {
    return { error: error.message };
  }

  render() {
    if (this.state.error) {
      return <pre id="error">{this.state.error}</pre>;
    }

    return this.props.children;
  }
}

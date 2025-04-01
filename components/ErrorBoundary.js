import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🛑 ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-md mt-4">
          <h3 className="font-semibold text-lg mb-2">🚨 Something went wrong</h3>
          <p>{this.state.error?.message || 'An unknown error occurred.'}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

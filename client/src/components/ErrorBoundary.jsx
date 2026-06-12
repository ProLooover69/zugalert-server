import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('[ZugAlert] Fehler:', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', height: '100vh', fontFamily: 'system-ui', textAlign: 'center'
                }}>
                    <div style={{ fontSize: '3rem' }}>🚂</div>
                    <h2 style={{ color: '#c0392b' }}>Etwas ist schiefgelaufen</h2>
                    <button onClick={() => window.location.reload()}
                        style={{
                            padding: '0.75rem 1.5rem', background: '#e74c3c', color: '#fff',
                            border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '1rem'
                        }}>
                        Neu laden
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
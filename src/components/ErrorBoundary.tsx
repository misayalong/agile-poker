import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div style={styles.container}>
                    <div style={styles.content}>
                        <h1 style={styles.title}>😵 出错了</h1>
                        <p style={styles.message}>
                            应用遇到了意外错误，请刷新页面重试。
                        </p>
                        {this.state.error && (
                            <details style={styles.details}>
                                <summary>错误详情</summary>
                                <pre style={styles.errorText}>
                                    {this.state.error.message}
                                </pre>
                            </details>
                        )}
                        <div style={styles.actions}>
                            <button style={styles.button} onClick={this.handleRetry}>
                                重试
                            </button>
                            <button
                                style={styles.buttonSecondary}
                                onClick={() => window.location.href = '/'}
                            >
                                返回首页
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--md-sys-color-background)',
        padding: '20px',
    },
    content: {
        textAlign: 'center',
        maxWidth: '400px',
    },
    title: {
        fontSize: '24px',
        marginBottom: '16px',
        color: 'var(--md-sys-color-error)',
    },
    message: {
        color: 'var(--md-sys-color-on-surface-variant)',
        marginBottom: '24px',
    },
    details: {
        textAlign: 'left',
        marginBottom: '24px',
        padding: '12px',
        backgroundColor: 'var(--md-sys-color-surface-variant)',
        borderRadius: '8px',
    },
    errorText: {
        fontSize: '12px',
        overflow: 'auto',
        margin: '8px 0 0',
        color: 'var(--md-sys-color-error)',
    },
    actions: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
    },
    button: {
        padding: '12px 24px',
        backgroundColor: 'var(--md-sys-color-primary)',
        color: 'var(--md-sys-color-on-primary)',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 500,
    },
    buttonSecondary: {
        padding: '12px 24px',
        backgroundColor: 'transparent',
        color: 'var(--md-sys-color-primary)',
        border: '1px solid var(--md-sys-color-outline)',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 500,
    },
};

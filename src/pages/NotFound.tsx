import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import styles from './Lobby.module.css'; // Re-use lobby styles for consistency

export const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <div className={styles.content} style={{ textAlign: 'center' }}>
                <div className={styles.header}>
                    <h1 className={styles.title} style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
                    <p className={styles.subtitle}>Page Not Found</p>
                </div>

                <p style={{ margin: '2rem 0', color: 'var(--md-sys-color-on-surface-variant)' }}>
                    The page you are looking for doesn't exist or has been moved.
                </p>

                <Button onClick={() => navigate('/')} fullWidth>
                    Go Back to Lobby
                </Button>
            </div>
        </div>
    );
};

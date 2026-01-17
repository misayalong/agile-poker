import React from 'react';
import styles from './RoomSkeleton.module.css';

export const RoomSkeleton: React.FC = () => {
    const skeleton = styles.skeleton;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <div className={`${styles.headerTitle} ${skeleton}`} />
                    <div className={`${styles.headerSubtitle} ${skeleton}`} />
                </div>
            </header>

            <div className={styles.main}>
                <aside className={styles.sidebar}>
                    <div className={styles.participantsList}>
                        <div className={`${styles.listHeader} ${skeleton}`} />
                        {[1, 2, 3].map(i => (
                            <div key={i} className={styles.participantItem}>
                                <div className={`${styles.participantName} ${skeleton}`} />
                                <div className={`${styles.participantStatus} ${skeleton}`} />
                            </div>
                        ))}
                    </div>
                </aside>

                <main className={styles.content}>
                    <div className={`${styles.votingTitle} ${skeleton}`} />
                    <div className={styles.cardGrid}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className={`${styles.votingCard} ${skeleton}`} />
                        ))}
                    </div>
                    <div className={`${styles.revealButton} ${skeleton}`} />
                </main>
            </div>
        </div>
    );
};

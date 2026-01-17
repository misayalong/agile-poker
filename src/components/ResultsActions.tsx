import React from 'react';
import { Button } from './Button';
import styles from './ResultsView.module.css';

interface ResultsActionsProps {
    onNextRound: () => void;
    isAdmin: boolean;
}

export const ResultsActions: React.FC<ResultsActionsProps> = ({ onNextRound, isAdmin }) => {
    return (
        <div className={styles.votingArea}>
            <h2>Estimated Points Revealed</h2>
            <p className={styles.hint}>Discuss the results...</p>
            {isAdmin ? (
                <Button onClick={onNextRound}>Start Next Round</Button>
            ) : (
                <div style={{ marginTop: 20, color: '#666', fontStyle: 'italic' }}>
                    Waiting for host to start next round...
                </div>
            )}
        </div>
    );
};

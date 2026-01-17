import React from 'react';
import { VotingCard } from './VotingCard';
import { Button } from './Button';
import styles from './VotingArea.module.css';

interface VotingAreaProps {
    options: string[];
    selectedOption?: string;
    onVote: (option: string) => void;
    onReveal: () => void;
    canReveal: boolean;
    isAdmin: boolean;
    isSpectator?: boolean;
}

export const VotingArea: React.FC<VotingAreaProps> = ({
    options,
    selectedOption,
    onVote,
    onReveal,
    canReveal,
    isAdmin,
    isSpectator
}) => {
    return (
        <div className={styles.votingArea}>
            <h2>{isSpectator ? 'Spectator Mode' : 'Pick your estimate'}</h2>

            {!isSpectator ? (
                <div className={styles.grid}>
                    {options.map(opt => (
                        <VotingCard
                            key={opt}
                            value={opt}
                            selected={selectedOption === opt}
                            onClick={() => onVote(opt)}
                        />
                    ))}
                </div>
            ) : (
                <div style={{ color: '#666', fontStyle: 'italic', marginBottom: 20 }}>
                    You are observing this estimation logic.
                </div>
            )}
            {isAdmin ? (
                <Button
                    onClick={onReveal}
                    disabled={!canReveal}
                    style={{ marginTop: 32 }}
                >
                    Reveal Cards
                </Button>
            ) : (
                <div style={{ marginTop: 32, color: '#666', fontStyle: 'italic' }}>
                    Waiting for host to reveal...
                </div>
            )}
        </div>
    );
};

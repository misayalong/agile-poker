import React from 'react';
import styles from './VotingCard.module.css';

interface VotingCardProps {
    value: string;
    selected: boolean;
    onClick: () => void;
    disabled?: boolean;
}

const getAriaLabel = (value: string): string => {
    const labels: Record<string, string> = {
        '?': '不确定',
        '☕': '需要休息',
    };
    return labels[value] || `${value} 点`;
};

export const VotingCard: React.FC<VotingCardProps> = ({
    value,
    selected,
    onClick,
    disabled
}) => {
    return (
        <button
            className={`${styles.card} ${selected ? styles.selected : ''} ${disabled ? styles.disabled : ''}`}
            onClick={onClick}
            disabled={disabled}
            aria-label={getAriaLabel(value)}
            aria-pressed={selected}
            role="option"
            tabIndex={0}
        >
            <span className={styles.value} aria-hidden="true">{value}</span>
        </button>
    );
};


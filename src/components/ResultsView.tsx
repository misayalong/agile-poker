import React from 'react';
import styles from './ResultsView.module.css';

interface ResultsViewProps {
    average: string;
    totalVotes?: number;
    consensusReached?: boolean;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
    average,
    totalVotes,
    consensusReached
}) => {
    return (
        <div className={styles.resultArea} role="region" aria-label="投票结果">
            <h3>结果</h3>
            <div className={styles.stats}>
                <div className={styles.statItem}>
                    <span className={styles.statValue} aria-label="平均值">{average}</span>
                    <span className={styles.statLabel}>平均分</span>
                </div>
                {totalVotes !== undefined && (
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{totalVotes}</span>
                        <span className={styles.statLabel}>参与人数</span>
                    </div>
                )}
            </div>
            {consensusReached && (
                <div className={styles.consensus}>✓ 达成共识</div>
            )}
        </div>
    );
};

// 重新导出 ResultsActions 以保持向后兼容
export { ResultsActions } from './ResultsActions';


import React, { useMemo } from 'react';
import type { ParticipantRecord, VoteRecord, RoomRecord } from '../types';
import styles from './ParticipantsList.module.css';

interface ParticipantsListProps {
    participants: ParticipantRecord[];
    currentParticipant: ParticipantRecord | null;
    currentRoundVotes: VoteRecord[];
    roomStatus: RoomRecord['status'];
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
    participants,
    currentParticipant,
    currentRoundVotes,
    roomStatus
}) => {
    // 预先构建投票 Map，避免在渲染时重复遍历
    const votesByParticipant = useMemo(() => {
        const map = new Map<string, VoteRecord>();
        currentRoundVotes.forEach(vote => {
            map.set(vote.participant_id, vote);
        });
        return map;
    }, [currentRoundVotes]);

    return (
        <div className={styles.participantsList}>
            <div className={styles.listHeader}>
                Participants ({participants.length})
            </div>
            <ul className={styles.list}>
                {participants.map(p => {
                    const vote = votesByParticipant.get(p.id);
                    const hasVoted = !!vote;
                    return (
                        <li key={p.id} className={styles.participantItem}>
                            <div className={styles.participantInfo}>
                                <span className={styles.participantName}>
                                    {p.nickname} {p.id === currentParticipant?.id && '(You)'}
                                </span>
                                <div className={styles.participantBadges}>
                                    {p.role && <span className={styles.roleBadge}>{p.role}</span>}
                                    {p.is_spectator && <span className={styles.spectatorBadge}>👁️</span>}
                                </div>
                            </div>

                            {!p.is_spectator && (
                                <div>
                                    {roomStatus === 'revealed' && vote ? (
                                        <span className={styles.revealedCard}>{vote.point}</span>
                                    ) : (
                                        <span className={`${styles.statusIndicator} ${hasVoted ? styles.statusVoted : ''}`}>
                                            {hasVoted ? '✔ Voted' : 'Waiting'}
                                        </span>
                                    )}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};


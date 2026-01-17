import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import type { Role } from '../types';
import { NicknameModal } from '../components/NicknameModal';
import { ParticipantsList } from '../components/ParticipantsList';
import { VotingArea } from '../components/VotingArea';
import { ResultsView, ResultsActions } from '../components/ResultsView';
import { RoomSkeleton } from '../components/RoomSkeleton';
import { useToast } from '../components/Toast';
import { useRoom } from '../hooks/useRoom';
import { getGlobalPreferences, setGlobalPreferences, type UserPreferences } from '../lib/utils';
import { VOTE_OPTIONS } from '../lib/constants';
import styles from './Room.module.css';

export const Room: React.FC = () => {
    const { roomCode } = useParams<{ roomCode: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [nicknameOpen, setNicknameOpen] = useState(false);
    const [initialPrefs, setInitialPrefs] = useState<UserPreferences | null>(null);

    const {
        room,
        participants,
        votes,
        currentParticipant,
        loading,
        error,
        joinRoom,
        submitVote,
        revealVotes,
        nextRound,
        isAdmin
    } = useRoom(roomCode);

    const currentRoundVotes = useMemo(() => {
        if (!room) return [];
        return votes.filter(v => v.round_no === room.round_no);
    }, [votes, room]);

    const currentVote = useMemo(() => {
        if (!room || !currentParticipant) return null;
        return votes.find(v => v.participant_id === currentParticipant.id && v.round_no === room.round_no);
    }, [votes, currentParticipant, room]);

    // Handle Join with Modal
    const handleJoinSubmit = async (nickname: string, role?: Role, isSpectator?: boolean) => {
        try {
            await joinRoom(nickname, role, isSpectator);
            setNicknameOpen(false);

            // Save global preferences
            if (role) {
                setGlobalPreferences({
                    nickname,
                    role,
                    isSpectator: !!isSpectator
                });
            }

            showToast('成功加入房间！', 'success');
        } catch (e) {
            showToast('加入房间失败，请重试', 'error');
        }
    };

    // Check if user needs to join
    React.useEffect(() => {
        if (!loading && room && !currentParticipant) {
            // Load preferences before opening modal
            const prefs = getGlobalPreferences();
            setInitialPrefs(prefs);
            setNicknameOpen(true);
        }
    }, [loading, room, currentParticipant]);


    if (loading) return <RoomSkeleton />;
    if (error) return <div className={styles.container}><div className="surface" style={{ padding: 20, color: 'red' }}>{error} <Button onClick={() => navigate('/')} variant="text">Go Home</Button></div></div>;
    if (!room) return null;

    // Calc average
    const points = currentRoundVotes.map(v => v.point).filter(p => !isNaN(Number(p)));
    const numericPoints = points.map(Number);
    const average = numericPoints.length ? (numericPoints.reduce((a, b) => a + b, 0) / numericPoints.length).toFixed(1) : '-';

    return (
        <div className={styles.container}>
            <NicknameModal open={nicknameOpen} onSubmit={handleJoinSubmit} initialValues={initialPrefs} />

            <header className={styles.header}>
                <div className={styles.roomInfo}>
                    <h1>{room.topic || 'Unnamed Estimation'}</h1>
                    <p>Room: {room.room_code} • Round {room.round_no}</p>
                </div>
                <div className={styles.actions}>
                    <Button variant="text" onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        showToast('链接已复制到剪贴板', 'success');
                    }}>Copy Link</Button>
                </div>
            </header>

            <div className={styles.main}>
                <aside className={styles.sidebar}>
                    <ParticipantsList
                        participants={participants}
                        currentParticipant={currentParticipant}
                        currentRoundVotes={currentRoundVotes}
                        roomStatus={room.status}
                    />

                    {room.status === 'revealed' && (
                        <ResultsView average={average} />
                    )}
                </aside>

                <main className={styles.content}>
                    {room.status === 'voting' ? (
                        <VotingArea
                            options={VOTE_OPTIONS}
                            selectedOption={currentVote?.point}
                            onVote={submitVote}
                            onReveal={revealVotes}
                            canReveal={currentRoundVotes.length > 0}
                            isAdmin={isAdmin}
                            isSpectator={currentParticipant?.is_spectator}
                        />
                    ) : (
                        <ResultsActions onNextRound={nextRound} isAdmin={isAdmin} />
                    )}
                </main>
            </div>
        </div>
    );
};


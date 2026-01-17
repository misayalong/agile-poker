import { useState, useEffect } from 'react';
import { RoomAPI } from '../services/api';
import type { RoomRecord, ParticipantRecord, VoteRecord, Role } from '../types';
import { getClientId, getStoredNickname, setStoredNickname } from '../lib/utils';


export const useRoom = (roomCode?: string) => {
    const [room, setRoom] = useState<RoomRecord | null>(null);
    const [participants, setParticipants] = useState<ParticipantRecord[]>([]);
    const [votes, setVotes] = useState<VoteRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentParticipant, setCurrentParticipant] = useState<ParticipantRecord | null>(null);
    const clientId = getClientId();
    const isAdmin = room?.host_id === clientId;

    // Fetch initial data
    useEffect(() => {
        if (!roomCode) {
            setLoading(false);
            return;
        }

        const code = roomCode.toUpperCase();
        let isCurrent = true;

        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Room
                const roomData = await RoomAPI.getRoom(code);
                if (!isCurrent) return;

                // 检查房间是否过期
                if (roomData.expired_at && new Date(roomData.expired_at) < new Date()) {
                    setError('房间已过期，请创建新房间');
                    setLoading(false);
                    return;
                }

                setRoom(roomData);

                // 2. Fetch Participants
                const participantsData = await RoomAPI.getParticipants(roomData.id);
                if (!isCurrent) return;
                setParticipants(participantsData);

                // Check Identity
                let me = participantsData.find(p => p.client_id === clientId);

                // Auto-join check
                const storedNick = getStoredNickname(code);
                if (!me && storedNick) {
                    try {
                        // Optimistic assumption, but we wait for create
                        me = await RoomAPI.joinRoom(roomData.id, clientId, storedNick);
                        if (!isCurrent) return;
                        // We rely on subscription to add to list, or we can push manually?
                        // Let's rely on subscription for consistency, but set currentParticipant immediately
                    } catch (e) {
                        console.error("Auto join failed", e);
                    }
                }
                if (isCurrent) setCurrentParticipant(me || null);

                // 3. Fetch Votes
                const votesData = await RoomAPI.getVotes(roomData.id);
                if (!isCurrent) return;
                setVotes(votesData);

                // 4. Setup Subscriptions
                RoomAPI.subscribeToRoom(roomData.id, (updatedRoom) => {
                    setRoom(updatedRoom);
                });

                RoomAPI.subscribeToParticipants(roomData.id, (action, record) => {
                    setParticipants(prev => {
                        if (action === 'create') {
                            if (prev.some(item => item.id === record.id)) return prev;
                            return [...prev, record];
                        }
                        if (action === 'update') return prev.map(item => item.id === record.id ? record : item);
                        if (action === 'delete') return prev.filter(item => item.id !== record.id);
                        return prev;
                    });

                    // Update self if modified (e.g. nickname change, though we don't have that yet)
                    if (record.client_id === clientId) {
                        // If I was deleted, I should know? 
                        // For now just keep currentParticipant unless explicitly handled
                    }
                });

                RoomAPI.subscribeToVotes(roomData.id, (action, record) => {
                    setVotes(prev => {
                        if (action === 'create') return [...prev, record];
                        if (action === 'update') return prev.map(item => item.id === record.id ? record : item);
                        if (action === 'delete') return prev.filter(item => item.id !== record.id); // Should handle delete
                        return prev;
                    });
                });

            } catch (err: any) {
                if (err.isAbort) return;
                console.error(err);
                if (isCurrent) setError(err instanceof Error ? err.message : 'Room not found or expired.');
            } finally {
                if (isCurrent) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isCurrent = false;
            RoomAPI.unsubscribe();
        };
    }, [roomCode, clientId]);


    // Actions
    const joinRoom = async (nickname: string, role?: Role, isSpectator?: boolean) => {
        if (!room) return;
        try {
            const me = await RoomAPI.joinRoom(room.id, clientId, nickname, role, isSpectator);
            setStoredNickname(room.room_code, nickname);
            setCurrentParticipant(me);
            return me;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const submitVote = async (point: string) => {
        if (!room || !currentParticipant) return;
        const existingVote = votes.find(
            v => v.participant_id === currentParticipant.id && v.round_no === room.round_no
        );

        try {
            await RoomAPI.submitVote(
                room.id,
                currentParticipant.id,
                room.round_no,
                point,
                existingVote?.id
            );
        } catch (err) {
            console.error("Vote failed", err);
            throw err;
        }
    };

    const revealVotes = async () => {
        if (!room) return;
        try {
            await RoomAPI.updateRoomStatus(room.id, {
                status: 'revealed',
                last_active_at: new Date().toISOString()
            });
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const nextRound = async () => {
        if (!room) return;
        try {
            await RoomAPI.updateRoomStatus(room.id, {
                status: 'voting',
                round_no: room.round_no + 1,
                last_active_at: new Date().toISOString()
            });
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    return {
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
    };
};

import { pb, COLLECTIONS } from '../lib/pocketbase';
import type { RoomRecord, ParticipantRecord, VoteRecord } from '../types';

// 输入验证工具函数
const validateRoomCode = (code: string): string => {
    // Room code 应该只包含大写字母和数字，长度为 6
    const sanitized = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (sanitized.length !== 6) {
        throw new Error('Invalid room code format');
    }
    return sanitized;
};

const validateId = (id: string): string => {
    // PocketBase ID 格式验证（15位字母数字）
    if (!/^[a-z0-9]{15}$/i.test(id)) {
        throw new Error('Invalid ID format');
    }
    return id;
};

const escapeFilterValue = (value: string): string => {
    // 转义 PocketBase filter 中的特殊字符
    return value.replace(/["\\]/g, '\\$&');
};

export const RoomAPI = {
    // Room Operations
    checkHealth: async () => {
        return await pb.health.check();
    },

    createRoom: async (roomCode: string, hostId: string, topic?: string) => {
        const validCode = validateRoomCode(roomCode);
        return await pb.collection(COLLECTIONS.ROOMS).create({
            room_code: validCode,
            host_id: hostId,
            topic: topic || 'Unnamed Estimation',
            status: 'voting',
            round_no: 1,
            last_active_at: new Date().toISOString(),
            expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }) as RoomRecord;
    },

    getRoom: async (code: string) => {
        const validCode = validateRoomCode(code);
        return await pb.collection(COLLECTIONS.ROOMS).getFirstListItem(`room_code="${escapeFilterValue(validCode)}"`) as RoomRecord;
    },

    updateRoomStatus: async (roomId: string, data: Partial<RoomRecord>) => {
        const validId = validateId(roomId);
        return await pb.collection(COLLECTIONS.ROOMS).update(validId, data);
    },

    // Participant Operations
    getParticipants: async (roomId: string) => {
        const validId = validateId(roomId);
        return await pb.collection(COLLECTIONS.PARTICIPANTS).getFullList({
            filter: `room_id="${escapeFilterValue(validId)}"`
        }) as ParticipantRecord[];
    },

    joinRoom: async (roomId: string, clientId: string, nickname: string, role?: string, isSpectator?: boolean) => {
        return await pb.collection(COLLECTIONS.PARTICIPANTS).create({
            room_id: roomId,
            client_id: clientId,
            nickname: nickname,
            role: role,
            is_spectator: isSpectator,
            last_seen_at: new Date().toISOString()
        }) as ParticipantRecord;
    },

    // Vote Operations
    getVotes: async (roomId: string) => {
        const validId = validateId(roomId);
        return await pb.collection(COLLECTIONS.VOTES).getFullList({
            filter: `room_id="${escapeFilterValue(validId)}"`,
        }) as VoteRecord[];
    },

    submitVote: async (roomId: string, participantId: string, roundNo: number, point: string, existingVoteId?: string) => {
        const data = {
            room_id: roomId,
            participant_id: participantId,
            round_no: roundNo,
            point: point,
            voted_at: new Date().toISOString()
        };

        if (existingVoteId) {
            return await pb.collection(COLLECTIONS.VOTES).update(existingVoteId, data);
        } else {
            return await pb.collection(COLLECTIONS.VOTES).create(data);
        }
    },

    // Subscriptions
    // 使用记录级订阅优化性能
    subscribeToRoom: (roomId: string, callback: (record: RoomRecord) => void) => {
        const validId = validateId(roomId);
        return pb.collection(COLLECTIONS.ROOMS).subscribe(validId, (e) => {
            callback(e.record as RoomRecord);
        });
    },

    // Participants 和 Votes 使用 filter 订阅
    subscribeToParticipants: (roomId: string, callback: (action: string, record: ParticipantRecord) => void) => {
        const validId = validateId(roomId);
        // PocketBase 支持 filter 订阅
        return pb.collection(COLLECTIONS.PARTICIPANTS).subscribe('*', (e) => {
            const record = e.record as ParticipantRecord;
            if (record.room_id === validId) {
                callback(e.action, record);
            }
        }, { filter: `room_id="${escapeFilterValue(validId)}"` });
    },

    subscribeToVotes: (roomId: string, callback: (action: string, record: VoteRecord) => void) => {
        const validId = validateId(roomId);
        return pb.collection(COLLECTIONS.VOTES).subscribe('*', (e) => {
            const record = e.record as VoteRecord;
            if (record.room_id === validId) {
                callback(e.action, record);
            }
        }, { filter: `room_id="${escapeFilterValue(validId)}"` });
    },

    unsubscribe: () => {
        pb.collection(COLLECTIONS.ROOMS).unsubscribe();
        pb.collection(COLLECTIONS.PARTICIPANTS).unsubscribe();
        pb.collection(COLLECTIONS.VOTES).unsubscribe();
    }
};

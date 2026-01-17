import type { RecordModel } from 'pocketbase';

export interface RoomRecord extends RecordModel {
    room_code: string;
    host_id: string; // Admin client_id
    topic?: string;
    status: 'voting' | 'revealed';
    round_no: number;
    last_active_at?: string;
    expired_at?: string;
}

export type Role = 'SM' | 'PO' | 'DEV' | 'QA' | 'UI/UX';

export interface ParticipantRecord extends RecordModel {
    room_id: string;
    client_id: string;
    nickname: string;
    role?: Role;
    is_spectator?: boolean;
    last_seen_at?: string;
}

export interface VoteRecord extends RecordModel {
    room_id: string;
    participant_id: string;
    round_no: number;
    point: string;
    voted_at: string;
}

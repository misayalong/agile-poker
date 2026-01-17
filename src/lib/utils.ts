import type { Role } from '../types';

export const getClientId = (): string => {
    const STORAGE_KEY = 'agile_poker_client_id';
    let clientId = localStorage.getItem(STORAGE_KEY);

    if (!clientId) {
        clientId = crypto.randomUUID();
        localStorage.setItem(STORAGE_KEY, clientId);
    }

    return clientId;
};

export const getStoredNickname = (roomCode: string): string | null => {
    return localStorage.getItem(`nickname:${roomCode}`);
};

export const setStoredNickname = (roomCode: string, nickname: string) => {
    localStorage.setItem(`nickname:${roomCode}`, nickname);
};

export interface UserPreferences {
    nickname: string;
    role: Role;
    isSpectator: boolean;
}

const PREF_STORAGE_KEY = 'agile_poker_user_prefs';

export const getGlobalPreferences = (): UserPreferences | null => {
    const json = localStorage.getItem(PREF_STORAGE_KEY);
    if (!json) return null;
    try {
        return JSON.parse(json);
    } catch {
        return null;
    }
};

export const setGlobalPreferences = (prefs: UserPreferences) => {
    localStorage.setItem(PREF_STORAGE_KEY, JSON.stringify(prefs));
};

export const generateRoomCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Distinct chars
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result.toUpperCase();
};

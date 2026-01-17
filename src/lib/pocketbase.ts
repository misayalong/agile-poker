import PocketBase from 'pocketbase';

export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090');

export const COLLECTIONS = {
  ROOMS: 'rooms',
  PARTICIPANTS: 'participants',
  VOTES: 'votes',
} as const;

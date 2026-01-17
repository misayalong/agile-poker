import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoomAPI } from '../services/api';
import { generateRoomCode, getClientId } from '../lib/utils';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import styles from './Lobby.module.css';

export const Lobby: React.FC = () => {
    const navigate = useNavigate();
    const [topic, setTopic] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    React.useEffect(() => {
        // Quick health check on mount
        RoomAPI.checkHealth().then(() => console.log("✅ PB Connection OK"))
            .catch(e => console.error("❌ PB Connection Failed:", e));
    }, []);

    const handleCreateRoom = async () => {
        setLoading(true);
        setError('');
        try {
            const roomCode = generateRoomCode();
            // We need to import getClientId
            const hostId = getClientId();
            const room = await RoomAPI.createRoom(roomCode, hostId, topic);
            console.log('Room created:', room);
            navigate(`/room/${roomCode}`);
        } catch (err) {
            console.error('Create Error:', err);
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRoom = async () => {
        if (!joinCode || joinCode.length !== 6) {
            setError('Please enter a valid 6-character room code.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            // Check if room exists
            await RoomAPI.getRoom(joinCode.toUpperCase());
            navigate(`/room/${joinCode.toUpperCase()}`);
        } catch (err) {
            console.error(err);
            setError('Room not found or expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Agile Poker</h1>
                    <p className={styles.subtitle}>Free, instant agile estimation for your team.</p>
                </div>

                <div className={styles.card}>
                    <h2>Create Room</h2>
                    <Input
                        placeholder="Topic (Optional)"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        fullWidth
                    />
                    <Button
                        onClick={handleCreateRoom}
                        disabled={loading}
                        className={styles.actionButton}
                        fullWidth
                    >
                        {loading ? 'Creating...' : 'Create New Room'}
                    </Button>
                </div>

                <div className={styles.divider}>
                    <span>OR</span>
                </div>

                <div className={styles.card}>
                    <h2>Join Room</h2>
                    <Input
                        placeholder="Enter Room Code (e.g. X9J2M1)"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        maxLength={6}
                        fullWidth
                    />
                    <Button
                        variant="secondary"
                        onClick={handleJoinRoom}
                        disabled={loading}
                        className={styles.actionButton}
                        fullWidth
                    >
                        Join Room
                    </Button>
                </div>

                {error && <div className={styles.error}>{error}</div>}
            </div>
        </div>
    );
};

// Helper for error messages
function getErrorMessage(err: any): string {
    if (err?.status === 0) {
        return 'Connection Failed. Is the server running?';
    }
    if (err instanceof Error) {
        return err.message;
    }
    return 'An unexpected error occurred.';
}

import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import type { Role } from '../types';
import type { UserPreferences } from '../lib/utils';
import styles from './NicknameModal.module.css';

interface NicknameModalProps {
    onSubmit: (nickname: string, role?: Role, isSpectator?: boolean) => void;
    open: boolean;
    initialValues?: UserPreferences | null;
}

const ROLES: Role[] = ['DEV', 'QA', 'SM', 'PO', 'UI/UX'];

export const NicknameModal: React.FC<NicknameModalProps> = ({ onSubmit, open, initialValues }) => {
    const [nickname, setNickname] = useState('');
    const [role, setRole] = useState<Role>('DEV');
    const [isSpectator, setIsSpectator] = useState(false);

    useEffect(() => {
        if (open && initialValues) {
            setNickname(initialValues.nickname);
            setRole(initialValues.role);
            setIsSpectator(initialValues.isSpectator);
        }
    }, [open, initialValues]);

    if (!open) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nickname.trim()) {
            onSubmit(nickname.trim(), role, isSpectator);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2>Enter your nickname</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <Input
                            placeholder="e.g. John Doe"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            autoFocus
                            fullWidth
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Role:</label>
                        <div className={styles.roleGroup}>
                            {ROLES.map((r) => (
                                <label key={r} className={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value={r}
                                        checked={role === r}
                                        onChange={() => setRole(r)}
                                    />
                                    {r}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={isSpectator}
                                onChange={(e) => setIsSpectator(e.target.checked)}
                            />
                            Join as Spectator
                        </label>
                    </div>

                    <div className={styles.actions}>
                        <Button type="submit" disabled={!nickname.trim()}>
                            Join Room
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

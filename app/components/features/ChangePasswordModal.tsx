"use client";

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { showToast } from '@/lib/notifications';
import { ShieldCheck, Lock, AlertCircle } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  userName: string | null;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update password");
      }

      showToast(`Password for ${userName} updated successfully`, 'success');
      setPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!loading) {
          setError(null);
          setPassword('');
          setConfirmPassword('');
          onClose();
        }
      }}
      title="Administrative Password Reset"
      size="md"
    >
      <div className="space-y-8">
        <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
          <div className="p-2 bg-white rounded-xl shadow-sm text-amber-600">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-900 mb-1">Security Notice</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              You are about to change the password for <span className="font-black underline">{userName}</span>. 
              The user will need to use this new password to log in immediately.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input
              label="New Secure Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              leftIcon={<Lock className="w-4 h-4" />}
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            />
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="text-xs font-bold uppercase tracking-wider">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-8 bg-slate-900 shadow-xl shadow-slate-200"
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

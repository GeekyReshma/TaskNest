'use client';

import React, { useState } from 'react';
import { LayoutGrid, ArrowRight, User } from 'lucide-react';

interface GuestLoginProps {
  onLogin: (guestName: string) => Promise<void> | void;
}

export default function GuestLogin({ onLogin }: GuestLoginProps) {
  const [name, setName] = useState('Guest Explorer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await onLogin(name.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start guest session');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg-body dark:bg-dark-bg-body px-4 relative overflow-hidden transition-colors duration-200">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-brand/10 dark:bg-brand/20 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-hover/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="w-full max-w-md bg-light-bg-card dark:bg-dark-bg-card border border-light-border dark:border-dark-border rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center text-white shadow-lg shadow-brand/30">
            <LayoutGrid size={24} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-light-text dark:text-dark-text">
              Task<span className="text-brand">Nest</span>
            </h1>
            <p className="text-xs text-light-text-muted dark:text-dark-text-muted tracking-wider uppercase font-semibold">
              Kanban Workspace
            </p>
          </div>
        </div>

        <div className="bg-light-bg-body dark:bg-dark-bg-sidebar/55 border border-light-border dark:border-dark-border/40 rounded-xl p-4 mb-6">
          <h2 className="text-sm font-semibold text-light-text dark:text-dark-text mb-1">
            Welcome to TaskNest
          </h2>
          <p className="text-xs text-light-text-muted dark:text-dark-text-muted leading-relaxed">
            Enter a guest name to create a private workspace. Your boards and tasks stay isolated to
            your guest session.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="guest-name"
              className="block text-xs font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider mb-2"
            >
              Guest User Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-light-text-muted">
                <User size={18} aria-hidden="true" />
              </div>
              <input
                id="guest-name"
                type="text"
                required
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full pl-10 pr-4 py-3 bg-light-bg-body dark:bg-dark-bg-sidebar border border-light-border dark:border-dark-border focus:border-brand rounded-xl text-sm outline-none transition-all text-light-text dark:text-dark-text font-medium"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-brand-danger font-medium" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white rounded-xl font-semibold text-sm shadow-md shadow-brand/20 transition-all cursor-pointer"
          >
            <span>{isSubmitting ? 'Starting session…' : 'Enter Workspace'}</span>
            {!isSubmitting && <ArrowRight size={16} aria-hidden="true" />}
          </button>
        </form>

        <p className="text-center mt-6 text-[10px] text-light-text-muted dark:text-dark-text-muted">
          Your guest session is saved securely and restored after refresh.
        </p>
      </div>
    </div>
  );
}

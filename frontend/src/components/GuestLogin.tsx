'use client';

import React, { useState } from 'react';
import { LayoutGrid, ArrowRight, User } from 'lucide-react';

interface GuestLoginProps {
  onLogin: (guestName: string) => void;
}

export default function GuestLogin({ onLogin }: GuestLoginProps) {
  const [name, setName] = useState('Guest Explorer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg-body dark:bg-dark-bg-body px-4 transition-colors duration-200">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-brand/10 dark:bg-brand/20 rounded-full blur-3xl -z-10 pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-hover/10 dark:bg-brand-hover/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="w-full max-w-md bg-light-bg-card dark:bg-dark-bg-card border border-light-border dark:border-dark-border rounded-2xl shadow-xl p-8 transition-all hover:shadow-2xl duration-300">
        
        {/* App Title Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center text-white shadow-lg shadow-brand/30">
            <LayoutGrid size={24} className="animate-spin-slow" />
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

        {/* Info Card */}
        <div className="bg-light-bg-body dark:bg-dark-bg-sidebar/55 border border-light-border dark:border-dark-border/40 rounded-xl p-4 mb-6">
          <h2 className="text-sm font-semibold text-light-text dark:text-dark-text mb-1">
            Welcome to TaskNest!
          </h2>
          <p className="text-xs text-light-text-muted dark:text-dark-text-muted leading-relaxed">
            This workspace lets you manage, organize, and drag-and-drop tasks across boards. Logging in as a guest enables instant access.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider mb-2">
              Guest User Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-light-text-muted dark:text-dark-text-muted">
                <User size={18} />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full pl-10 pr-4 py-3 bg-light-bg-body dark:bg-dark-bg-sidebar border border-light-border dark:border-dark-border focus:border-brand dark:focus:border-brand rounded-xl text-sm outline-none transition-all text-light-text dark:text-dark-text font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-brand hover:bg-brand-hover text-white rounded-xl font-semibold text-sm shadow-md shadow-brand/20 hover:shadow-lg hover:shadow-brand/35 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer"
          >
            <span>Enter Workspace</span>
            <ArrowRight size={16} />
          </button>
        </form>
        
        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted">
            All your local changes will be stored and updated in real-time.
          </p>
        </div>

      </div>
    </div>
  );
}

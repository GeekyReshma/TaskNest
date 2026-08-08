'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 transition-all duration-200">
      <div className="w-full max-w-md bg-light-bg-card dark:bg-dark-bg-card rounded-2xl p-6 shadow-2xl border border-light-border dark:border-dark-border transform transition-all scale-100">
        
        {/* Warning Indicator */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-brand-danger/10 text-brand-danger flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
          <h3 className="text-lg font-bold text-brand-danger">
            {title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm text-light-text-muted dark:text-dark-text-muted leading-relaxed mb-6">
          {description}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-brand-danger hover:bg-brand-danger-hover text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-light-bg-body dark:bg-dark-border hover:bg-light-border dark:hover:bg-dark-border/80 text-brand hover:text-brand-hover dark:text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}

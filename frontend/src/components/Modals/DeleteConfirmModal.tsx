'use client';

import React, { useId, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import ModalShell from './ModalShell';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
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
  const titleId = useId();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} labelledBy={titleId}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-brand-danger/10 text-brand-danger flex items-center justify-center">
          <AlertTriangle size={20} aria-hidden="true" />
        </div>
        <h3 id={titleId} className="text-lg font-bold text-brand-danger">
          {title}
        </h3>
      </div>

      <p className="text-sm text-light-text-muted dark:text-dark-text-muted leading-relaxed mb-6">
        {description}
      </p>

      {error && (
        <p className="text-xs text-brand-danger mb-4" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isDeleting}
          className="flex-1 py-3 px-4 bg-brand-danger hover:bg-brand-danger-hover disabled:opacity-50 text-white font-bold rounded-full text-sm transition-colors cursor-pointer"
        >
          {isDeleting ? 'Deleting…' : 'Delete'}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="flex-1 py-3 px-4 bg-brand/10 hover:bg-brand/20 text-brand dark:text-white font-bold rounded-full text-sm transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </ModalShell>
  );
}

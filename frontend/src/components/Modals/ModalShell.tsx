'use client';

import React, { useEffect, useId, useRef } from 'react';

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  labelledBy?: string;
}

export default function ModalShell({
  isOpen,
  onClose,
  title,
  children,
  labelledBy,
}: ModalShellProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const autoId = useId();
  const titleId = labelledBy || autoId;

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus first focusable element
    const timer = window.setTimeout(() => {
      const focusable = dialogRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    }, 0);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className="w-full max-w-md bg-light-bg-card dark:bg-dark-bg-card rounded-2xl p-6 shadow-2xl border border-light-border dark:border-dark-border max-h-[90vh] overflow-y-auto"
      >
        {children}
      </div>
    </div>
  );
}

export { type ModalShellProps };

'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { X, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import ModalShell from './ModalShell';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: {
    id: string;
    title: string;
    description?: string;
    status: string;
    columnId: string;
    subtasks: { id: string; title: string; isCompleted: boolean }[];
  };
  columns: { id: string; name: string }[];
  onToggleSubtask: (subtaskId: string, isCompleted: boolean) => void;
  onStatusChange: (taskId: string, newColumnId: string, newStatus: string) => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export default function TaskDetailsModal({
  isOpen,
  onClose,
  task,
  columns,
  onToggleSubtask,
  onStatusChange,
  onEditClick,
  onDeleteClick,
}: TaskDetailsModalProps) {
  const titleId = useId();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) setShowMenu(false);
  }, [isOpen]);

  if (!task) return null;

  const completedCount = task.subtasks.filter((s) => s.isCompleted).length;
  const totalCount = task.subtasks.length;

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} labelledBy={titleId}>
      <div className="flex justify-between items-start gap-4 mb-4">
        <h3 id={titleId} className="text-lg font-bold text-light-text dark:text-dark-text leading-snug flex-1 break-words">
          {task.title}
        </h3>

        <div className="flex items-center gap-1 flex-shrink-0">
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Task options"
              aria-expanded={showMenu}
              className="p-1 text-light-text-muted hover:text-brand rounded-lg transition-colors cursor-pointer"
            >
              <MoreVertical size={20} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-light-bg-card dark:bg-dark-bg-sidebar border border-light-border dark:border-dark-border rounded-xl shadow-xl py-1 z-10">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onEditClick();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-light-text dark:text-dark-text hover:bg-light-bg-body dark:hover:bg-dark-border transition-colors text-left cursor-pointer"
                >
                  <Edit2 size={12} />
                  <span>Edit Task</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onDeleteClick();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-brand-danger hover:bg-brand-danger/5 transition-colors text-left cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>Delete Task</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-light-text-muted hover:text-brand-danger transition-colors p-1 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <p className="text-sm text-light-text-muted dark:text-dark-text-muted leading-relaxed mb-6 font-medium">
        {task.description || 'No description provided.'}
      </p>

      <div className="mb-6">
        <p className="block text-xs font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider mb-3">
          Subtasks ({completedCount} of {totalCount})
        </p>

        {totalCount === 0 ? (
          <p className="text-xs text-light-text-muted dark:text-dark-text-muted italic">
            No subtasks defined.
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {task.subtasks.map((sub) => (
              <label
                key={sub.id}
                className="flex items-center gap-3 p-3 bg-light-bg-body dark:bg-dark-bg-sidebar/55 hover:bg-brand/5 border border-light-border dark:border-dark-border/40 rounded-lg cursor-pointer transition-all select-none group"
              >
                <input
                  type="checkbox"
                  checked={sub.isCompleted}
                  onChange={(e) => onToggleSubtask(sub.id, e.target.checked)}
                  className="w-4 h-4 text-brand rounded border-light-border dark:border-dark-border accent-brand cursor-pointer flex-shrink-0"
                />
                <span
                  className={`text-xs font-bold transition-all ${
                    sub.isCompleted
                      ? 'line-through text-light-text-muted dark:text-dark-text-muted opacity-60'
                      : 'text-light-text dark:text-dark-text'
                  }`}
                >
                  {sub.title}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="details-status"
          className="block text-xs font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider mb-2"
        >
          Current Status
        </label>
        <select
          id="details-status"
          value={task.columnId}
          onChange={(e) => {
            const newColId = e.target.value;
            const col = columns.find((c) => c.id === newColId);
            if (col) onStatusChange(task.id, newColId, col.name);
          }}
          className="w-full px-4 py-2.5 bg-light-bg-body dark:bg-dark-bg-sidebar border border-light-border dark:border-dark-border focus:border-brand rounded-xl text-sm outline-none text-light-text dark:text-dark-text font-semibold"
        >
          {columns.map((col) => (
            <option key={col.id} value={col.id}>
              {col.name}
            </option>
          ))}
        </select>
      </div>
    </ModalShell>
  );
}

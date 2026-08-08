'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, MoreVertical, Edit2, Trash2 } from 'lucide-react';

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
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close options menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen || !task) return null;

  const completedCount = task.subtasks.filter((s) => s.isCompleted).length;
  const totalCount = task.subtasks.length;

  const handleStatusSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newColId = e.target.value;
    const col = columns.find((c) => c.id === newColId);
    if (col) {
      onStatusChange(task.id, newColId, col.name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 overflow-y-auto">
      <div className="w-full max-w-md bg-light-bg-card dark:bg-dark-bg-card rounded-2xl p-6 shadow-2xl border border-light-border dark:border-dark-border max-h-[90vh] overflow-y-auto transition-all relative">
        
        {/* Header containing Title & Dot Options menu */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <h3 className="text-lg font-bold text-light-text dark:text-dark-text leading-snug flex-1">
            {task.title}
          </h3>

          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Options Trigger */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-light-text-muted hover:text-brand rounded-lg transition-colors cursor-pointer"
              >
                <MoreVertical size={20} />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-light-bg-card dark:bg-dark-bg-sidebar border border-light-border dark:border-dark-border rounded-xl shadow-xl py-1 z-10">
                  <button
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

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="text-light-text-muted hover:text-brand-danger transition-colors p-1 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Task Description */}
        <p className="text-sm text-light-text-muted dark:text-dark-text-muted leading-relaxed mb-6 font-medium">
          {task.description || 'No description provided.'}
        </p>

        {/* Subtasks Progress */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider mb-3">
            Subtasks ({completedCount} of {totalCount})
          </label>
          
          {totalCount === 0 ? (
            <p className="text-xs text-light-text-muted dark:text-dark-text-muted italic">No subtasks defined.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {task.subtasks.map((sub) => (
                <label
                  key={sub.id}
                  className="flex items-center gap-3 p-3 bg-light-bg-body dark:bg-dark-bg-sidebar/55 hover:bg-brand/5 dark:hover:bg-brand/5 border border-light-border dark:border-dark-border/40 rounded-xl cursor-pointer transition-all select-none group"
                >
                  <input
                    type="checkbox"
                    checked={sub.isCompleted}
                    onChange={(e) => onToggleSubtask(sub.id, e.target.checked)}
                    className="w-4.5 h-4.5 text-brand rounded border-light-border dark:border-dark-border focus:ring-brand accent-brand cursor-pointer flex-shrink-0"
                  />
                  <span
                    className={`text-xs font-semibold transition-all ${
                      sub.isCompleted
                        ? 'line-through text-light-text-muted dark:text-dark-text-muted opacity-60'
                        : 'text-light-text dark:text-dark-text group-hover:text-brand dark:group-hover:text-brand-hover'
                    }`}
                  >
                    {sub.title}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Current Status Dropdown */}
        <div>
          <label className="block text-xs font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider mb-2">
            Current Status
          </label>
          <select
            value={task.columnId}
            onChange={handleStatusSelect}
            className="w-full px-4 py-2.5 bg-light-bg-body dark:bg-dark-bg-sidebar border border-light-border dark:border-dark-border focus:border-brand dark:focus:border-brand rounded-xl text-sm outline-none transition-all text-light-text dark:text-dark-text font-semibold"
          >
            {columns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useId, useState } from 'react';
import { X, Plus } from 'lucide-react';
import ModalShell from './ModalShell';

interface SubtaskInput {
  id?: string;
  title: string;
  isCompleted: boolean;
}

interface AddEditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    title: string,
    description: string,
    status: string,
    columnId: string,
    subtasks: SubtaskInput[],
  ) => Promise<void> | void;
  columns: { id: string; name: string }[];
  task?: {
    id: string;
    title: string;
    description?: string;
    status: string;
    columnId: string;
    subtasks: { id: string; title: string; isCompleted: boolean }[];
  };
}

export default function AddEditTaskModal({
  isOpen,
  onClose,
  onSave,
  columns,
  task,
}: AddEditTaskModalProps) {
  const titleId = useId();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnId, setColumnId] = useState('');
  const [subtasks, setSubtasks] = useState<SubtaskInput[]>([]);
  const [errors, setErrors] = useState<{ title?: string; subtasks?: string[] }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEdit = !!task;

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setColumnId(task.columnId);
        setSubtasks(
          task.subtasks.map((sub) => ({
            id: sub.id,
            title: sub.title,
            isCompleted: sub.isCompleted,
          })),
        );
      } else {
        setTitle('');
        setDescription('');
        setColumnId(columns[0]?.id || '');
        setSubtasks([{ title: '', isCompleted: false }]);
      }
      setErrors({});
      setSubmitError(null);
      setIsSaving(false);
    }
  }, [isOpen, task, columns]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    // Allow empty subtask rows to be dropped; validate only non-empty-looking rows that are blank after trim of intentional entries
    const prepared = subtasks
      .map((sub) => ({ ...sub, title: sub.title.trim() }))
      .filter((sub) => sub.title.length > 0 || sub.id);

    const subtaskErrors: string[] = [];
    prepared.forEach((sub, idx) => {
      if (!sub.title) {
        subtaskErrors[idx] = 'Subtask description is required';
      }
    });

    if (subtaskErrors.some(Boolean)) {
      newErrors.subtasks = subtaskErrors;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedColumn = columns.find((col) => col.id === columnId);
    const status = selectedColumn ? selectedColumn.name : '';

    try {
      setIsSaving(true);
      setSubmitError(null);
      await onSave(
        title.trim(),
        description.trim(),
        status,
        columnId,
        prepared.filter((s) => s.title),
      );
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} labelledBy={titleId}>
      <div className="flex justify-between items-center mb-6">
        <h3 id={titleId} className="text-lg font-bold text-light-text dark:text-dark-text">
          {isEdit ? 'Edit Task' : 'Add New Task'}
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-light-text-muted hover:text-brand-danger transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="task-title"
            className="block text-xs font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider mb-2"
          >
            Title
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Take coffee break"
            className={`w-full px-4 py-2.5 bg-light-bg-body dark:bg-dark-bg-sidebar border ${
              errors.title ? 'border-brand-danger' : 'border-light-border dark:border-dark-border'
            } focus:border-brand rounded-xl text-sm outline-none text-light-text dark:text-dark-text font-medium`}
          />
          {errors.title && <p className="text-xs text-brand-danger mt-1">{errors.title}</p>}
        </div>

        <div>
          <label
            htmlFor="task-description"
            className="block text-xs font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider mb-2"
          >
            Description
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. It's always good to take a break."
            rows={3}
            className="w-full px-4 py-2.5 bg-light-bg-body dark:bg-dark-bg-sidebar border border-light-border dark:border-dark-border focus:border-brand rounded-xl text-sm outline-none text-light-text dark:text-dark-text resize-none font-medium"
          />
        </div>

        <div>
          <p className="block text-xs font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider mb-2">
            Subtasks
          </p>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1 mb-3">
            {subtasks.map((sub, index) => (
              <div key={sub.id || index} className="flex gap-2 items-center">
                <div className="flex-1">
                  <input
                    type="text"
                    aria-label={`Subtask ${index + 1}`}
                    value={sub.title}
                    onChange={(e) => {
                      const updated = [...subtasks];
                      updated[index].title = e.target.value;
                      setSubtasks(updated);
                    }}
                    placeholder="e.g. Make coffee"
                    className={`w-full px-4 py-2 bg-light-bg-body dark:bg-dark-bg-sidebar border ${
                      errors.subtasks?.[index]
                        ? 'border-brand-danger'
                        : 'border-light-border dark:border-dark-border'
                    } focus:border-brand rounded-xl text-sm outline-none text-light-text dark:text-dark-text`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setSubtasks(subtasks.filter((_, i) => i !== index))}
                  aria-label={`Remove subtask ${index + 1}`}
                  className="text-light-text-muted hover:text-brand-danger p-1.5 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setSubtasks([...subtasks, { title: '', isCompleted: false }])}
            className="w-full flex items-center justify-center gap-1 py-2.5 bg-brand/10 hover:bg-brand/20 text-brand dark:text-white font-bold rounded-full text-xs transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>Add New Subtask</span>
          </button>
        </div>

        <div>
          <label
            htmlFor="task-status"
            className="block text-xs font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider mb-2"
          >
            Status
          </label>
          <select
            id="task-status"
            value={columnId}
            onChange={(e) => setColumnId(e.target.value)}
            className="w-full px-4 py-2.5 bg-light-bg-body dark:bg-dark-bg-sidebar border border-light-border dark:border-dark-border focus:border-brand rounded-xl text-sm outline-none text-light-text dark:text-dark-text font-medium"
          >
            {columns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </select>
        </div>

        {submitError && (
          <p className="text-xs text-brand-danger" role="alert">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-bold rounded-full text-sm transition-colors cursor-pointer"
        >
          {isSaving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Task'}
        </button>
      </form>
    </ModalShell>
  );
}

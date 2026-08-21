'use client';

import React, { useEffect, useId, useState } from 'react';
import { X, Plus } from 'lucide-react';
import ModalShell from './ModalShell';

interface ColumnInput {
  id?: string;
  name: string;
}

interface AddEditBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, columns: ColumnInput[]) => Promise<void> | void;
  board?: {
    id: string;
    name: string;
    columns: { id: string; name: string }[];
  };
}

export default function AddEditBoardModal({
  isOpen,
  onClose,
  onSave,
  board,
}: AddEditBoardModalProps) {
  const titleId = useId();
  const [boardName, setBoardName] = useState('');
  const [columns, setColumns] = useState<ColumnInput[]>([
    { name: 'Todo' },
    { name: 'Doing' },
  ]);
  const [errors, setErrors] = useState<{ boardName?: string; columns?: string[] }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEdit = !!board;

  useEffect(() => {
    if (isOpen) {
      if (board) {
        setBoardName(board.name);
        setColumns(board.columns.map((col) => ({ id: col.id, name: col.name })));
      } else {
        setBoardName('');
        setColumns([{ name: 'Todo' }, { name: 'Doing' }, { name: 'Done' }]);
      }
      setErrors({});
      setSubmitError(null);
      setIsSaving(false);
    }
  }, [isOpen, board]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!boardName.trim()) {
      newErrors.boardName = 'Board name is required';
    }

    const columnErrors: string[] = [];
    columns.forEach((col, idx) => {
      if (!col.name.trim()) {
        columnErrors[idx] = 'Column name cannot be blank';
      }
    });

    if (columnErrors.some(Boolean)) {
      newErrors.columns = columnErrors;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSaving(true);
      setSubmitError(null);
      await onSave(boardName.trim(), columns);
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save board');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} labelledBy={titleId}>
      <div className="flex justify-between items-center mb-6">
        <h3 id={titleId} className="text-lg font-bold text-light-text dark:text-dark-text">
          {isEdit ? 'Edit Board' : 'Add New Board'}
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
            htmlFor="board-name"
            className="block text-xs font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider mb-2"
          >
            Board Name
          </label>
          <input
            id="board-name"
            type="text"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            placeholder="e.g. Platform Launch"
            className={`w-full px-4 py-2.5 bg-light-bg-body dark:bg-dark-bg-sidebar border ${
              errors.boardName ? 'border-brand-danger' : 'border-light-border dark:border-dark-border'
            } focus:border-brand rounded-xl text-sm outline-none text-light-text dark:text-dark-text font-medium`}
          />
          {errors.boardName && (
            <p className="text-xs text-brand-danger mt-1">{errors.boardName}</p>
          )}
        </div>

        <div>
          <p className="block text-xs font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider mb-2">
            Board Columns
          </p>
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1 mb-3">
            {columns.map((col, index) => (
              <div key={col.id || index} className="flex gap-2 items-center">
                <div className="flex-1">
                  <input
                    type="text"
                    aria-label={`Column ${index + 1} name`}
                    value={col.name}
                    onChange={(e) => {
                      const updated = [...columns];
                      updated[index].name = e.target.value;
                      setColumns(updated);
                    }}
                    placeholder="e.g. Todo"
                    className={`w-full px-4 py-2 bg-light-bg-body dark:bg-dark-bg-sidebar border ${
                      errors.columns?.[index]
                        ? 'border-brand-danger'
                        : 'border-light-border dark:border-dark-border'
                    } focus:border-brand rounded-xl text-sm outline-none text-light-text dark:text-dark-text`}
                  />
                  {errors.columns?.[index] && (
                    <p className="text-[10px] text-brand-danger mt-0.5 ml-1">
                      {errors.columns[index]}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setColumns(columns.filter((_, i) => i !== index))}
                  disabled={columns.length <= 1}
                  aria-label={`Remove column ${index + 1}`}
                  className="text-light-text-muted hover:text-brand-danger disabled:opacity-30 p-1.5 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setColumns([...columns, { name: '' }])}
            className="w-full flex items-center justify-center gap-1 py-2.5 bg-brand/10 hover:bg-brand/20 text-brand dark:text-white font-bold rounded-full text-xs transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>Add New Column</span>
          </button>
        </div>

        {isEdit && (
          <p className="text-[10px] text-brand-danger/90 leading-normal bg-brand-danger/5 p-3 rounded-lg border border-brand-danger/10">
            Note: Deleting columns permanently removes all tasks in those columns.
          </p>
        )}

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
          {isSaving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create New Board'}
        </button>
      </form>
    </ModalShell>
  );
}

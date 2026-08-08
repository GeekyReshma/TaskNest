'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

interface ColumnInput {
  id?: string;
  name: string;
}

interface AddEditBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, columns: ColumnInput[]) => void;
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
  const [boardName, setBoardName] = useState('');
  const [columns, setColumns] = useState<ColumnInput[]>([
    { name: 'Todo' },
    { name: 'Doing' },
  ]);
  const [errors, setErrors] = useState<{ boardName?: string; columns?: string[] }>({});

  const isEdit = !!board;

  // Initialize fields on open
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
    }
  }, [isOpen, board]);

  if (!isOpen) return null;

  const handleAddColumn = () => {
    setColumns([...columns, { name: '' }]);
  };

  const handleRemoveColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleColumnNameChange = (index: number, value: string) => {
    const updated = [...columns];
    updated[index].name = value;
    setColumns(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!boardName.trim()) {
      newErrors.boardName = 'Board name is required';
    }

    const columnErrors: string[] = [];
    const validColumns = columns.map((col, idx) => {
      if (!col.name.trim()) {
        columnErrors[idx] = 'Column name cannot be blank';
      }
      return col;
    });

    if (columnErrors.some(Boolean)) {
      newErrors.columns = columnErrors;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(boardName.trim(), validColumns);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 overflow-y-auto">
      <div className="w-full max-w-md bg-light-bg-card dark:bg-dark-bg-card rounded-2xl p-6 shadow-2xl border border-light-border dark:border-dark-border max-h-[90vh] overflow-y-auto transition-all">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-light-text dark:text-dark-text">
            {isEdit ? 'Edit Board' : 'Add New Board'}
          </h3>
          <button
            onClick={onClose}
            className="text-light-text-muted hover:text-brand-danger transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Board Name Input */}
          <div>
            <label className="block text-xs font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider mb-2">
              Board Name
            </label>
            <input
              type="text"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              placeholder="e.g. Platform Launch"
              className={`w-full px-4 py-2.5 bg-light-bg-body dark:bg-dark-bg-sidebar border ${
                errors.boardName ? 'border-brand-danger' : 'border-light-border dark:border-dark-border'
              } focus:border-brand dark:focus:border-brand rounded-xl text-sm outline-none transition-all text-light-text dark:text-dark-text font-medium`}
            />
            {errors.boardName && (
              <p className="text-xs text-brand-danger mt-1">{errors.boardName}</p>
            )}
          </div>

          {/* Board Columns list */}
          <div>
            <label className="block text-xs font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider mb-2">
              Board Columns
            </label>
            
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1 mb-3">
              {columns.map((col, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={col.name}
                      onChange={(e) => handleColumnNameChange(index, e.target.value)}
                      placeholder="e.g. Todo"
                      className={`w-full px-4 py-2 bg-light-bg-body dark:bg-dark-bg-sidebar border ${
                        errors.columns?.[index] ? 'border-brand-danger' : 'border-light-border dark:border-dark-border'
                      } focus:border-brand dark:focus:border-brand rounded-xl text-sm outline-none transition-all text-light-text dark:text-dark-text`}
                    />
                    {errors.columns?.[index] && (
                      <p className="text-[10px] text-brand-danger mt-0.5 ml-1">
                        {errors.columns[index]}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveColumn(index)}
                    disabled={columns.length <= 1}
                    className="text-light-text-muted hover:text-brand-danger disabled:opacity-30 disabled:hover:text-light-text-muted transition-colors p-1.5 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddColumn}
              className="w-full flex items-center justify-center gap-1 py-2.5 bg-brand/10 hover:bg-brand/20 text-brand dark:text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Add New Column</span>
            </button>
          </div>

          {/* Warning for editing */}
          {isEdit && (
            <p className="text-[10px] text-brand-danger/90 leading-normal bg-brand-danger/5 p-3 rounded-lg border border-brand-danger/10">
              Note: Deleting columns will permanently remove all tasks currently in those columns. Renaming columns retains all tasks in them.
            </p>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-brand hover:bg-brand-hover text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
            >
              {isEdit ? 'Save Changes' : 'Create Board'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-light-bg-body dark:bg-dark-border hover:bg-light-border dark:hover:bg-dark-border/80 text-brand hover:text-brand-hover dark:text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

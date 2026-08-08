'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

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
    subtasks: SubtaskInput[]
  ) => void;
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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnId, setColumnId] = useState('');
  const [subtasks, setSubtasks] = useState<SubtaskInput[]>([]);
  const [errors, setErrors] = useState<{ title?: string; subtasks?: string[] }>({});

  const isEdit = !!task;

  // Initialize fields on open
  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setColumnId(task.columnId);
        setSubtasks(task.subtasks.map((sub) => ({ id: sub.id, title: sub.title, isCompleted: sub.isCompleted })));
      } else {
        setTitle('');
        setDescription('');
        setColumnId(columns[0]?.id || '');
        setSubtasks([
          { title: 'e.g. Conduct user research', isCompleted: false },
          { title: 'e.g. Outline page components', isCompleted: false },
        ]);
      }
      setErrors({});
    }
  }, [isOpen, task, columns]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, { title: '', isCompleted: false }]);
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubtaskChange = (index: number, value: string) => {
    const updated = [...subtasks];
    updated[index].title = value;
    setSubtasks(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    const subtaskErrors: string[] = [];
    const validSubtasks = subtasks.map((sub, idx) => {
      if (!sub.title.trim()) {
        subtaskErrors[idx] = 'Subtask description is required';
      }
      return sub;
    });

    if (subtaskErrors.some(Boolean)) {
      newErrors.subtasks = subtaskErrors;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Find the status name matching the selected columnId
    const selectedColumn = columns.find((col) => col.id === columnId);
    const status = selectedColumn ? selectedColumn.name : '';

    onSave(title.trim(), description.trim(), status, columnId, validSubtasks);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 overflow-y-auto">
      <div className="w-full max-w-md bg-light-bg-card dark:bg-dark-bg-card rounded-2xl p-6 shadow-2xl border border-light-border dark:border-dark-border max-h-[90vh] overflow-y-auto transition-all">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-light-text dark:text-dark-text">
            {isEdit ? 'Edit Task' : 'Add New Task'}
          </h3>
          <button
            onClick={onClose}
            className="text-light-text-muted hover:text-brand-danger transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Take coffee break"
              className={`w-full px-4 py-2.5 bg-light-bg-body dark:bg-dark-bg-sidebar border ${
                errors.title ? 'border-brand-danger' : 'border-light-border dark:border-dark-border'
              } focus:border-brand dark:focus:border-brand rounded-xl text-sm outline-none transition-all text-light-text dark:text-dark-text font-medium`}
            />
            {errors.title && (
              <p className="text-xs text-brand-danger mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-xs font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. It's always good to take a break. This 15-minute break will recharge the batteries a little."
              rows={3}
              className="w-full px-4 py-2.5 bg-light-bg-body dark:bg-dark-bg-sidebar border border-light-border dark:border-dark-border focus:border-brand dark:focus:border-brand rounded-xl text-sm outline-none transition-all text-light-text dark:text-dark-text resize-none font-medium"
            />
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-xs font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider mb-2">
              Subtasks
            </label>
            
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1 mb-3">
              {subtasks.map((sub, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={sub.title}
                      onChange={(e) => handleSubtaskChange(index, e.target.value)}
                      placeholder="Subtask text"
                      className={`w-full px-4 py-2 bg-light-bg-body dark:bg-dark-bg-sidebar border ${
                        errors.subtasks?.[index] ? 'border-brand-danger' : 'border-light-border dark:border-dark-border'
                      } focus:border-brand dark:focus:border-brand rounded-xl text-sm outline-none transition-all text-light-text dark:text-dark-text`}
                    />
                    {errors.subtasks?.[index] && (
                      <p className="text-[10px] text-brand-danger mt-0.5 ml-1">
                        {errors.subtasks[index]}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(index)}
                    className="text-light-text-muted hover:text-brand-danger transition-colors p-1.5 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddSubtask}
              className="w-full flex items-center justify-center gap-1 py-2.5 bg-brand/10 hover:bg-brand/20 text-brand dark:text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Add New Subtask</span>
            </button>
          </div>

          {/* Column/Status Dropdown */}
          <div>
            <label className="block text-xs font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider mb-2">
              Current Status
            </label>
            <select
              value={columnId}
              onChange={(e) => setColumnId(e.target.value)}
              className="w-full px-4 py-2.5 bg-light-bg-body dark:bg-dark-bg-sidebar border border-light-border dark:border-dark-border focus:border-brand dark:focus:border-brand rounded-xl text-sm outline-none transition-all text-light-text dark:text-dark-text font-medium"
            >
              {columns.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-brand hover:bg-brand-hover text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
            >
              {isEdit ? 'Save Changes' : 'Create Task'}
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

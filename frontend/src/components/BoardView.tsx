'use client';

import React from 'react';
import { Plus } from 'lucide-react';

import { Task, Board } from '../utils/api';

interface BoardViewProps {
  board: Board | null;
  onTaskClick: (task: Task) => void;
  onAddColumnClick: () => void;
  onMoveTask: (taskId: string, targetColumnId: string, targetStatus: string) => void;
}

// Map column index to colored dot styles
const DOT_COLORS = [
  'bg-blue-400',
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-purple-500',
  'bg-amber-500',
  'bg-rose-500',
];

export default function BoardView({
  board,
  onTaskClick,
  onAddColumnClick,
  onMoveTask,
}: BoardViewProps) {
  if (!board) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-light-bg-body dark:bg-dark-bg-body text-center">
        <h2 className="text-lg font-bold text-light-text-muted dark:text-dark-text-muted mb-2">
          No Board Selected
        </h2>
        <p className="text-sm text-light-text-muted/75 dark:text-dark-text-muted/75 max-w-sm">
          Please select an existing board from the sidebar, or create a new board to get started.
        </p>
      </div>
    );
  }

  const { name, columns } = board;

  if (columns.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-light-bg-body dark:bg-dark-bg-body text-center transition-colors">
        <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
          This board is empty. Create a new column to get started.
        </h2>
        <button
          onClick={onAddColumnClick}
          className="flex items-center gap-1.5 py-3 px-5 bg-brand hover:bg-brand-hover text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Column</span>
        </button>
      </div>
    );
  }

  // HTML5 Drag and Drop event handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string, targetStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onMoveTask(taskId, targetColumnId, targetStatus);
    }
  };

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-light-bg-body dark:bg-dark-bg-body transition-colors flex gap-6 h-full items-start">
      
      {/* Columns Grid */}
      {columns.map((column, index) => {
        const dotColor = DOT_COLORS[index % DOT_COLORS.length];
        
        return (
          <div
            key={column.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id, column.name)}
            className="w-[280px] flex-shrink-0 flex flex-col max-h-full pb-4"
          >
            {/* Column Header */}
            <div className="flex items-center gap-2 mb-4 flex-shrink-0">
              <span className={`w-3.5 h-3.5 rounded-full ${dotColor}`} />
              <h3 className="text-xs font-bold text-light-text-muted dark:text-dark-text-muted tracking-widest uppercase truncate max-w-[200px]">
                {column.name} ({column.tasks.length})
              </h3>
            </div>

            {/* Column Task Cards container */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[300px] border border-transparent rounded-xl">
              {column.tasks.map((task) => {
                const subtasksCount = task.subtasks.length;
                const completedSubtasks = task.subtasks.filter((s) => s.isCompleted).length;

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => onTaskClick(task)}
                    className="bg-light-bg-card dark:bg-dark-bg-card border border-light-border dark:border-dark-border/40 rounded-xl p-5 shadow-sm hover:shadow-md cursor-pointer hover:border-brand dark:hover:border-brand transform hover:-translate-y-0.5 active:translate-y-0 transition-all select-none group"
                  >
                    <h4 className="text-sm font-bold text-light-text dark:text-dark-text leading-snug group-hover:text-brand dark:group-hover:text-brand-hover transition-colors mb-2">
                      {task.title}
                    </h4>
                    <p className="text-xs text-light-text-muted dark:text-dark-text-muted font-semibold">
                      {completedSubtasks} of {subtasksCount} subtasks
                    </p>
                  </div>
                );
              })}

              {column.tasks.length === 0 && (
                <div className="h-full min-h-[150px] border border-dashed border-light-text-muted/20 dark:border-dark-text-muted/20 rounded-xl flex items-center justify-center p-4">
                  <p className="text-xs text-light-text-muted/50 dark:text-dark-text-muted/50 font-medium italic">
                    Drag tasks here
                  </p>
                </div>
              )}
            </div>

          </div>
        );
      })}

      {/* Add New Column Box */}
      <button
        onClick={onAddColumnClick}
        className="w-[280px] h-[calc(100%-40px)] mt-9 flex-shrink-0 bg-light-bg-card/40 dark:bg-dark-bg-card/20 hover:bg-light-bg-card/85 dark:hover:bg-dark-bg-card/45 border-2 border-dashed border-light-border dark:border-dark-border/50 hover:border-brand dark:hover:border-brand rounded-2xl flex flex-col items-center justify-center gap-1.5 p-6 group transition-all text-center cursor-pointer min-h-[400px]"
      >
        <div className="w-9 h-9 rounded-full bg-brand/10 text-brand dark:text-white flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all shadow-sm">
          <Plus size={16} />
        </div>
        <span className="text-sm font-bold text-light-text-muted dark:text-dark-text-muted group-hover:text-brand dark:group-hover:text-brand-hover transition-all">
          + New Column
        </span>
      </button>

    </div>
  );
}

'use client';

import React, { useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { Task, Board } from '../utils/api';

interface BoardViewProps {
  board: Board | null;
  onTaskClick: (task: Task) => void;
  onAddColumnClick: () => void;
  onMoveTask: (
    taskId: string,
    targetColumnId: string,
    targetStatus: string,
    position: number,
  ) => void;
}

const DOT_COLORS = [
  'bg-[#49C4E9]',
  'bg-[#8471F2]',
  'bg-[#67E2AE]',
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
  const [dragOver, setDragOver] = useState<{ columnId: string; index: number } | null>(null);
  const draggedTaskId = useRef<string | null>(null);
  const didDrag = useRef(false);

  if (!board) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-light-bg-body dark:bg-dark-bg-body text-center">
        <h2 className="text-lg font-bold text-light-text-muted dark:text-dark-text-muted mb-2">
          No Board Selected
        </h2>
        <p className="text-sm text-light-text-muted/75 dark:text-dark-text-muted/75 max-w-sm">
          Select an existing board from the sidebar, or create a new board to get started.
        </p>
      </div>
    );
  }

  const { columns } = board;

  if (columns.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-light-bg-body dark:bg-dark-bg-body text-center">
        <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
          This board is empty. Create a new column to get started.
        </h2>
        <button
          type="button"
          onClick={onAddColumnClick}
          className="flex items-center gap-1.5 py-3 px-5 bg-brand hover:bg-brand-hover text-white rounded-full font-bold text-sm shadow-md transition-all cursor-pointer"
        >
          <Plus size={16} aria-hidden="true" />
          <span>Add New Column</span>
        </button>
      </div>
    );
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    draggedTaskId.current = taskId;
    didDrag.current = false;
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    draggedTaskId.current = null;
    setDragOver(null);
  };

  const handleDropAt = (
    e: React.DragEvent,
    targetColumnId: string,
    targetStatus: string,
    position: number,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId.current;
    setDragOver(null);
    if (taskId) {
      didDrag.current = true;
      onMoveTask(taskId, targetColumnId, targetStatus, position);
    }
  };

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 sm:p-6 bg-light-bg-body dark:bg-dark-bg-body transition-colors flex gap-4 sm:gap-6 h-full items-start">
      {columns.map((column, index) => {
        const dotColor = DOT_COLORS[index % DOT_COLORS.length];

        return (
          <div
            key={column.id}
            className="w-[260px] sm:w-[280px] flex-shrink-0 flex flex-col max-h-full pb-4"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver({ columnId: column.id, index: column.tasks.length });
            }}
            onDrop={(e) =>
              handleDropAt(e, column.id, column.name, column.tasks.length)
            }
          >
            <div className="flex items-center gap-2 mb-4 flex-shrink-0">
              <span className={`w-3.5 h-3.5 rounded-full ${dotColor}`} aria-hidden="true" />
              <h3 className="text-xs font-bold text-light-text-muted dark:text-dark-text-muted tracking-[2.4px] uppercase truncate max-w-[200px]">
                {column.name} ({column.tasks.length})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[200px] sm:min-h-[300px]">
              {column.tasks.map((task, taskIndex) => {
                const subtasksCount = task.subtasks.length;
                const completedSubtasks = task.subtasks.filter((s) => s.isCompleted).length;
                const isDropTarget =
                  dragOver?.columnId === column.id && dragOver.index === taskIndex;

                return (
                  <React.Fragment key={task.id}>
                    {isDropTarget && (
                      <div className="h-1 rounded-full bg-brand/70" aria-hidden="true" />
                    )}
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOver({ columnId: column.id, index: taskIndex });
                      }}
                      onDrop={(e) => handleDropAt(e, column.id, column.name, taskIndex)}
                      onClick={() => {
                        if (didDrag.current) {
                          didDrag.current = false;
                          return;
                        }
                        onTaskClick(task);
                      }}
                      className="bg-light-bg-card dark:bg-dark-bg-card rounded-lg p-4 shadow-[0_4px_6px_rgba(54,78,126,0.10)] hover:shadow-md cursor-grab active:cursor-grabbing hover:ring-1 hover:ring-brand/40 transition-all select-none group"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onTaskClick(task);
                        }
                      }}
                      aria-label={`Task: ${task.title}`}
                    >
                      <h4 className="text-[15px] font-bold text-light-text dark:text-dark-text leading-snug group-hover:text-brand transition-colors mb-2 break-words">
                        {task.title}
                      </h4>
                      <p className="text-xs text-light-text-muted dark:text-dark-text-muted font-bold">
                        {completedSubtasks} of {subtasksCount} subtasks
                      </p>
                    </div>
                  </React.Fragment>
                );
              })}

              {dragOver?.columnId === column.id &&
                dragOver.index === column.tasks.length &&
                column.tasks.length > 0 && (
                  <div className="h-1 rounded-full bg-brand/70" aria-hidden="true" />
                )}

              {column.tasks.length === 0 && (
                <div className="min-h-[150px] border border-dashed border-light-text-muted/20 dark:border-dark-text-muted/20 rounded-xl flex items-center justify-center p-4">
                  <p className="text-xs text-light-text-muted/50 dark:text-dark-text-muted/50 font-medium italic">
                    Drag tasks here
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={onAddColumnClick}
        className="w-[260px] sm:w-[280px] h-[calc(100%-36px)] mt-8 flex-shrink-0 bg-gradient-to-b from-light-bg-card/80 to-transparent dark:from-dark-bg-card/25 dark:to-transparent hover:from-brand/10 border border-transparent rounded-md flex flex-col items-center justify-center gap-1.5 p-6 group transition-all text-center cursor-pointer min-h-[280px] sm:min-h-[400px]"
      >
        <span className="text-2xl font-bold text-light-text-muted dark:text-dark-text-muted group-hover:text-brand transition-all">
          + New Column
        </span>
      </button>
    </div>
  );
}

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, MoreVertical, Eye, Edit2, Trash2, Menu, LayoutGrid, ChevronDown } from 'lucide-react';
import * as api from '../utils/api';
import { useGuestSession } from '../hooks/useGuestSession';
import { useTheme } from '../hooks/useTheme';
import GuestLogin from '../components/GuestLogin';
import Sidebar from '../components/Sidebar';
import BoardView from '../components/BoardView';
import TaskDetailsModal from '../components/Modals/TaskDetailsModal';
import AddEditTaskModal from '../components/Modals/AddEditTaskModal';
import AddEditBoardModal from '../components/Modals/AddEditBoardModal';
import DeleteConfirmModal from '../components/Modals/DeleteConfirmModal';

export default function Dashboard() {
  const { guest, isChecking, login, logout } = useGuestSession();
  const { isDarkTheme, toggleTheme } = useTheme();

  const [boards, setBoards] = useState<api.Board[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showBoardMenu, setShowBoardMenu] = useState(false);
  const [showMobileBoardPicker, setShowMobileBoardPicker] = useState(false);
  const boardMenuRef = useRef<HTMLDivElement>(null);

  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<api.Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<api.Task | null>(null);
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [boardToEdit, setBoardToEdit] = useState<api.Board | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<'board' | 'task'>('board');

  const showError = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 4000);
  };

  const loadBoards = useCallback(async (selectFirst = false) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.fetchBoards();
      setBoards(data);
      setActiveBoardId((current) => {
        if (data.length === 0) return null;
        if (selectFirst || !current || !data.some((b) => b.id === current)) {
          return data[0].id;
        }
        return current;
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch boards';
      setError(message);
      if (err instanceof api.ApiError && err.status === 401) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (guest) {
      void loadBoards();
    }
  }, [guest, loadBoards]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (boardMenuRef.current && !boardMenuRef.current.contains(event.target as Node)) {
        setShowBoardMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setIsSidebarOpen(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const activeBoard = boards.find((b) => b.id === activeBoardId) || null;

  useEffect(() => {
    if (!selectedTask || !activeBoard) return;
    let found: api.Task | null = null;
    for (const col of activeBoard.columns) {
      const t = col.tasks.find((task) => task.id === selectedTask.id);
      if (t) {
        found = t;
        break;
      }
    }
    if (found) setSelectedTask(found);
    else {
      setIsTaskDetailsOpen(false);
      setSelectedTask(null);
    }
  }, [boards, activeBoardId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMoveTask = async (
    taskId: string,
    targetColumnId: string,
    targetStatus: string,
    position: number,
  ) => {
    try {
      await api.moveTask(taskId, targetColumnId, targetStatus, position);
      await loadBoards();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error moving task');
    }
  };

  const handleToggleSubtask = async (subtaskId: string, isCompleted: boolean) => {
    try {
      await api.toggleSubtask(subtaskId, isCompleted);
      await loadBoards();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error updating subtask');
    }
  };

  const handleTaskStatusChange = async (
    taskId: string,
    newColumnId: string,
    newStatus: string,
  ) => {
    try {
      const col = activeBoard?.columns.find((c) => c.id === newColumnId);
      const position = col ? col.tasks.filter((t) => t.id !== taskId).length : 0;
      await api.moveTask(taskId, newColumnId, newStatus, position);
      await loadBoards();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error updating task status');
    }
  };

  const handleSaveBoard = async (
    name: string,
    columns: { id?: string; name: string }[],
  ) => {
    if (boardToEdit) {
      await api.updateBoard(boardToEdit.id, name, columns);
    } else {
      const created = await api.createBoard(
        name,
        columns.map((c) => c.name),
      );
      setActiveBoardId(created.id);
    }
    await loadBoards();
  };

  const handleConfirmDeleteBoard = async () => {
    if (!activeBoardId) return;
    await api.deleteBoard(activeBoardId);
    setIsDeleteModalOpen(false);
    setActiveBoardId(null);
    await loadBoards(true);
  };

  const handleSaveTask = async (
    title: string,
    description: string,
    status: string,
    columnId: string,
    subtasks: { id?: string; title: string; isCompleted: boolean }[],
  ) => {
    if (taskToEdit) {
      await api.updateTask(taskToEdit.id, {
        title,
        description,
        status,
        columnId,
        subtasks: subtasks.map((s) => ({
          id: s.id,
          title: s.title,
          isCompleted: s.isCompleted,
        })),
      });
    } else {
      await api.createTask(
        title,
        description,
        status,
        columnId,
        subtasks.map((s) => s.title),
      );
    }
    await loadBoards();
  };

  const handleConfirmDeleteTask = async () => {
    if (!selectedTask) return;
    await api.deleteTask(selectedTask.id);
    setIsDeleteModalOpen(false);
    setIsTaskDetailsOpen(false);
    setSelectedTask(null);
    await loadBoards();
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg-body dark:bg-dark-bg-body">
        <div
          className="w-8 h-8 rounded-full border-4 border-brand border-t-transparent animate-spin"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!guest) {
    return (
      <GuestLogin
        onLogin={async (name) => {
          await login(name);
        }}
      />
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-light-bg-body dark:bg-dark-bg-body transition-colors">
      <Sidebar
        boards={boards}
        activeBoardId={activeBoardId}
        onSelectBoard={(id) => {
          setActiveBoardId(id);
          setShowBoardMenu(false);
          setShowMobileBoardPicker(false);
        }}
        onCreateBoardClick={() => {
          setBoardToEdit(null);
          setIsBoardModalOpen(true);
        }}
        isDarkTheme={isDarkTheme}
        onToggleTheme={toggleTheme}
        guestName={guest.name}
        onLogout={() => {
          logout();
          setBoards([]);
          setActiveBoardId(null);
        }}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <header className="h-16 md:h-20 bg-light-bg-card dark:bg-dark-bg-sidebar border-b border-light-border dark:border-dark-border flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {!isSidebarOpen && (
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="hidden lg:flex w-10 h-10 rounded-r-full bg-brand text-white items-center justify-center -ml-4 sm:-ml-6 shadow-md hover:bg-brand-hover transition-colors cursor-pointer"
                aria-label="Show sidebar"
              >
                <Eye size={18} />
              </button>
            )}

            <div className="lg:hidden flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-brand flex items-center justify-center text-white">
                <LayoutGrid size={14} aria-hidden="true" />
              </div>
              <button
                type="button"
                onClick={() => setShowMobileBoardPicker((v) => !v)}
                className="flex items-center gap-1 min-w-0"
                aria-expanded={showMobileBoardPicker}
                aria-label="Select board"
              >
                <span className="text-lg font-bold text-light-text dark:text-dark-text truncate max-w-[140px] sm:max-w-[220px]">
                  {activeBoard ? activeBoard.name : 'TaskNest'}
                </span>
                <ChevronDown size={16} className="text-light-text-muted flex-shrink-0" />
              </button>
            </div>

            <h2 className="hidden lg:block text-xl xl:text-2xl font-bold text-light-text dark:text-dark-text truncate leading-tight">
              {activeBoard ? activeBoard.name : 'TaskNest Workspace'}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                setTaskToEdit(null);
                setIsTaskModalOpen(true);
              }}
              disabled={!activeBoard || activeBoard.columns.length === 0}
              className="flex items-center gap-1.5 py-2.5 sm:py-3 px-4 sm:px-5 bg-brand hover:bg-brand-hover disabled:opacity-40 text-white rounded-full font-bold text-xs shadow-md transition-all cursor-pointer"
              aria-label="Add new task"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Add New Task</span>
            </button>

            {activeBoard && (
              <div className="relative" ref={boardMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowBoardMenu(!showBoardMenu)}
                  aria-label="Board options"
                  aria-expanded={showBoardMenu}
                  className="p-2 text-light-text-muted hover:text-brand dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <MoreVertical size={20} />
                </button>

                {showBoardMenu && (
                  <div className="absolute right-0 mt-2 w-44 bg-light-bg-card dark:bg-dark-bg-sidebar border border-light-border dark:border-dark-border rounded-xl shadow-xl py-1.5 z-30">
                    <button
                      type="button"
                      onClick={() => {
                        setShowBoardMenu(false);
                        setBoardToEdit(activeBoard);
                        setIsBoardModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-light-text dark:text-dark-text hover:bg-light-bg-body dark:hover:bg-dark-border transition-colors text-left cursor-pointer"
                    >
                      <Edit2 size={12} />
                      <span>Edit Board</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowBoardMenu(false);
                        setDeleteTarget('board');
                        setIsDeleteModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-brand-danger hover:bg-brand-danger/5 transition-colors text-left cursor-pointer"
                    >
                      <Trash2 size={12} />
                      <span>Delete Board</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-light-text-muted hover:text-brand rounded-lg"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        {showMobileBoardPicker && (
          <div className="lg:hidden border-b border-light-border dark:border-dark-border bg-light-bg-card dark:bg-dark-bg-sidebar px-4 py-3 space-y-1 z-20">
            {boards.map((board) => (
              <button
                key={board.id}
                type="button"
                onClick={() => {
                  setActiveBoardId(board.id);
                  setShowMobileBoardPicker(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold ${
                  board.id === activeBoardId
                    ? 'bg-brand text-white'
                    : 'text-light-text-muted hover:bg-light-bg-body dark:hover:bg-dark-border'
                }`}
              >
                {board.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setShowMobileBoardPicker(false);
                setBoardToEdit(null);
                setIsBoardModalOpen(true);
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold text-brand"
            >
              + Create New Board
            </button>
          </div>
        )}

        {toast && (
          <div
            className="mx-4 mt-3 px-4 py-2.5 rounded-xl bg-brand-danger/10 border border-brand-danger/20 text-brand-danger text-xs font-semibold"
            role="alert"
          >
            {toast}
          </div>
        )}

        {isLoading && boards.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div
              className="w-8 h-8 rounded-full border-4 border-brand border-t-transparent animate-spin"
              aria-label="Loading boards"
            />
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-sm font-bold text-brand-danger mb-4">{error}</p>
            <button
              type="button"
              onClick={() => loadBoards()}
              className="py-2.5 px-4 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-full shadow-sm cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <BoardView
            board={activeBoard}
            onTaskClick={(task) => {
              setSelectedTask(task);
              setIsTaskDetailsOpen(true);
            }}
            onAddColumnClick={() => {
              setBoardToEdit(activeBoard);
              setIsBoardModalOpen(true);
            }}
            onMoveTask={handleMoveTask}
          />
        )}
      </div>

      <AddEditBoardModal
        isOpen={isBoardModalOpen}
        onClose={() => {
          setIsBoardModalOpen(false);
          setBoardToEdit(null);
        }}
        onSave={handleSaveBoard}
        board={
          boardToEdit
            ? {
                id: boardToEdit.id,
                name: boardToEdit.name,
                columns: boardToEdit.columns.map((c) => ({ id: c.id, name: c.name })),
              }
            : undefined
        }
      />

      {selectedTask && activeBoard && (
        <TaskDetailsModal
          isOpen={isTaskDetailsOpen}
          onClose={() => {
            setIsTaskDetailsOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          columns={activeBoard.columns.map((c) => ({ id: c.id, name: c.name }))}
          onToggleSubtask={handleToggleSubtask}
          onStatusChange={handleTaskStatusChange}
          onEditClick={() => {
            setIsTaskDetailsOpen(false);
            setTaskToEdit(selectedTask);
            setIsTaskModalOpen(true);
          }}
          onDeleteClick={() => {
            setDeleteTarget('task');
            setIsDeleteModalOpen(true);
          }}
        />
      )}

      {activeBoard && (
        <AddEditTaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setTaskToEdit(null);
          }}
          onSave={handleSaveTask}
          columns={activeBoard.columns.map((c) => ({ id: c.id, name: c.name }))}
          task={
            taskToEdit
              ? {
                  id: taskToEdit.id,
                  title: taskToEdit.title,
                  description: taskToEdit.description,
                  status: taskToEdit.status,
                  columnId: taskToEdit.columnId,
                  subtasks: taskToEdit.subtasks.map((s) => ({
                    id: s.id,
                    title: s.title,
                    isCompleted: s.isCompleted,
                  })),
                }
              : undefined
          }
        />
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteTarget === 'board' ? handleConfirmDeleteBoard : handleConfirmDeleteTask}
        title={deleteTarget === 'board' ? 'Delete this board?' : 'Delete this task?'}
        description={
          deleteTarget === 'board'
            ? `Are you sure you want to delete the "${activeBoard?.name}" board? This action will remove all columns and tasks and cannot be undone.`
            : `Are you sure you want to delete the "${selectedTask?.title}" task and its subtasks? This action cannot be undone.`
        }
      />
    </div>
  );
}

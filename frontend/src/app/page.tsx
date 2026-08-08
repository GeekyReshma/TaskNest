'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutGrid,
  Plus,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Menu,
} from 'lucide-react';
import * as api from '../utils/api';
import GuestLogin from '../components/GuestLogin';
import Sidebar from '../components/Sidebar';
import BoardView from '../components/BoardView';

// Modal imports
import TaskDetailsModal from '../components/Modals/TaskDetailsModal';
import AddEditTaskModal from '../components/Modals/AddEditTaskModal';
import AddEditBoardModal from '../components/Modals/AddEditBoardModal';
import DeleteConfirmModal from '../components/Modals/DeleteConfirmModal';

export default function Dashboard() {
  // Auth state
  const [guestName, setGuestName] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // App data state
  const [boards, setBoards] = useState<api.Board[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI toggle states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [showBoardMenu, setShowBoardMenu] = useState(false);
  const boardMenuRef = useRef<HTMLDivElement>(null);

  // Modal open states & selected entities
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<api.Task | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<api.Task | null>(null);

  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [boardToEdit, setBoardToEdit] = useState<api.Board | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<'board' | 'task'>('board');

  // Load guest session and theme on mount
  useEffect(() => {
    const savedName = localStorage.getItem('tasknest_guest_name');
    if (savedName) {
      setGuestName(savedName);
    }
    
    const savedTheme = localStorage.getItem('tasknest_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const darkThemeEnabled = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    
    setIsDarkTheme(darkThemeEnabled);
    if (darkThemeEnabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setIsAuthChecking(false);
  }, []);

  // Fetch boards once guest session is unlocked
  const loadBoards = async (selectFirst = false) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.fetchBoards();
      setBoards(data);
      if (data.length > 0) {
        if (selectFirst || !activeBoardId || !data.some((b) => b.id === activeBoardId)) {
          setActiveBoardId(data[0].id);
        }
      } else {
        setActiveBoardId(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch boards from API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (guestName) {
      loadBoards();
    }
  }, [guestName]);

  // Handle board menu outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (boardMenuRef.current && !boardMenuRef.current.contains(event.target as Node)) {
        setShowBoardMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Theme switcher
  const handleToggleTheme = () => {
    const nextVal = !isDarkTheme;
    setIsDarkTheme(nextVal);
    if (nextVal) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tasknest_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tasknest_theme', 'light');
    }
  };

  // Login handler
  const handleLogin = (name: string) => {
    localStorage.setItem('tasknest_guest_name', name);
    setGuestName(name);
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('tasknest_guest_name');
    setGuestName(null);
    setBoards([]);
    setActiveBoardId(null);
  };

  // Find active board helper
  const activeBoard = boards.find((b) => b.id === activeBoardId) || null;

  // Task events
  const handleTaskClick = (task: api.Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };

  // Refresh active task details if it changes in local data
  useEffect(() => {
    if (selectedTask && activeBoard) {
      // Find matching task inside columns
      let found: api.Task | null = null;
      for (const col of activeBoard.columns) {
        const t = col.tasks.find((task) => task.id === selectedTask.id);
        if (t) {
          found = t;
          break;
        }
      }
      if (found) {
        setSelectedTask(found);
      } else {
        setIsTaskDetailsOpen(false);
        setSelectedTask(null);
      }
    }
  }, [boards, activeBoardId]);

  // Task Move / Drag
  const handleMoveTask = async (taskId: string, targetColumnId: string, targetStatus: string) => {
    try {
      await api.updateTask(taskId, { columnId: targetColumnId, status: targetStatus });
      await loadBoards();
    } catch (err: any) {
      alert(`Error moving task: ${err.message}`);
    }
  };

  // Toggle Subtask Checked State
  const handleToggleSubtask = async (subtaskId: string, isCompleted: boolean) => {
    try {
      await api.toggleSubtask(subtaskId, isCompleted);
      await loadBoards();
    } catch (err: any) {
      alert(`Error updating subtask: ${err.message}`);
    }
  };

  // Change Task Status Column in Details view
  const handleTaskStatusChange = async (taskId: string, newColumnId: string, newStatus: string) => {
    try {
      await api.updateTask(taskId, { columnId: newColumnId, status: newStatus });
      await loadBoards();
    } catch (err: any) {
      alert(`Error updating task status: ${err.message}`);
    }
  };

  // Board save (Create / Update)
  const handleSaveBoard = async (name: string, columns: { id?: string; name: string }[]) => {
    try {
      if (boardToEdit) {
        await api.updateBoard(boardToEdit.id, name, columns);
      } else {
        const created = await api.createBoard(name, columns.map((c) => c.name));
        setActiveBoardId(created.id);
      }
      await loadBoards();
    } catch (err: any) {
      alert(`Error saving board: ${err.message}`);
    }
  };

  // Board delete confirm
  const handleConfirmDeleteBoard = async () => {
    if (!activeBoardId) return;
    try {
      await api.deleteBoard(activeBoardId);
      setIsDeleteModalOpen(false);
      setActiveBoardId(null);
      await loadBoards(true);
    } catch (err: any) {
      alert(`Error deleting board: ${err.message}`);
    }
  };

  // Task save (Create / Update)
  const handleSaveTask = async (
    title: string,
    description: string,
    status: string,
    columnId: string,
    subtasks: { id?: string; title: string; isCompleted: boolean }[]
  ) => {
    try {
      if (taskToEdit) {
        const subtasksPayload = subtasks.map((s) => ({
          id: s.id,
          title: s.title,
          isCompleted: s.isCompleted,
        }));
        await api.updateTask(taskToEdit.id, {
          title,
          description,
          status,
          columnId,
          subtasks: subtasksPayload,
        });
      } else {
        await api.createTask(
          title,
          description,
          status,
          columnId,
          subtasks.map((s) => s.title)
        );
      }
      await loadBoards();
    } catch (err: any) {
      alert(`Error saving task: ${err.message}`);
    }
  };

  // Task delete confirm
  const handleConfirmDeleteTask = async () => {
    if (!selectedTask) return;
    try {
      await api.deleteTask(selectedTask.id);
      setIsDeleteModalOpen(false);
      setIsTaskDetailsOpen(false);
      setSelectedTask(null);
      await loadBoards();
    } catch (err: any) {
      alert(`Error deleting task: ${err.message}`);
    }
  };

  // Render auth checking
  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg-body dark:bg-dark-bg-body">
        <div className="w-8 h-8 rounded-full border-4 border-brand border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Render Login overlay
  if (!guestName) {
    return <GuestLogin onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-light-bg-body dark:bg-dark-bg-body transition-colors">
      
      {/* 1. Sidebar Panel */}
      <Sidebar
        boards={boards}
        activeBoardId={activeBoardId}
        onSelectBoard={(id) => {
          setActiveBoardId(id);
          setShowBoardMenu(false);
        }}
        onCreateBoardClick={() => {
          setBoardToEdit(null);
          setIsBoardModalOpen(true);
        }}
        isDarkTheme={isDarkTheme}
        onToggleTheme={handleToggleTheme}
        guestName={guestName}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Board Work Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* 2. Top Header Navigation Bar */}
        <header className="h-20 bg-light-bg-card dark:bg-dark-bg-sidebar border-b border-light-border dark:border-dark-border flex items-center justify-between px-6 flex-shrink-0 transition-colors">
          
          <div className="flex items-center gap-4 min-w-0">
            {/* Show Sidebar Indicator if collapsed */}
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="w-10 h-10 rounded-r-full bg-brand text-white flex items-center justify-center -ml-6 shadow-md hover:bg-brand-hover transition-colors cursor-pointer"
                title="Show Sidebar"
              >
                <Eye size={18} />
              </button>
            )}

            {/* Mobile Menu Icon (Sidebar display on mobile) */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-light-text-muted hover:text-brand dark:hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <Menu size={20} />
            </button>

            <h2 className="text-xl font-bold text-light-text dark:text-dark-text truncate leading-tight">
              {activeBoard ? activeBoard.name : 'TaskNest Workspace'}
            </h2>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {/* Add Task Trigger */}
            <button
              onClick={() => {
                setTaskToEdit(null);
                setIsTaskModalOpen(true);
              }}
              disabled={!activeBoard || activeBoard.columns.length === 0}
              className="flex items-center gap-1.5 py-3 px-5 bg-brand hover:bg-brand-hover disabled:opacity-40 disabled:hover:bg-brand text-white rounded-full font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Add New Task</span>
            </button>

            {/* Board Options Dots Menu */}
            {activeBoard && (
              <div className="relative" ref={boardMenuRef}>
                <button
                  onClick={() => setShowBoardMenu(!showBoardMenu)}
                  className="p-2 text-light-text-muted hover:text-brand dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <MoreVertical size={20} />
                </button>

                {showBoardMenu && (
                  <div className="absolute right-0 mt-2 w-44 bg-light-bg-card dark:bg-dark-bg-sidebar border border-light-border dark:border-dark-border rounded-xl shadow-xl py-1.5 z-30">
                    <button
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
          </div>
        </header>

        {/* 3. API Load / Error Banner / Grid Body */}
        {isLoading && boards.length === 0 ? (
          <div className="flex-1 flex items-center justify-center bg-light-bg-body dark:bg-dark-bg-body">
            <div className="w-8 h-8 rounded-full border-4 border-brand border-t-transparent animate-spin"></div>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-light-bg-body dark:bg-dark-bg-body text-center">
            <p className="text-sm font-bold text-brand-danger mb-4">Error: {error}</p>
            <button
              onClick={() => loadBoards()}
              className="py-2.5 px-4 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <BoardView
            board={activeBoard}
            onTaskClick={handleTaskClick}
            onAddColumnClick={() => {
              setBoardToEdit(activeBoard);
              setIsBoardModalOpen(true);
            }}
            onMoveTask={handleMoveTask}
          />
        )}

      </div>

      {/* ========================================================
          MODAL OVERLAYS CONTAINER
          ======================================================== */}
      
      {/* Board Form Modal */}
      <AddEditBoardModal
        isOpen={isBoardModalOpen}
        onClose={() => {
          setIsBoardModalOpen(false);
          setBoardToEdit(null);
        }}
        onSave={handleSaveBoard}
        board={boardToEdit ? {
          id: boardToEdit.id,
          name: boardToEdit.name,
          columns: boardToEdit.columns.map((c) => ({ id: c.id, name: c.name })),
        } : undefined}
      />

      {/* Task Details Modal */}
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

      {/* Task Form Modal */}
      {activeBoard && (
        <AddEditTaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setTaskToEdit(null);
          }}
          onSave={handleSaveTask}
          columns={activeBoard.columns.map((c) => ({ id: c.id, name: c.name }))}
          task={taskToEdit ? {
            id: taskToEdit.id,
            title: taskToEdit.title,
            description: taskToEdit.description,
            status: taskToEdit.status,
            columnId: taskToEdit.columnId,
            subtasks: taskToEdit.subtasks.map((s) => ({ id: s.id, title: s.title, isCompleted: s.isCompleted })),
          } : undefined}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
        }}
        onConfirm={deleteTarget === 'board' ? handleConfirmDeleteBoard : handleConfirmDeleteTask}
        title={deleteTarget === 'board' ? 'Delete this board?' : 'Delete this task?'}
        description={
          deleteTarget === 'board'
            ? `Are you sure you want to delete the "${activeBoard?.name}" board? This action will remove all columns and tasks inside this board and cannot be undone.`
            : `Are you sure you want to delete the "${selectedTask?.title}" task and its subtasks? This action cannot be undone.`
        }
      />

    </div>
  );
}

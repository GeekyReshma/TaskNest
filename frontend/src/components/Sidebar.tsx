'use client';

import React from 'react';
import { LayoutGrid, Plus, Moon, Sun, EyeOff, LogOut } from 'lucide-react';

interface Board {
  id: string;
  name: string;
}

interface SidebarProps {
  boards: Board[];
  activeBoardId: string | null;
  onSelectBoard: (boardId: string) => void;
  onCreateBoardClick: () => void;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  guestName: string;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({
  boards,
  activeBoardId,
  onSelectBoard,
  onCreateBoardClick,
  isDarkTheme,
  onToggleTheme,
  guestName,
  onLogout,
  isOpen,
  setIsOpen,
}: SidebarProps) {
  const selectBoard = (id: string) => {
    onSelectBoard(id);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const createBoard = () => {
    onCreateBoardClick();
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] max-w-[85vw] h-full flex-shrink-0 bg-light-bg-card dark:bg-dark-bg-sidebar border-r border-light-border dark:border-dark-border flex flex-col transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:hidden lg:translate-x-0'
        }`}
        aria-label="Board navigation"
        aria-hidden={!isOpen}
      >
        <div className="h-16 md:h-20 flex items-center px-6 gap-3 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white shadow-md shadow-brand/20">
            <LayoutGrid size={18} aria-hidden="true" />
          </div>
          <span className="text-xl font-black text-light-text dark:text-dark-text tracking-tight">
            Task<span className="text-brand">Nest</span>
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pt-2 md:pt-4">
          <p className="px-6 text-[10px] font-bold text-light-text-muted dark:text-dark-text-muted tracking-widest uppercase mb-4">
            All Boards ({boards.length})
          </p>

          <nav className="space-y-1 pr-6" aria-label="Boards">
            {boards.map((board) => {
              const isActive = board.id === activeBoardId;
              return (
                <button
                  key={board.id}
                  type="button"
                  onClick={() => selectBoard(board.id)}
                  className={`w-full flex items-center gap-3 py-3.5 px-6 rounded-r-full font-bold text-sm text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand text-white shadow-md shadow-brand/20'
                      : 'text-light-text-muted dark:text-dark-text-muted hover:bg-brand/10 hover:text-brand dark:hover:bg-white/5 dark:hover:text-white'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <LayoutGrid size={16} className="flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{board.name}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={createBoard}
              className="w-full flex items-center gap-3 py-3.5 px-6 rounded-r-full font-bold text-sm text-left text-brand dark:text-brand-hover hover:bg-brand/10 dark:hover:bg-brand/5 transition-all cursor-pointer"
            >
              <Plus size={16} className="flex-shrink-0" aria-hidden="true" />
              <span>+ Create New Board</span>
            </button>
          </nav>
        </div>

        <div className="p-4 space-y-4 flex-shrink-0">
          <div className="bg-light-bg-body dark:bg-dark-bg-body border border-light-border dark:border-dark-border rounded-xl p-3.5 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-[9px] font-bold text-light-text-muted dark:text-dark-text-muted tracking-wider uppercase">
                Guest Session
              </p>
              <h4 className="text-xs font-bold text-light-text dark:text-dark-text truncate">
                {guestName}
              </h4>
            </div>
            <button
              type="button"
              onClick={onLogout}
              aria-label="Log out of guest session"
              className="p-2 text-light-text-muted hover:text-brand-danger rounded-lg hover:bg-brand-danger/10 transition-colors flex-shrink-0 cursor-pointer"
            >
              <LogOut size={14} aria-hidden="true" />
            </button>
          </div>

          <div className="bg-light-bg-body dark:bg-dark-bg-body border border-light-border dark:border-dark-border rounded-xl p-3 flex items-center justify-center gap-5">
            <Sun
              size={16}
              className={isDarkTheme ? 'text-light-text-muted' : 'text-brand'}
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-pressed={isDarkTheme}
              className="w-10 h-5 bg-brand rounded-full relative p-0.5 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <span
                className={`block w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                  isDarkTheme ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <Moon
              size={16}
              className={isDarkTheme ? 'text-brand' : 'text-light-text-muted'}
              aria-hidden="true"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="hidden lg:flex w-full items-center justify-center gap-2 py-3 text-light-text-muted hover:text-brand dark:hover:text-white font-bold text-xs transition-colors cursor-pointer"
          >
            <EyeOff size={14} aria-hidden="true" />
            <span>Hide Sidebar</span>
          </button>
        </div>
      </aside>
    </>
  );
}

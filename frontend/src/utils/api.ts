const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  taskId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  position: number;
  columnId: string;
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  name: string;
  boardId: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  id: string;
  name: string;
  columns: Column[];
  createdAt: string;
  updatedAt: string;
}

export async function fetchBoards(): Promise<Board[]> {
  const res = await fetch(`${API_BASE_URL}/boards`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch boards');
  return res.json();
}

export async function createBoard(name: string, columns: string[]): Promise<Board> {
  const payload = {
    name,
    columns: columns.map((colName) => ({ name: colName })),
  };
  const res = await fetch(`${API_BASE_URL}/boards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create board');
  return res.json();
}

export async function updateBoard(
  boardId: string,
  name: string,
  columns: { id?: string; name: string }[]
): Promise<Board> {
  const payload = {
    name,
    columns,
  };
  const res = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update board');
  return res.json();
}

export async function deleteBoard(boardId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete board');
}

export async function createTask(
  title: string,
  description: string,
  status: string,
  columnId: string,
  subtasks: string[]
): Promise<Task> {
  const payload = {
    title,
    description: description || undefined,
    status,
    columnId,
    subtasks: subtasks.map((title) => ({ title })),
  };
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

export async function updateTask(
  taskId: string,
  payload: {
    title?: string;
    description?: string;
    status?: string;
    columnId?: string;
    position?: number;
    subtasks?: { id?: string; title: string; isCompleted: boolean }[];
  }
): Promise<Task> {
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

export async function deleteTask(taskId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete task');
}

export async function toggleSubtask(subtaskId: string, isCompleted: boolean): Promise<Subtask> {
  const res = await fetch(`${API_BASE_URL}/subtasks/${subtaskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isCompleted }),
  });
  if (!res.ok) throw new Error('Failed to toggle subtask');
  return res.json();
}

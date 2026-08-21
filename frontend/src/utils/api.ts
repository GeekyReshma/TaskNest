const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const TOKEN_KEY = 'tasknest_guest_token';
const GUEST_KEY = 'tasknest_guest';

export interface GuestSession {
  id: string;
  name: string;
  createdAt?: string;
}

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
  guestUserId?: string;
  columns: Column[];
  createdAt: string;
  updatedAt: string;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredGuest(): GuestSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(GUEST_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GuestSession;
  } catch {
    return null;
  }
}

export function persistGuestSession(token: string, guest: GuestSession) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(GUEST_KEY, JSON.stringify(guest));
}

export function clearGuestSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(GUEST_KEY);
  localStorage.removeItem('tasknest_guest_name');
}

async function request<T>(path: string, options: RequestInit = {}, auth = true): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = getStoredToken();
    if (!token) {
      throw new ApiError('Guest session required', 401);
    }
    headers.set('Authorization', `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      cache: 'no-store',
    });
  } catch {
    throw new ApiError('Network error. Check that the API is running.', 0);
  }

  if (!res.ok) {
    let message = 'Request failed';
    try {
      const body = await res.json();
      if (Array.isArray(body?.message)) {
        message = body.message.join(', ');
      } else if (typeof body?.message === 'string') {
        message = body.message;
      }
    } catch {
      // ignore parse errors
    }

    if (res.status === 401) {
      clearGuestSession();
    }

    throw new ApiError(message, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export async function createGuestSession(name: string): Promise<{
  accessToken: string;
  guest: GuestSession;
}> {
  return request(
    '/auth/guest',
    {
      method: 'POST',
      body: JSON.stringify({ name }),
    },
    false,
  );
}

export async function fetchMe(): Promise<GuestSession> {
  return request('/auth/me');
}

export async function fetchBoards(): Promise<Board[]> {
  return request('/boards');
}

export async function createBoard(name: string, columns: string[]): Promise<Board> {
  return request('/boards', {
    method: 'POST',
    body: JSON.stringify({
      name,
      columns: columns.map((colName) => ({ name: colName })),
    }),
  });
}

export async function updateBoard(
  boardId: string,
  name: string,
  columns: { id?: string; name: string }[],
): Promise<Board> {
  return request(`/boards/${boardId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name, columns }),
  });
}

export async function deleteBoard(boardId: string): Promise<void> {
  await request(`/boards/${boardId}`, { method: 'DELETE' });
}

export async function createTask(
  title: string,
  description: string,
  status: string,
  columnId: string,
  subtasks: string[],
): Promise<Task> {
  return request('/tasks', {
    method: 'POST',
    body: JSON.stringify({
      title,
      description: description || undefined,
      status,
      columnId,
      subtasks: subtasks.map((t) => ({ title: t })),
    }),
  });
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
  },
): Promise<Task> {
  return request(`/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function moveTask(
  taskId: string,
  columnId: string,
  status: string,
  position: number,
): Promise<Task> {
  return request(`/tasks/${taskId}/move`, {
    method: 'PATCH',
    body: JSON.stringify({ columnId, status, position }),
  });
}

export async function deleteTask(taskId: string): Promise<void> {
  await request(`/tasks/${taskId}`, { method: 'DELETE' });
}

export async function toggleSubtask(subtaskId: string, isCompleted: boolean): Promise<Subtask> {
  return request(`/subtasks/${subtaskId}`, {
    method: 'PATCH',
    body: JSON.stringify({ isCompleted }),
  });
}

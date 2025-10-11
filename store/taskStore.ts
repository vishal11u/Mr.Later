import { supabase } from '@/lib/supabase';
import { create } from 'zustand';
import { AuthProvider } from './authStore';
 
export type TaskStatus = 'pending' | 'done' | 'later';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string;
  status: TaskStatus;
  category: string | null;
  priority: TaskPriority;
  created_at: string;
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTasks: () => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  doLater: (id: string) => Promise<void>;
  subscribeToTasks: () => () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    const user = AuthProvider().user;
    if (!user) return;

    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;

      set({ tasks: data || [] });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  createTask: async (task) => {
    const user = AuthProvider().user;
    if (!user) return;

    try {
      set({ isLoading: true, error: null });

      const newTask = {
        ...task,
        user_id: user.id,
      };

      const { data, error } = await supabase.from('tasks').insert(newTask).select().single();

      if (error) throw error;

      set((state) => ({ tasks: [...state.tasks, data] }));
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateTask: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase.from('tasks').update(updates).eq('id', id);

      if (error) throw error;

      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)),
      }));
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTask: async (id) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase.from('tasks').delete().eq('id', id);

      if (error) throw error;

      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  doLater: async (id) => {
    try {
      const task = get().tasks.find((t) => t.id === id);
      if (!task) return;

      // Add one day to the due date
      const currentDueDate = new Date(task.due_date);
      const newDueDate = new Date(currentDueDate);
      newDueDate.setDate(currentDueDate.getDate() + 1);

      await get().updateTask(id, {
        due_date: newDueDate.toISOString(),
        status: 'later',
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  subscribeToTasks: () => {
    const user = AuthProvider().user;
    if (!user) return () => {};

    const subscription = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refresh tasks when changes occur
          get().fetchTasks();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },
}));

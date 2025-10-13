import { supabase } from '@/lib/supabase';
import { create } from 'zustand';
import { useAuthStore } from './authStore';

export interface Challenge {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  participants: string[];
  created_at: string;
}

interface ChallengeState {
  challenges: Challenge[];
  userChallenges: Challenge[];
  isLoading: boolean;
  error: string | null;

  fetchChallenges: () => Promise<void>;
  fetchUserChallenges: () => Promise<void>;
  joinChallenge: (challengeId: string) => Promise<void>;
  leaveChallenge: (challengeId: string) => Promise<void>;
  subscribeToChanges: () => () => void;
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  challenges: [],
  userChallenges: [],
  isLoading: false,
  error: null,

  fetchChallenges: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;

      set({ challenges: data || [] });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserChallenges: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .contains('participants', [user.id]);

      if (error) throw error;

      set({ userChallenges: data || [] });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  joinChallenge: async (challengeId) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      set({ isLoading: true, error: null });

      // Get current challenge
      const { data: challenge, error: fetchError } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (fetchError) throw fetchError;

      // Add user to participants if not already there
      if (!challenge.participants.includes(user.id)) {
        const updatedParticipants = [...challenge.participants, user.id];

        const { error: updateError } = await supabase
          .from('challenges')
          .update({ participants: updatedParticipants })
          .eq('id', challengeId);

        if (updateError) throw updateError;

        // Update local state
        set((state) => ({
          challenges: state.challenges.map((c) =>
            c.id === challengeId ? { ...c, participants: updatedParticipants } : c
          ),
          userChallenges: [...state.userChallenges, challenge],
        }));
      }
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  leaveChallenge: async (challengeId) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      set({ isLoading: true, error: null });

      // Get current challenge
      const { data: challenge, error: fetchError } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (fetchError) throw fetchError;

      // Remove user from participants
      const updatedParticipants = challenge.participants.filter((id: string) => id !== user.id);

      const { error: updateError } = await supabase
        .from('challenges')
        .update({ participants: updatedParticipants })
        .eq('id', challengeId);

      if (updateError) throw updateError;

      // Update local state
      set((state) => ({
        challenges: state.challenges.map((c) =>
          c.id === challengeId ? { ...c, participants: updatedParticipants } : c
        ),
        userChallenges: state.userChallenges.filter((c) => c.id !== challengeId),
      }));
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  subscribeToChanges: () => {
    const subscription = supabase
      .channel('challenges_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenges',
        },
        () => {
          // Refresh challenges when changes occur
          get().fetchChallenges();
          get().fetchUserChallenges();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },
}));

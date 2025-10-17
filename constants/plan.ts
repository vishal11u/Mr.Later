export type PlanTier = 'free' | 'pro';

export const PLAN_LIMITS: Record<PlanTier, { maxActiveTasks: number; maxJoinedChallenges: number }> = {
  free: {
    maxActiveTasks: 50,
    maxJoinedChallenges: 2,
  },
  pro: {
    maxActiveTasks: 10000,
    maxJoinedChallenges: 1000,
  },
};

export function getPlanTier(plan?: string | null): PlanTier {
  return plan === 'pro' ? 'pro' : 'free';
}



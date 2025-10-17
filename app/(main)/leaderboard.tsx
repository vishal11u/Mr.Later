import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { supabase } from '@/lib/supabase';

interface Row { user_id: string; completed_tasks: number }

export default function LeaderboardScreen() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('user_task_leaderboard').select('*').limit(50);
        if (error) throw error;
        setRows((data as any) || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900 p-4">
      <Text className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Leaderboard</Text>
      {error ? (
        <Text className="text-danger-500">{error}</Text>
      ) : loading ? (
        <Text className="text-gray-500">Loading...</Text>
      ) : rows.length === 0 ? (
        <Text className="text-gray-500">No data yet</Text>
      ) : (
        rows.map((r, idx) => (
          <View key={r.user_id} className="mb-2 flex-row items-center justify-between rounded-lg bg-white p-3 dark:bg-gray-800">
            <Text className="text-gray-800 dark:text-gray-200">#{idx + 1}</Text>
            <Text className="flex-1 px-3 text-gray-900 dark:text-white">{r.user_id}</Text>
            <Text className="text-primary-600 dark:text-primary-400">{r.completed_tasks}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}



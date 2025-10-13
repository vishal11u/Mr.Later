import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Home, ListTodo, Trophy, User } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useTaskStore } from '@/store/taskStore';
import { useChallengeStore } from '@/store/challengeStore';

export default function MainLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { initialize: initAuth, user } = useAuthStore();
  const { subscribeToTasks: subscribeToTasks } = useTaskStore();
  const { subscribeToChanges: subscribeToChallenges } = useChallengeStore();

  // Initialize auth and subscriptions
  useEffect(() => {
    initAuth();

    // Only subscribe to data changes if user is authenticated
    if (user) {
      const unsubscribeTasks = subscribeToTasks();
      const unsubscribeChallenges = subscribeToChallenges();

      return () => {
        unsubscribeTasks();
        unsubscribeChallenges();
      };
    }
  }, [user?.id]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#6366F1', // primary-500
          tabBarInactiveTintColor: isDark ? '#9CA3AF' : '#6B7280',
          tabBarStyle: {
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            borderTopColor: isDark ? '#374151' : '#E5E7EB',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerStyle: {
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#F9FAFB' : '#111827',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}>
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Tasks',
            tabBarIcon: ({ color, size }) => <ListTodo size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="challenges"
          options={{
            title: 'Challenges',
            tabBarIcon: ({ color, size }) => <Trophy size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}

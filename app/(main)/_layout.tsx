import React, { useEffect } from 'react';
import { Drawer } from 'expo-router/drawer';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Home, ListTodo, Trophy, User, CreditCard, Gamepad2, Medal } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useTaskStore } from '@/store/taskStore';
import { useChallengeStore } from '@/store/challengeStore';
import { Image, View, Text } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';

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
      <Drawer
        screenOptions={{
          drawerActiveTintColor: '#6366F1',
          drawerInactiveTintColor: isDark ? '#D1D5DB' : '#6B7280',
          headerStyle: { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' },
          headerTintColor: isDark ? '#F9FAFB' : '#111827',
        }}
        drawerContent={(props) => (
          <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
            <View style={{ padding: 16, backgroundColor: isDark ? '#111827' : '#EEF2FF' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {useAuthStore.getState().profile?.avatar_url ? (
                  <Image
                    source={{ uri: useAuthStore.getState().profile!.avatar_url as string }}
                    style={{ width: 56, height: 56, borderRadius: 28, marginRight: 12 }}
                  />
                ) : (
                  <View
                    style={{ width: 56, height: 56, borderRadius: 28, marginRight: 12, backgroundColor: '#C7D2FE', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#3730A3', fontWeight: '700' }}>{useAuthStore.getState().profile?.name?.[0]?.toUpperCase() || 'U'}</Text>
                  </View>
                )}
                <View>
                  <Text style={{ color: isDark ? '#F9FAFB' : '#111827', fontWeight: '700' }}>
                    {useAuthStore.getState().profile?.name || 'User'}
                  </Text>
                  <Text style={{ color: isDark ? '#9CA3AF' : '#4B5563', marginTop: 2 }}>
                    {useAuthStore.getState().user?.email}
                  </Text>
                </View>
              </View>
            </View>
            <DrawerItemList {...props} />
          </DrawerContentScrollView>
        )}
      >
        <Drawer.Screen name="dashboard" options={{ title: 'Dashboard', drawerIcon: ({ color, size }) => <Home size={size} color={color} /> }} />
        <Drawer.Screen name="tasks" options={{ title: 'Tasks', drawerIcon: ({ color, size }) => <ListTodo size={size} color={color} /> }} />
        <Drawer.Screen name="challenges" options={{ title: 'Challenges', drawerIcon: ({ color, size }) => <Trophy size={size} color={color} /> }} />
        <Drawer.Screen name="plans" options={{ title: 'Plans', drawerIcon: ({ color, size }) => <CreditCard size={size} color={color} /> }} />
        <Drawer.Screen name="leaderboard" options={{ title: 'Leaderboard', drawerIcon: ({ color, size }) => <Medal size={size} color={color} /> }} />
        <Drawer.Screen name="games" options={{ title: 'Games', drawerIcon: ({ color, size }) => <Gamepad2 size={size} color={color} /> }} />
        <Drawer.Screen name="profile" options={{ title: 'Profile', drawerIcon: ({ color, size }) => <User size={size} color={color} /> }} />
      </Drawer>
    </>
  );
}

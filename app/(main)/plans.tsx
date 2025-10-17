import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import * as WebBrowser from 'expo-web-browser';
import { postEdge } from '@/lib/utils';

export default function PlansScreen() {
  const { profile } = useAuthStore();
  const currentPlan = (profile as any)?.plan || 'free';

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900 p-4">
      <Text className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Choose a Plan</Text>

      <View className="mb-4 overflow-hidden rounded-xl bg-white p-4 dark:bg-gray-800">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">Free</Text>
        <Text className="mt-1 text-gray-600 dark:text-gray-300">Good for getting started</Text>
        <Text className="mt-3 text-sm text-gray-600 dark:text-gray-300">• Up to 50 active tasks</Text>
        <Text className="text-sm text-gray-600 dark:text-gray-300">• Join up to 2 challenges</Text>
        <Button disabled={currentPlan === 'free'} className="mt-4">{currentPlan === 'free' ? 'Current Plan' : 'Switch to Free'}</Button>
      </View>

      <View className="mb-4 overflow-hidden rounded-xl bg-white p-4 dark:bg-gray-800">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">Pro</Text>
        <Text className="mt-1 text-gray-600 dark:text-gray-300">Unlock the full power</Text>
        <Text className="mt-3 text-sm text-gray-600 dark:text-gray-300">• Practically unlimited tasks</Text>
        <Text className="text-sm text-gray-600 dark:text-gray-300">• Join many challenges</Text>
        <Button
          className="mt-4"
          onPress={async () => {
            const userId = useAuthStore.getState().user?.id;
            if (!userId) return;
            try {
              const { url } = await postEdge<{ url: string }>('create-checkout-session', { userId });
              await WebBrowser.openBrowserAsync(url);
            } catch (e) {
              console.error(e);
            }
          }}
        >
          Upgrade
        </Button>
        <Button
          variant="outline"
          className="mt-2"
          onPress={async () => {
            const userId = useAuthStore.getState().user?.id;
            if (!userId) return;
            try {
              const { url } = await postEdge<{ url: string }>('create-portal-session', { userId });
              await WebBrowser.openBrowserAsync(url);
            } catch (e) {
              console.error(e);
            }
          }}
        >
          Manage Billing
        </Button>
      </View>
    </ScrollView>
  );
}



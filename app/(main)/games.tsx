import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { Button } from '@/components/ui/Button';
import * as Notifications from 'expo-notifications';

export default function GamesScreen() {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startFocus = () => {
    if (running) return;
    setRunning(true);
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  };

  const stopFocus = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setRunning(false);
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Great session! 🎮',
          body: `You focused for ${Math.floor(seconds / 60)}m ${seconds % 60}s`,
        },
        trigger: null,
      });
    } catch {}
  };

  return (
    <View className="flex-1 items-center justify-center bg-gray-50 p-6 dark:bg-gray-900">
      <Text className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Focus Game</Text>
      <Text className="mb-6 text-gray-600 dark:text-gray-300">Press start and stay focused!</Text>
      <Text className="mb-6 text-4xl font-extrabold text-primary-600 dark:text-primary-400">{Math.floor(seconds / 60)}:{`${seconds % 60}`.padStart(2, '0')}</Text>
      {running ? (
        <Button variant="danger" onPress={stopFocus}>Stop</Button>
      ) : (
        <Button onPress={startFocus}>Start</Button>
      )}
    </View>
  );
}



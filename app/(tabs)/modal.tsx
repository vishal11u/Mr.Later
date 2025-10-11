import { useState } from 'react';
import { Text, Pressable } from 'react-native';
import { colorScheme } from 'nativewind';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import '../../global.css';

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    colorScheme.set(newTheme);
  };

  return (
    <SafeAreaView
      className={`flex-1 ${currentTheme === 'dark' ? 'bg-gray-900' : 'bg-white'} items-center justify-center`}>
      <StatusBar style={currentTheme === 'dark' ? 'light' : 'dark'} />
      <Pressable onPress={toggleTheme} className="mt-4">
        <Text
          className={currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'}
          style={{ fontSize: 16, fontWeight: 'bold' }}>
          {currentTheme === 'dark' ? 'Dark' : 'Light'}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

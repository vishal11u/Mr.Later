import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Button } from '@/components/ui/Button';

const { width } = Dimensions.get('window');

const slides = [
  {
    title: 'Organize Your Tasks',
    desc: 'Create tasks with priorities, due dates and categories to stay on top.',
  },
  {
    title: 'Stay Motivated',
    desc: 'Track progress on the dashboard and defer with Do Later when needed.',
  },
  {
    title: 'Join Challenges',
    desc: 'Collaborate in challenges to build habits and celebrate wins.',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const handleSkip = async () => {
    await SecureStore.setItemAsync('onboardingSeen', 'true');
    router.replace('/(auth)/login');
  };

  const handleNext = async () => {
    if (index < slides.length - 1) {
      const next = index + 1;
      setIndex(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    } else {
      await handleSkip();
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <TouchableOpacity onPress={handleSkip} className="absolute right-4 top-12 z-10 px-3 py-1">
        <Text className="text-primary-600 dark:text-primary-400">Skip</Text>
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(newIndex);
        }}
      >
        {slides.map((s, i) => (
          <View key={i} style={{ width }} className="items-center justify-center p-8">
            <Text className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">{s.title}</Text>
            <Text className="text-center text-gray-600 dark:text-gray-300">{s.desc}</Text>
          </View>
        ))}
      </ScrollView>

      <View className="items-center pb-10">
        <View className="mb-4 flex-row">
          {slides.map((_, i) => (
            <View
              key={i}
              className={`mx-1 h-2 w-2 rounded-full ${i === index ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
            />
          ))}
        </View>
        <Button onPress={handleNext} className="mx-6 w-[90%]">
          {index === slides.length - 1 ? 'Get Started' : 'Next'}
        </Button>
      </View>
    </View>
  );
}



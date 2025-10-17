import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import '../global.css';

export const unstable_settings = {
  anchor: '(main)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </ThemeProvider>
    </StripeProvider>
  );
}

function RootLayoutNav() {
  const { user, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [biometricChecked, setBiometricChecked] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    const handleNavigation = async () => {
      const inAuthGroup = segments[0] === '(auth)';
      const inOnboarding = segments[0] === '(onboarding)';
      const token = await SecureStore.getItemAsync('authToken');
      const secureLoginEnabled = await SecureStore.getItemAsync('secureLoginEnabled');
      const secureLoginMethod = await SecureStore.getItemAsync('secureLoginMethod');
      const onboardingSeen = await SecureStore.getItemAsync('onboardingSeen');

      // First-time onboarding gate
      if (!onboardingSeen && !inOnboarding) {
        router.replace('/(onboarding)');
        setBiometricChecked(true);
        return;
      }

      if (!user && token) {
        // Enforce secure login preference if enabled
        if (secureLoginEnabled === 'true') {
          if (secureLoginMethod === 'biometric') {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            if (hasHardware && isEnrolled) {
              const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Unlock with biometrics',
                fallbackLabel: 'Enter password',
              });
              if (result.success) {
                router.replace('/(main)/dashboard');
              } else {
                Alert.alert('Authentication failed', 'Please login again.');
                await SecureStore.deleteItemAsync('authToken');
                router.replace('/(auth)/login');
              }
            } else {
              // Device no longer supports biometrics; fall back to login
              router.replace('/(auth)/login');
            }
            setBiometricChecked(true);
            return;
          }
          if (secureLoginMethod === 'otp') {
            // Route to login where user can choose OTP flow
            router.replace('/(auth)/login');
            setBiometricChecked(true);
            return;
          }
        }
      }

      // Normal routing
      if (!user && !inAuthGroup) {
        router.replace('/(auth)/login');
      } else if (user && inAuthGroup) {
        router.replace('/(main)/dashboard');
      }

      setBiometricChecked(true);
    };

    handleNavigation();
  }, [user, segments, isLoading]);

  if (!biometricChecked && !isLoading) return null;

  return (
    <Stack>
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(main)" options={{ headerShown: false }} />
    </Stack>
  );
}

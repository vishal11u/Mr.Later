import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Link, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signInWithGoogle, user, session } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricAvailable(hasHardware && isEnrolled && supportedTypes.length > 0);
    })();
  }, []);

  // Navigate when authenticated
  useEffect(() => {
    if (user && session) {
      router.replace('/(main)/dashboard');
    }
  }, [user, session]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await signIn(email, password);

      // Save credentials securely for biometric login
      await SecureStore.setItemAsync('userEmail', email);
      await SecureStore.setItemAsync('userPassword', password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFingerprintLogin = async () => {
    try {
      // Check if credentials are saved
      const savedEmail = await SecureStore.getItemAsync('userEmail');
      const savedPassword = await SecureStore.getItemAsync('userPassword');

      if (!savedEmail || !savedPassword) {
        Alert.alert(
          'Error',
          'Please sign in once with email and password first to enable biometric login'
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with Fingerprint',
        fallbackLabel: 'Enter Password',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsLoading(true);
        await signIn(savedEmail, savedPassword);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Fingerprint authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Don't navigate here - let the auth store handle it via the useEffect hook
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setIsGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <View className="mb-8 items-center">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-2xl bg-primary-500">
            <Text className="text-3xl font-bold text-white">ML</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome to Mr. Later
          </Text>
          <Text className="mt-2 text-center text-gray-500 dark:text-gray-400">
            Sign in to continue managing your tasks intelligently
          </Text>
        </View>

        {error ? (
          <View className="bg-danger-50 border-danger-200 mb-4 rounded-lg border p-3">
            <Text className="text-danger-700 text-sm">{error}</Text>
          </View>
        ) : null}

        <Input
          label="Email"
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!isLoading && !isGoogleLoading}
          className="mb-4"
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!isLoading && !isGoogleLoading}
          className="mb-2"
        />

        <Link href="/forgot" asChild>
          <TouchableOpacity disabled={isLoading || isGoogleLoading} className="mb-6 self-end">
            <Text className="text-sm text-primary-600 dark:text-primary-400">Forgot Password?</Text>
          </TouchableOpacity>
        </Link>

        <Button onPress={handleLogin} isLoading={isLoading} className="mb-4">
          Sign In
        </Button>

        {isBiometricAvailable && (
          <Button
            variant="outline"
            onPress={handleFingerprintLogin}
            isLoading={isLoading}
            disabled={isLoading || isGoogleLoading}
            className="mb-4">
            <Text className="text-gray-800 dark:text-gray-100">Login with Fingerprint</Text>
          </Button>
        )}

        <View className="my-4 flex-row items-center">
          <View className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
          <Text className="mx-4 text-gray-500 dark:text-gray-400">or</Text>
          <View className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
        </View>

        <Button
          variant="outline"
          onPress={handleGoogleLogin}
          isLoading={isGoogleLoading}
          disabled={isLoading || isGoogleLoading}
          className="mb-6 bg-white">
          <View className="flex-row items-center">
            <Image
              source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
              className="mr-2 h-5 w-5"
            />
            <Text className="text-gray-800 dark:text-gray-800">Sign in with Google</Text>
          </View>
        </Button>

        <View className="flex-row justify-center">
          <Text className="text-gray-600 dark:text-gray-400">Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity disabled={isLoading || isGoogleLoading}>
              <Text className="font-medium text-primary-600 dark:text-primary-400">Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
// import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import { AuthProvider } from '@/store/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signInWithGoogle } = AuthProvider();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    // Validate inputs
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    // if (!isValidEmail(email)) {
    //   setError('Please enter a valid email address');
    //   return;
    // }

    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);

      router.replace('/(main)/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      await signInWithGoogle();

      await signInWithGoogle();

      router.replace('/(main)/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
        keyboardShouldPersistTaps="handled">
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
          className="mb-4"
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          className="mb-2"
        />

        <Link href="/forgot" asChild>
          <TouchableOpacity className="mb-6 self-end">
            <Text className="text-sm text-primary-600 dark:text-primary-400">Forgot Password?</Text>
          </TouchableOpacity>
        </Link>

        <Button onPress={handleLogin} isLoading={isLoading} className="mb-4">
          Sign In
        </Button>

        <View className="my-4 flex-row items-center">
          <View className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
          <Text className="mx-4 text-gray-500 dark:text-gray-400">or</Text>
          <View className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
        </View>

        <Button
          variant="outline"
          onPress={handleGoogleLogin}
          isLoading={isLoading}
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
            <TouchableOpacity>
              <Text className="font-medium text-primary-600 dark:text-primary-400">Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

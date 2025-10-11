import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { AuthProvider } from '@/store/authStore';
import { isValidEmail, isStrongPassword } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = AuthProvider();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isStrongPassword(password)) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      signUp(email, password, name);

      router.replace('/(main)/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1">
      <ScrollView
        contentContainerClassName="flex-grow justify-center p-6"
        keyboardShouldPersistTaps="handled">
        <View className="mb-8 items-center">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-2xl bg-primary-500">
            <Text className="text-3xl font-bold text-white">ML</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</Text>
          <Text className="mt-2 text-center text-gray-500 dark:text-gray-400">
            Join Mr. Later to boost your productivity
          </Text>
        </View>

        {error ? (
          <View className="bg-danger-50 border-danger-200 mb-4 rounded-lg border p-3">
            <Text className="text-danger-700 text-sm">{error}</Text>
          </View>
        ) : null}

        <Input
          label="Full Name"
          placeholder="Enter your full name"
          autoCapitalize="words"
          value={name}
          onChangeText={setName}
          className="mb-4"
        />

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
          placeholder="Create a password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          className="mb-4"
        />

        <Input
          label="Confirm Password"
          placeholder="Confirm your password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          className="mb-6"
        />

        <Button onPress={handleRegister} isLoading={isLoading} className="mb-6">
          Create Account
        </Button>

        <View className="flex-row justify-center">
          <Text className="text-gray-600 dark:text-gray-400">Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="font-medium text-primary-600 dark:text-primary-400">Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

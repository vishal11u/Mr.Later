import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { AuthProvider } from '@/store/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
 

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = AuthProvider();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleResetPassword = async () => {
    // Validate input
    if (!email) {
      setError('Email is required');
      return;
    }
    
    // if (!isValidEmail(email)) {
    //   setError('Please enter a valid email address');
    //   return;
    // }
    
    setError('');
    setIsLoading(true);
    
    try {
      await resetPassword(email);
      
      if (error) {
        setError(error);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset password email');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView 
        contentContainerClassName="flex-grow justify-center p-6"
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity 
          onPress={() => router.back()}
          className="absolute top-12 left-6 z-10"
        >
          <ArrowLeft size={24} color="#6B7280" />
        </TouchableOpacity>
        
        <View className="items-center mb-8">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">
            Enter your email and we'll send you instructions to reset your password
          </Text>
        </View>
        
        {error ? (
          <View className="bg-danger-50 p-3 rounded-lg mb-4 border border-danger-200">
            <Text className="text-danger-700 text-sm">{error}</Text>
          </View>
        ) : null}
        
        {success ? (
          <View className="bg-success-50 p-4 rounded-lg mb-6 border border-success-200">
            <Text className="text-success-700 text-sm">
              Password reset instructions have been sent to your email. Please check your inbox.
            </Text>
          </View>
        ) : (
          <>
            <Input
              label="Email"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              className="mb-6"
            />
            
            <Button
              onPress={handleResetPassword}
              isLoading={isLoading}
              className="mb-6"
            >
              Send Reset Link
            </Button>
          </>
        )}
        
        <View className="flex-row justify-center">
          <Text className="text-gray-600 dark:text-gray-400">Remember your password? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="text-primary-600 dark:text-primary-400 font-medium">
                Sign In
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
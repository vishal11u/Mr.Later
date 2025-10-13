import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { LogOut, Moon, Bell, ChevronRight, Shield, HelpCircle, Camera } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { getInitials } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/lib/supabase';
import * as SecureStore from 'expo-secure-store';

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { user, profile, signOut, fetchProfile } = useAuthStore();
  const { expoPushToken } = useNotifications(user?.id);

  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    if (Platform.OS === 'web') {
      setNotificationsEnabled(false);
      return;
    }

    const { status } = await Notifications.getPermissionsAsync();
    setNotificationsEnabled(status === 'granted');
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchProfile();
    } catch (err) {
      console.error('Error refreshing profile:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        onPress: async () => {
          try {
            await signOut();
            await SecureStore.deleteItemAsync('authToken');

            router.replace('/(auth)/login');
          } catch (error) {
            console.error('Sign out error:', error);
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Notifications are not supported on web.');
      return;
    }

    if (value) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Please enable notifications in your device settings to receive updates.'
        );
        setNotificationsEnabled(false);
        return;
      }

      setNotificationsEnabled(true);

      setTimeout(async () => {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Notifications Enabled! 🔔',
              body: 'You will now receive updates from Mr.Later',
              data: { type: 'test' },
            },
            trigger: null,
          });
        } catch (error) {
          console.error('Error sending test notification:', error);
        }
      }, 500);
    } else {
      setNotificationsEnabled(false);
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  const handleImageUpload = () => {
    Alert.alert(
      'Upload Profile Picture',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => pickImage('camera'),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => pickImage('gallery'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    try {
      // Request permissions
      let permissionResult;
      if (source === 'camera') {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }

      if (permissionResult.status !== 'granted') {
        Alert.alert(
          'Permission Required',
          `Please grant ${source} permissions to upload a profile picture.`
        );
        return;
      }

      // Launch image picker
      let result;
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        await uploadImageToSupabase(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadImageToSupabase = async (imageUri: string) => {
    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setUploadingImage(true);

    try {
      // Create a unique file name
      const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      // Delete old avatar if exists
      if (profile?.avatar_url) {
        try {
          // Extract the filename from the full URL
          const urlParts = profile.avatar_url.split('/');
          const oldFileName = urlParts[urlParts.length - 1];

          if (oldFileName) {
            const { error: deleteError } = await supabase.storage
              .from('avatars')
              .remove([oldFileName]);

            if (deleteError) {
              console.warn('Could not delete old avatar:', deleteError);
            }
          }
        } catch (err) {
          console.warn('Error deleting old avatar:', err);
          // Continue with upload even if delete fails
        }
      }

      // Fetch the image and convert to ArrayBuffer
      const response = await fetch(imageUri);
      const arrayBuffer = await response.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, fileData, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message);
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      console.log('Public URL:', publicUrl);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error(updateError.message);
      }

      // Refresh profile to show new image
      await fetchProfile();

      // Send success notification on mobile
      if (Platform.OS !== 'web') {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '✨ Profile Updated!',
              body: 'Your profile picture has been updated successfully',
              data: { type: 'profile_update' },
            },
            trigger: null, // Send immediately
          });
        } catch (notifError) {
          console.warn('Could not send notification:', notifError);
        }
      }

      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error: any) {
      console.error('Error uploading image:', error);

      let errorMessage = 'Failed to upload image. Please try again.';

      if (error.message?.includes('row-level security')) {
        errorMessage = 'Storage permission error. Please check your bucket settings.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Upload Failed', errorMessage);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDark ? '#fff' : '#000'}
          colors={['#6366F1']}
        />
      }>
      {/* Profile Header */}
      <View className="items-center border-b border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <View className="relative mb-4">
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} className="h-36 w-36 rounded-full" />
          ) : (
            <View className="h-48 w-48 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
              <Text className="text-2xl font-bold text-primary-600 dark:text-primary-300">
                {getInitials(profile?.name || user?.email || 'User')}
              </Text>
            </View>
          )}

          {/* Camera Button */}
          <TouchableOpacity
            onPress={handleImageUpload}
            disabled={uploadingImage}
            className="absolute -bottom-1 -right-1 h-9 w-9 items-center justify-center rounded-full bg-primary-600 shadow-lg dark:bg-primary-500"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}>
            {uploadingImage ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Camera size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        <Text className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
          {profile?.name || 'User'}
        </Text>

        <Text className="mb-4 text-gray-500 dark:text-gray-400">{user?.email || 'No email'}</Text>

        <Button
          disabled={isLoading}
          variant="outline"
          size="sm"
          onPress={() => router.push('/profile/edit')}>
          Edit Profile
        </Button>
      </View>

      {/* Preferences */}
      <View className="p-4">
        <Text className="mb-2 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          PREFERENCES
        </Text>

        <View className="mb-6 overflow-hidden rounded-lg bg-white dark:bg-gray-800">
          {/* Notifications */}
          <View className="flex-row items-center justify-between border-b border-gray-100 p-4 dark:border-gray-700">
            <View className="flex-1 flex-row items-center">
              <Bell size={20} color={isDark ? '#D1D5DB' : '#4B5563'} />
              <View className="ml-3 flex-1">
                <Text className="text-gray-800 dark:text-gray-200">Notifications</Text>
                {expoPushToken && (
                  <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Push token registered
                  </Text>
                )}
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
              thumbColor={notificationsEnabled ? '#6366F1' : '#F9FAFB'}
              disabled={Platform.OS === 'web'}
            />
          </View>

          {/* Appearance */}
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <Moon size={20} color={isDark ? '#D1D5DB' : '#4B5563'} />
              <Text className="ml-3 text-gray-800 dark:text-gray-200">Dark Mode</Text>
            </View>
            <Text className="text-gray-500 dark:text-gray-400">
              {isDark ? 'On' : 'Off'} (System)
            </Text>
          </View>
        </View>

        {/* Support */}
        <Text className="mb-2 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          SUPPORT
        </Text>
        <View className="mb-6 overflow-hidden rounded-lg bg-white dark:bg-gray-800">
          <TouchableOpacity className="flex-row items-center justify-between border-b border-gray-100 p-4 dark:border-gray-700">
            <View className="flex-row items-center">
              <HelpCircle size={20} color={isDark ? '#D1D5DB' : '#4B5563'} />
              <Text className="ml-3 text-gray-800 dark:text-gray-200">Help & Support</Text>
            </View>
            <ChevronRight size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <Shield size={20} color={isDark ? '#D1D5DB' : '#4B5563'} />
              <Text className="ml-3 text-gray-800 dark:text-gray-200">Privacy Policy</Text>
            </View>
            <ChevronRight size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <Button
          variant="danger"
          onPress={handleSignOut}
          isLoading={isLoading}
          className="mb-8"
          disabled={isLoading}>
          <View className="flex-row items-center">
            <LogOut size={18} color="#FFFFFF" />
            <Text className="ml-2 font-medium text-white">Sign Out</Text>
          </View>
        </Button>

        <Text className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Mr.Later v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

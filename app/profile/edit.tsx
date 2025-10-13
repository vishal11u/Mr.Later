import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { ArrowLeft, Save, Camera } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { getInitials } from '@/lib/utils';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import * as Notifications from 'expo-notifications';

export default function EditProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { user, profile, updateProfile, isLoading, fetchProfile } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: user?.email || '',
      });
      setLocalAvatarUri(profile.avatar_url || null);
    }
  }, [profile, user]);

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
      const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      // Delete old avatar if exists
      if (profile?.avatar_url) {
        try {
          const urlParts = profile.avatar_url.split('/');
          const oldFileName = urlParts[urlParts.length - 1];

          if (oldFileName) {
            await supabase.storage.from('avatars').remove([oldFileName]);
          }
        } catch (err) {
          console.warn('Error deleting old avatar:', err);
        }
      }

      const response = await fetch(imageUri);
      const arrayBuffer = await response.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, fileData, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) throw new Error(uploadError.message);

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw new Error(updateError.message);

      setLocalAvatarUri(publicUrl);

      if (Platform.OS !== 'web') {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '✨ Profile Picture Updated!',
              body: 'Your new photo looks great',
              data: { type: 'profile_update' },
            },
            trigger: null,
          });
        } catch (notifError) {
          console.warn('Could not send notification:', notifError);
        }
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload Failed', error.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Name is required');
      return;
    }

    try {
      await updateProfile({
        name: formData.name,
      });

      await fetchProfile();

      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    Alert.alert('Discard Changes', 'Are you sure you want to discard your changes?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => router.back(),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1 p-4">
        {/* Profile Picture */}
        <View className="mb-6 items-center">
          <View className="relative">
            {localAvatarUri ? (
              <Image source={{ uri: localAvatarUri }} className="h-32 w-32 rounded-full" />
            ) : (
              <View className="h-32 w-32 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
                <Text className="text-3xl font-bold text-primary-600 dark:text-primary-300">
                  {getInitials(formData.name || formData.email || 'User')}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleImageUpload}
              disabled={uploadingImage}
              className="absolute -bottom-1 -right-1 h-10 w-10 items-center justify-center rounded-full bg-primary-600 shadow-lg dark:bg-primary-500"
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
                <Camera size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400">Tap to change photo</Text>
        </View>

        {/* Name */}
        <View className="mb-4">
          <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Name *</Text>
          <TextInput
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Enter your name"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </View>

        {/* Email (Read-only) */}
        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Email</Text>
          <View className="rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 dark:border-gray-600 dark:bg-gray-700">
            <Text className="text-gray-500 dark:text-gray-400">{formData.email}</Text>
          </View>
          <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Email cannot be changed
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="mb-8 space-y-3">
          <Button
            onPress={handleUpdate}
            isLoading={isLoading}
            disabled={isLoading || uploadingImage}
            className="mb-3">
            <View className="flex-row items-center justify-center">
              <Save size={18} color="#FFFFFF" />
              <Text className="ml-2 font-semibold text-white">Save Changes</Text>
            </View>
          </Button>

          <Button variant="outline" onPress={handleCancel} disabled={isLoading || uploadingImage}>
            <Text className="font-semibold text-gray-700 dark:text-gray-300">Cancel</Text>
          </Button>
        </View>

        <Text className="mb-6 text-center text-xs text-gray-500 dark:text-gray-400">
          * Required fields
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

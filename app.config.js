import 'dotenv/config';

export default {
  expo: {
    name: 'Mr.Later',
    slug: 'mr-later',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'mrlater',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    jsEngine: 'hermes',
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates: {
      fallbackToCacheTimeout: 0,
      enabled: true,
      checkAutomatically: 'ON_LOAD',
      url: 'https://u.expo.dev/23c8a164-ec2d-4aee-9db2-a943e9aac37c',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.itzvishal.mrlater',
      buildNumber: '1.0.0',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSPhotoLibraryUsageDescription:
          'Allow Mr.Later to access your photos to upload profile picture',
        NSCameraUsageDescription: 'Allow Mr.Later to access your camera to take profile picture',
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.itzvishal.mrlater',
      versionCode: 1,
      permissions: [
        'CAMERA',
        'READ_MEDIA_IMAGES',
        'NOTIFICATIONS',
      ],
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission: 'Allow Mr.Later to access your photos to upload profile picture',
          cameraPermission: 'Allow Mr.Later to access your camera to take profile picture',
        },
      ],
      [
        'expo-notifications',
        {
          color: '#6366F1',
        },
      ],
      [
        'expo-secure-store',
        {
          isAvailableAsync: true,
        },
      ],
      [
        '@react-native-google-signin/google-signin',
        {
          iosUrlScheme: 'com.googleusercontent.apps.YOUR_CLIENT_ID',
        },
      ],
      "expo-web-browser"
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      eas: {
        projectId: '23c8a164-ec2d-4aee-9db2-a943e9aac37c',
      },
    },
  },
};

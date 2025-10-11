import { cn } from '@/lib/utils';
import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
}

export const Input = ({
  label,
  error,
  containerClassName,
  labelClassName,
  errorClassName,
  className,
  ...props
}: InputProps) => {
  return (
    <View className={cn('mb-4', containerClassName)}>
      {label && (
        <Text
          className={cn(
            'mb-1 text-sm font-medium text-gray-700 dark:text-gray-300',
            labelClassName
          )}>
          {label}
        </Text>
      )}
      <TextInput
        className={cn(
          'rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white',
          error && 'border-danger-500',
          className
        )}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && <Text className={cn('mt-1 text-xs text-danger-500', errorClassName)}>{error}</Text>}
    </View>
  );
};

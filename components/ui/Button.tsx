import { cn } from "@/lib/utils";
import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled = false,
  children ,
  ...props
}: ButtonProps) => {
  const baseStyles = "flex flex-row items-center justify-center rounded-lg";

  const variantStyles = {
    primary: "bg-primary-500",
    secondary: "bg-secondary-500",
    outline: "border border-gray-300 bg-transparent",
    ghost: "bg-transparent",
    danger: "bg-danger-500",
  };

  const sizeStyles = {
    sm: "py-1 px-3",
    md: "py-2 px-4",
    lg: "py-3 px-6",
  };

  const textStyles = {
    primary: "text-white font-medium",
    secondary: "text-white font-medium",
    outline: "text-gray-800 dark:text-gray-200 font-medium",
    ghost: "text-gray-800 dark:text-gray-200 font-medium",
    danger: "text-white font-medium",
  };

  const textSizeStyles = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const disabledStyles = "opacity-50";

  return (
    <TouchableOpacity
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        (disabled || isLoading) && disabledStyles,
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "outline" || variant === "ghost" ? "#374151" : "#ffffff"
          }
        />
      ) : (
        <Text className={cn(textStyles[variant], textSizeStyles[size])}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};

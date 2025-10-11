import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, CheckCircle2, Clock, TrendingUp } from 'lucide-react-native';
import { useTaskStore } from '@/store/taskStore';
import { formatDate } from '@/lib/utils';

export default function DashboardScreen() {
  const router = useRouter();
  const { tasks, fetchTasks, isLoading } = useTaskStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get today's tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTasks = tasks.filter((task) => {
    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });

  // Get upcoming tasks (next 3 days)
  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  threeDaysLater.setHours(23, 59, 59, 999);

  const upcomingTasks = tasks
    .filter((task) => {
      if (task.status === 'done') return false;
      const dueDate = new Date(task.due_date);
      return dueDate > today && dueDate <= threeDaysLater;
    })
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  // Generate motivational message based on completion rate
  const getMotivationalMessage = () => {
    if (completionRate >= 80) {
      return "You're crushing it! Keep up the amazing work!";
    } else if (completionRate >= 50) {
      return "You're making great progress! Stay focused!";
    } else if (completionRate >= 30) {
      return "You're on your way! Keep pushing forward!";
    } else {
      return "Every small step counts. You've got this!";
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Header */}
      <View className="bg-primary-500 p-6 pb-12">
        <Text className="mb-2 text-2xl font-bold text-white">Hello there!</Text>
        <Text className="text-base text-white opacity-90">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      {/* Stats Cards */}
      <View className="-mt-8 px-4">
        <View className="mb-4 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Task Progress
            </Text>
            <TrendingUp size={20} color="#6366F1" />
          </View>

          <View className="mb-2 flex-row justify-between">
            <Text className="text-gray-600 dark:text-gray-400">Completion Rate</Text>
            <Text className="font-medium text-primary-600 dark:text-primary-400">
              {completionRate}%
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="mb-4 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
            <View
              className="h-2 rounded-full bg-primary-500"
              style={{ width: `${completionRate}%` }}
            />
          </View>

          <View className="flex-row justify-between">
            <View>
              <Text className="text-xs text-gray-600 dark:text-gray-400">Total Tasks</Text>
              <Text className="font-medium text-gray-800 dark:text-gray-200">{totalTasks}</Text>
            </View>
            <View>
              <Text className="text-xs text-gray-600 dark:text-gray-400">Completed</Text>
              <Text className="font-medium text-gray-800 dark:text-gray-200">{completedTasks}</Text>
            </View>
            <View>
              <Text className="text-xs text-gray-600 dark:text-gray-400">Pending</Text>
              <Text className="font-medium text-gray-800 dark:text-gray-200">
                {totalTasks - completedTasks}
              </Text>
            </View>
          </View>
        </View>

        {/* Motivational Card */}
        <View className="mb-4 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Your Progress
            </Text>
            <CheckCircle2 size={20} color="#10B981" />
          </View>

          <Text className="text-gray-700 dark:text-gray-300">{getMotivationalMessage()}</Text>
        </View>

        {/* Today's Tasks */}
        <View className="mb-4 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Today's Tasks
            </Text>
            <Calendar size={20} color="#6366F1" />
          </View>

          {todayTasks.length > 0 ? (
            todayTasks.map((task) => (
              <View
                key={task.id}
                className="border-b border-gray-100 py-2 last:border-0 dark:border-gray-700">
                <View className="flex-row items-center">
                  <View
                    className={`mr-2 h-3 w-3 rounded-full ${
                      task.priority === 'high'
                        ? 'bg-danger-500'
                        : task.priority === 'medium'
                          ? 'bg-warning-500'
                          : 'bg-success-500'
                    }`}
                  />
                  <Text
                    className={`flex-1 ${
                      task.status === 'done'
                        ? 'text-gray-400 line-through dark:text-gray-500'
                        : 'text-gray-800 dark:text-gray-200'
                    }`}>
                    {task.title}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text className="italic text-gray-500 dark:text-gray-400">
              No tasks scheduled for today
            </Text>
          )}

          <View className="mt-3">
            <Text
              className="text-sm font-medium text-primary-600 dark:text-primary-400"
              onPress={() => router.push('/(main)/tasks')}>
              View all tasks
            </Text>
          </View>
        </View>

        {/* Upcoming Deadlines */}
        <View className="mb-4 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Upcoming Deadlines
            </Text>
            <Clock size={20} color="#6366F1" />
          </View>

          {upcomingTasks.length > 0 ? (
            upcomingTasks.slice(0, 3).map((task) => (
              <View
                key={task.id}
                className="border-b border-gray-100 py-2 last:border-0 dark:border-gray-700">
                <Text className="text-gray-800 dark:text-gray-200">{task.title}</Text>
                <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Due: {formatDate(task.due_date)}
                </Text>
              </View>
            ))
          ) : (
            <Text className="italic text-gray-500 dark:text-gray-400">
              No upcoming deadlines in the next 3 days
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

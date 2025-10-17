import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { Plus, Calendar, Clock, ChevronRight, AlertCircle } from 'lucide-react-native';
import { useTaskStore } from '@/store/taskStore';
import { formatDate } from '@/lib/utils';
import TaskModal from '@/components/TaskModal';
import * as Notifications from 'expo-notifications';

export default function TasksScreen() {
  const { tasks, fetchTasks, deleteTask, doLater, isLoading, subscribeToTasks } = useTaskStore();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
    const unsubscribe = subscribeToTasks();
    return () => {
      try {
        unsubscribe && unsubscribe();
      } catch {}
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setModalVisible(true);
  };

  const handleEditTask = (task: any) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTask(taskId);
            if (Platform.OS !== 'web') {
              try {
                await Notifications.scheduleNotificationAsync({
                  content: {
                    title: '✅ Task Deleted!',
                    body: 'Your task has been successfully deleted',
                    data: { type: 'task_deletion' },
                  },
                  trigger: null,
                });
              } catch (notifError) {
                console.warn('Could not send notification:', notifError);
              }
            }
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete task');
          }
        },
      },
    ]);
  };

  const handledoLater = (taskId: string) => {
    doLater(taskId);
  };

  const pendingTasks = tasks.filter((task) => task.status === 'pending');
  const laterTasks = tasks.filter((task) => task.status === 'later');
  const completedTasks = tasks.filter((task) => task.status === 'done');

  const renderTaskItem = (task: any) => {
    const isPastDue = new Date(task.due_date) < new Date() && task.status !== 'done';

    return (
      <View
        key={task.id}
        className="mb-3 overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
        <TouchableOpacity onPress={() => handleEditTask(task)} className="p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center">
              <View
                className={`mr-3 h-3 w-3 rounded-full ${
                  task.priority === 'high'
                    ? 'bg-danger-500'
                    : task.priority === 'medium'
                      ? 'bg-warning-500'
                      : 'bg-success-500'
                }`}
              />
              <Text
                className={`flex-1 font-medium ${
                  task.status === 'done'
                    ? 'text-gray-400 line-through dark:text-gray-500'
                    : 'text-gray-800 dark:text-gray-200'
                }`}>
                {task.title}
              </Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </View>

          {task.description ? (
            <Text numberOfLines={2} className="ml-6 mt-1 text-sm text-gray-500 dark:text-gray-400">
              {task.description}
            </Text>
          ) : null}

          <View className="ml-6 mt-3 flex-row items-center">
            <Calendar size={14} color="#6B7280" />
            <Text className="ml-1 text-xs text-gray-500 dark:text-gray-400">
              {formatDate(task.due_date)}
            </Text>

            {isPastDue && (
              <View className="ml-3 flex-row items-center">
                <AlertCircle size={14} color="#EF4444" />
                <Text className="ml-1 text-xs text-danger-500">Past due</Text>
              </View>
            )}

            {task.category ? (
              <View className="ml-3 rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-700">
                <Text className="text-xs text-gray-600 dark:text-gray-300">{task.category}</Text>
              </View>
            ) : null}
          </View>
        </TouchableOpacity>

        {task.status !== 'done' && (
          <View className="flex-row border-t border-gray-100 dark:border-gray-700">
            <TouchableOpacity
              onPress={() => handledoLater(task.id)}
              className="flex-1 flex-row items-center justify-center py-2">
              <Clock size={16} color="#6366F1" />
              <Text className="ml-1 text-sm font-medium text-primary-500">Do Later</Text>
            </TouchableOpacity>

            <View className="w-px bg-gray-100 dark:bg-gray-700" />

            <TouchableOpacity
              onPress={() => handleDeleteTask(task.id)}
              className="flex-1 flex-row items-center justify-center py-2">
              <Text className="text-sm font-medium text-danger-500">Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Pending Tasks */}
        <View className="mb-6">
          <Text className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
            Pending Tasks ({pendingTasks.length})
          </Text>

          {pendingTasks.length > 0 ? (
            pendingTasks.map(renderTaskItem)
          ) : (
            <Text className="italic text-gray-500 dark:text-gray-400">No pending tasks</Text>
          )}
        </View>

        {/* Later Tasks */}
        <View className="mb-6">
          <Text className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
            Do Later ({laterTasks.length})
          </Text>

          {laterTasks.length > 0 ? (
            laterTasks.map(renderTaskItem)
          ) : (
            <Text className="italic text-gray-500 dark:text-gray-400">No deferred tasks</Text>
          )}
        </View>

        {/* Completed Tasks */}
        <View className="mb-6">
          <Text className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
            Completed ({completedTasks.length})
          </Text>

          {completedTasks.length > 0 ? (
            completedTasks.slice(0, 5).map(renderTaskItem)
          ) : (
            <Text className="italic text-gray-500 dark:text-gray-400">No completed tasks</Text>
          )}

          {completedTasks.length > 5 && (
            <Text className="mt-2 text-sm font-medium text-primary-500">
              + {completedTasks.length - 5} more completed tasks
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Add Task Button */}
      <View className="absolute bottom-6 right-6">
        <TouchableOpacity
          onPress={handleAddTask}
          className="h-14 w-14 items-center justify-center rounded-full bg-primary-500 shadow-lg">
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Task Modal */}
      <TaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        task={selectedTask}
      />
    </View>
  );
}

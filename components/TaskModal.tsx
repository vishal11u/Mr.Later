import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Calendar as CalendarIcon } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TaskPriority, TaskStatus, useTaskStore } from '@/store/taskStore';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import * as Notifications from 'expo-notifications';

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  task?: any;
}

const TaskModal = ({ visible, onClose, task }: TaskModalProps) => {
  const { createTask, updateTask } = useTaskStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('pending');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setDueDate(new Date(task.due_date) || new Date());
      setPriority(task.priority || 'medium');
      setCategory(task.category || '');
      setStatus(task.status || 'pending');
    } else {
      resetForm();
    }
  }, [task, visible]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate(new Date());
    setPriority('medium');
    setCategory('');
    setStatus('pending');
    setError('');
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const taskData = {
        title,
        description,
        due_date: dueDate.toISOString(),
        priority,
        category: category || null,
        status,
      };

      if (task) {
        await updateTask(task.id, {
          title,
          description,
          due_date: dueDate.toISOString(),
          priority: priority as TaskPriority,
          category: category || null,
          status: status as TaskStatus,
        });
      } else {
        await createTask({
          title,
          description,
          due_date: dueDate.toISOString(),
          priority: priority as TaskPriority,
          category: category || null,
          status: status as TaskStatus,
        });
      }

      // Show success notification
      if (Platform.OS !== 'web') {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: task ? '✅ Task Updated!' : '✨ Task Created!',
              body: task
                ? 'Your task has been updated successfully'
                : 'Your task has been created successfully',
              data: { type: task ? 'task_update' : 'task_create' },
            },
            trigger: null, // Send immediately
          });
        } catch (notifError) {
          console.warn('Could not send notification:', notifError);
        }
      }

      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!task) return;

    setIsLoading(true);

    try {
      await updateTask(task.id, { status: task.status === 'done' ? 'pending' : 'done' });
      onClose();
      // Show success notification
      if (Platform.OS !== 'web') {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '✅ Task Status Updated!',
              body: task.status === 'done'
                ? 'Your task has been marked as pending'
                : 'Your task has been marked as done',
              data: { type: 'task_status_update' },
            },
            trigger: null, // Send immediately
          });
        } catch (notifError) {
          console.warn('Could not send notification:', notifError);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update task status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end bg-black/50">
          <TouchableWithoutFeedback onPress={() => {}}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <View className="max-h-[80%] rounded-t-xl bg-white dark:bg-gray-800">
                <View className="flex-row items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                  <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                    {task ? 'Edit Task' : 'New Task'}
                  </Text>
                  <TouchableOpacity onPress={onClose}>
                    <X size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <ScrollView className="p-4">
                  {error ? (
                    <View className="bg-danger-50 border-danger-200 mb-4 rounded-lg border p-3">
                      <Text className="text-danger-700 text-sm">{error}</Text>
                    </View>
                  ) : null}

                  <Input
                    label="Title"
                    placeholder="Task title"
                    value={title}
                    onChangeText={setTitle}
                    className="mb-4"
                  />

                  <Input
                    label="Description (optional)"
                    placeholder="Add details about your task"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    value={description}
                    onChangeText={setDescription}
                    className="mb-4 min-h-[80px] py-2"
                  />

                  <Text className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Due Date
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="mb-4 flex-row items-center rounded-lg border border-gray-300 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                    <CalendarIcon size={18} color="#6B7280" />
                    <Text className="ml-2 text-gray-900 dark:text-white">
                      {dueDate.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={dueDate}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                    />
                  )}

                  <Text className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Priority
                  </Text>
                  <View className="mb-4 flex-row">
                    {['low', 'medium', 'high'].map((p) => (
                      <TouchableOpacity
                        key={p}
                        onPress={() => setPriority(p)}
                        className={`mr-2 flex-1 rounded-lg px-3 py-2 last:mr-0 ${
                          priority === p
                            ? p === 'high'
                              ? 'bg-danger-100 border-danger-300'
                              : p === 'medium'
                                ? 'bg-warning-100 border-warning-300'
                                : 'bg-success-100 border-success-300'
                            : 'bg-gray-100 dark:bg-gray-700'
                        } border`}>
                        <Text
                          className={`text-center capitalize ${
                            priority === p
                              ? p === 'high'
                                ? 'text-danger-800'
                                : p === 'medium'
                                  ? 'text-warning-800'
                                  : 'text-success-800'
                              : 'text-gray-800 dark:text-gray-200'
                          }`}>
                          {p}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Input
                    label="Category (optional)"
                    placeholder="e.g. Work, Personal, Study"
                    value={category}
                    onChangeText={setCategory}
                    className="mb-4"
                  />
                </ScrollView>

                <View className="border-t border-gray-200 p-4 dark:border-gray-700">
                  {task && (
                    <Button
                      variant="outline"
                      onPress={handleToggleStatus}
                      isLoading={isLoading}
                      className="mb-3">
                      {task.status === 'done' ? 'Mark as Pending' : 'Mark as Done'}
                    </Button>
                  )}

                  <Button onPress={handleSave} isLoading={isLoading}>
                    {task ? 'Update Task' : 'Create Task'}
                  </Button>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default TaskModal;

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Plus, Calendar, Clock, ChevronRight, AlertCircle } from 'lucide-react-native';
import { useTaskStore } from '@/store/taskStore';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import TaskModal from '@/components/TaskModal';
 


export default function TasksScreen() {
  const { tasks, fetchTasks, deleteTask, doLater, isLoading } = useTaskStore();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  useEffect(() => {
    fetchTasks();
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
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => deleteTask(taskId)
        }
      ]
    );
  };
  
  const handledoLater = (taskId: string) => {
    doLater(taskId);
  };
  
   const pendingTasks = tasks.filter(task => task.status === 'pending');
  const laterTasks = tasks.filter(task => task.status === 'later');
  const completedTasks = tasks.filter(task => task.status === 'done');
  
  const renderTaskItem = (task: any) => {
    const isPastDue = new Date(task.due_date) < new Date() && task.status !== 'done';
    
    return (
      <View 
        key={task.id}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-3 overflow-hidden"
      >
        <TouchableOpacity
          onPress={() => handleEditTask(task)}
          className="p-4"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View 
                className={`w-3 h-3 rounded-full mr-3 ${
                  task.priority === 'high' 
                    ? 'bg-danger-500' 
                    : task.priority === 'medium' 
                      ? 'bg-warning-500' 
                      : 'bg-success-500'
                }`} 
              />
              <Text 
                className={`font-medium flex-1 ${
                  task.status === 'done' 
                    ? 'text-gray-400 dark:text-gray-500 line-through' 
                    : 'text-gray-800 dark:text-gray-200'
                }`}
              >
                {task.title}
              </Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </View>
          
          {task.description ? (
            <Text 
              numberOfLines={2}
              className="text-gray-500 dark:text-gray-400 text-sm ml-6 mt-1"
            >
              {task.description}
            </Text>
          ) : null}
          
          <View className="flex-row items-center mt-3 ml-6">
            <Calendar size={14} color="#6B7280" />
            <Text className="text-gray-500 dark:text-gray-400 text-xs ml-1">
              {formatDate(task.due_date)}
            </Text>
            
            {isPastDue && (
              <View className="flex-row items-center ml-3">
                <AlertCircle size={14} color="#EF4444" />
                <Text className="text-danger-500 text-xs ml-1">
                  Past due
                </Text>
              </View>
            )}
            
            {task.category ? (
              <View className="bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5 ml-3">
                <Text className="text-gray-600 dark:text-gray-300 text-xs">
                  {task.category}
                </Text>
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
        
        {task.status !== 'done' && (
          <View className="flex-row border-t border-gray-100 dark:border-gray-700">
            <TouchableOpacity
              onPress={() => handledoLater(task.id)}
              className="flex-1 py-2 flex-row justify-center items-center"
            >
              <Clock size={16} color="#6366F1" />
              <Text className="text-primary-500 text-sm font-medium ml-1">
                Do Later
              </Text>
            </TouchableOpacity>
            
            <View className="w-px bg-gray-100 dark:bg-gray-700" />
            
            <TouchableOpacity
              onPress={() => handleDeleteTask(task.id)}
              className="flex-1 py-2 flex-row justify-center items-center"
            >
              <Text className="text-danger-500 text-sm font-medium">
                Delete
              </Text>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Pending Tasks */}
        <View className="mb-6">
          <Text className="text-gray-800 dark:text-gray-200 font-semibold text-lg mb-3">
            Pending Tasks ({pendingTasks.length})
          </Text>
          
          {pendingTasks.length > 0 ? (
            pendingTasks.map(renderTaskItem)
          ) : (
            <Text className="text-gray-500 dark:text-gray-400 italic">
              No pending tasks
            </Text>
          )}
        </View>
        
        {/* Later Tasks */}
        <View className="mb-6">
          <Text className="text-gray-800 dark:text-gray-200 font-semibold text-lg mb-3">
            Do Later ({laterTasks.length})
          </Text>
          
          {laterTasks.length > 0 ? (
            laterTasks.map(renderTaskItem)
          ) : (
            <Text className="text-gray-500 dark:text-gray-400 italic">
              No deferred tasks
            </Text>
          )}
        </View>
        
        {/* Completed Tasks */}
        <View className="mb-6">
          <Text className="text-gray-800 dark:text-gray-200 font-semibold text-lg mb-3">
            Completed ({completedTasks.length})
          </Text>
          
          {completedTasks.length > 0 ? (
            completedTasks.slice(0, 5).map(renderTaskItem)
          ) : (
            <Text className="text-gray-500 dark:text-gray-400 italic">
              No completed tasks
            </Text>
          )}
          
          {completedTasks.length > 5 && (
            <Text className="text-primary-500 text-sm font-medium mt-2">
              + {completedTasks.length - 5} more completed tasks
            </Text>
          )}
        </View>
      </ScrollView>
      
      {/* Add Task Button */}
      <View className="absolute bottom-6 right-6">
        <TouchableOpacity
          onPress={handleAddTask}
          className="bg-primary-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        >
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
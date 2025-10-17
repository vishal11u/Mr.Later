import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { Users, Calendar, Trophy, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useChallengeStore } from '@/store/challengeStore';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
 

export default function ChallengesScreen() {
  const { user } = useAuthStore();
  const { 
    challenges, 
    userChallenges, 
    fetchChallenges, 
    fetchUserChallenges, 
    joinChallenge, 
    leaveChallenge, 
   
    subscribeToChanges,
  } = useChallengeStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('discover'); // 'discover' or 'joined'
  
  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToChanges();
    return () => {
      try {
        unsubscribe && unsubscribe();
      } catch {}
    };
  }, []);
  
  const loadData = async () => {
    await fetchChallenges();
    await fetchUserChallenges();
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  
  const handleJoinChallenge = async (challengeId: string) => {
    await joinChallenge(challengeId);
  };
  
  const handleLeaveChallenge = async (challengeId: string) => {
    await leaveChallenge(challengeId);
  };
  
  const renderChallengeItem = (challenge: any, isJoined = false) => {
    const startDate = new Date(challenge.start_date);
    const endDate = new Date(challenge.end_date);
    const isActive = startDate <= new Date() && endDate >= new Date();
    const participantCount = challenge.participants?.length || 0;
    
    return (
      <View 
        key={challenge.id}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4 overflow-hidden"
      >
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              {challenge.name}
            </Text>
            {isActive ? (
              <View className="bg-success-100 px-2 py-0.5 rounded-full">
                <Text className="text-success-800 text-xs font-medium">Active</Text>
              </View>
            ) : (
              <View className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                <Text className="text-gray-600 dark:text-gray-300 text-xs font-medium">
                  {startDate > new Date() ? 'Upcoming' : 'Ended'}
                </Text>
              </View>
            )}
          </View>
          
          <Text className="text-gray-600 dark:text-gray-400 mb-3">
            {challenge.description}
          </Text>
          
          <View className="flex-row items-center mb-2">
            <Calendar size={16} color="#6B7280" />
            <Text className="text-gray-600 dark:text-gray-400 text-sm ml-2">
              {formatDate(challenge.start_date)} - {formatDate(challenge.end_date)}
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <Users size={16} color="#6B7280" />
            <Text className="text-gray-600 dark:text-gray-400 text-sm ml-2">
              {participantCount} {participantCount === 1 ? 'participant' : 'participants'}
            </Text>
          </View>
        </View>
        
        <View className="border-t border-gray-100 dark:border-gray-700 p-3">
          {isJoined ? (
            <Button
              variant="outline"
              onPress={() => handleLeaveChallenge(challenge.id)}
              className="bg-transparent"
            >
              Leave Challenge
            </Button>
          ) : (
            <Button
              onPress={() => handleJoinChallenge(challenge.id)}
            >
              Join Challenge
            </Button>
          )}
        </View>
      </View>
    );
  };
  
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Tabs */}
      <View className="flex-row border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity
          onPress={() => setActiveTab('discover')}
          className={`flex-1 py-3 ${
            activeTab === 'discover' 
              ? 'border-b-2 border-primary-500' 
              : ''
          }`}
        >
          <Text 
            className={`text-center font-medium ${
              activeTab === 'discover'
                ? 'text-primary-500'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Discover
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setActiveTab('joined')}
          className={`flex-1 py-3 ${
            activeTab === 'joined' 
              ? 'border-b-2 border-primary-500' 
              : ''
          }`}
        >
          <Text 
            className={`text-center font-medium ${
              activeTab === 'joined'
                ? 'text-primary-500'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            My Challenges
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'discover' ? (
          <>
            {challenges.length > 0 ? (
              challenges.map(challenge => {
                const isJoined = userChallenges.some(c => c.id === challenge.id);
                return renderChallengeItem(challenge, isJoined);
              })
            ) : (
              <View className="items-center justify-center py-10">
                <Trophy size={48} color="#9CA3AF" />
                <Text className="text-gray-500 dark:text-gray-400 mt-4 text-center">
                  No challenges available at the moment.
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {userChallenges.length > 0 ? (
              userChallenges.map(challenge => renderChallengeItem(challenge, true))
            ) : (
              <View className="items-center justify-center py-10">
                <Trophy size={48} color="#9CA3AF" />
                <Text className="text-gray-500 dark:text-gray-400 mt-4 text-center">
                  You haven't joined any challenges yet.
                </Text>
                <Button
                  variant="outline"
                  onPress={() => setActiveTab('discover')}
                  className="mt-4"
                >
                  Discover Challenges
                </Button>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
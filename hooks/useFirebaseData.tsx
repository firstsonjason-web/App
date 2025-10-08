import { useState, useEffect } from 'react';
import { useAuth } from './useFirebaseAuth';
import { DatabaseService, Goal, UserProfile, Activity } from '@/lib/firebase-services';
import { getCurrentUserId } from '@/lib/firebase-services';

export const useFirebaseData = () => {
  const { user, userProfile } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user goals and activities when user profile is available
  useEffect(() => {
    if (user && userProfile) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [user, userProfile]);

  const loadUserData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('Loading user data for user:', user.uid);

      // Load goals
      const userGoals = await DatabaseService.getUserGoals(user.uid);
      console.log('Loaded goals:', userGoals);
      setGoals(userGoals);

      // Load recent activities
      const userActivities = await DatabaseService.getUserActivities(user.uid, 10);
      console.log('Loaded activities:', userActivities);
      setActivities(userActivities);

      console.log('Data loaded successfully');
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (goalData: Omit<Goal, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('Adding goal with data:', goalData);

      const goalId = await DatabaseService.createGoal({
        ...goalData,
        userId: user.uid,
      });

      console.log('Goal created with ID:', goalId);

      // Reload goals to get the updated list
      console.log('Reloading user data after goal creation...');
      await loadUserData();

      // Force state update to ensure UI refreshes
      const updatedGoals = await DatabaseService.getUserGoals(user.uid);
      console.log('Force updated goals after reload:', updatedGoals);
      setGoals(updatedGoals);

      console.log('Final goals state:', goals);

      return goalId;
    } catch (error) {
      console.error('Error adding goal:', error);
      throw error;
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    try {
      await DatabaseService.updateGoal(goalId, updates);

      // Update local state
      setGoals(prevGoals =>
        prevGoals.map(goal =>
          goal.id === goalId ? { ...goal, ...updates } : goal
        )
      );

      // If goal was completed, add points and activity
      if (updates.completed && !goals.find(g => g.id === goalId)?.completed) {
        const goal = goals.find(g => g.id === goalId);
        if (goal) {
          await DatabaseService.completeGoal(goalId, user!.uid);
          await loadUserData(); // Reload to get updated points and activities
        }
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      await DatabaseService.deleteGoal(goalId);

      // Update local state
      setGoals(prevGoals => prevGoals.filter(goal => goal.id !== goalId));
      setActivities(prevActivities => prevActivities.filter(activity => activity.id !== goalId));
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  };

  const updateDailyPrize = async (prize: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await DatabaseService.updateUserProfile(user.uid, {
        dailyPrize: prize,
        updatedAt: new Date() as any, // Firebase Timestamp will be handled by the service
      });

      // Note: userProfile is managed by useAuth hook, so no local update needed
    } catch (error) {
      console.error('Error updating daily prize:', error);
      throw error;
    }
  };

  const getTotalPoints = () => {
    return goals
      .filter(goal => goal.completed)
      .reduce((sum, goal) => sum + goal.points, 0);
  };

  const getCompletedGoalsCount = () => {
    return goals.filter(goal => goal.completed).length;
  };

  return {
    goals,
    activities,
    userProfile,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    updateDailyPrize,
    getTotalPoints,
    getCompletedGoalsCount,
    refreshData: loadUserData,
  };
};
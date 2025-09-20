import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Calendar, Flame } from 'lucide-react';
import { databaseService } from '@/services/databaseService';

const DailyCheck = () => {
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [streakDays, setStreakDays] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const stats = await databaseService.getPlantStats();
      setStreakDays(stats?.streak_days || 0);
      
      // Check if user has interacted today
      const today = new Date().toDateString();
      const lastUpdate = stats?.updated_at ? new Date(stats.updated_at).toDateString() : null;
      setTodayCompleted(lastUpdate === today && (stats?.total_conversations || 0) > 0);
    } catch (error) {
      console.error('Error loading daily check data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDailyCheckIn = async () => {
    if (!todayCompleted) {
      try {
        const currentStats = await databaseService.getPlantStats();
        await databaseService.updatePlantStats({
          experience: (currentStats?.experience || 0) + 20,
          streak_days: (currentStats?.streak_days || 0) + 1
        });
        setTodayCompleted(true);
        setStreakDays(prev => prev + 1);
      } catch (error) {
        console.error('Error updating daily check:', error);
      }
    }
  };

  const dailyTasks = [
    { id: 'chat', title: 'Chat with PlantPal', completed: todayCompleted },
    { id: 'mood', title: 'Log your mood', completed: false }, // This would need mood tracking logic
    { id: 'breathe', title: 'Take 3 deep breaths', completed: false }
  ];

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-foreground">Daily Wellness Check</h3>
        </div>
        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
          <Flame className="w-3 h-3 mr-1" />
          {streakDays} day streak
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        {dailyTasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50">
            {task.completed ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400" />
            )}
            <span className={`flex-1 ${task.completed ? 'text-green-700 line-through' : 'text-muted-foreground'}`}>
              {task.title}
            </span>
          </div>
        ))}
      </div>

      {!todayCompleted && (
        <Button 
          onClick={handleDailyCheckIn} 
          className="w-full bg-green-600 hover:bg-green-700"
        >
          Complete Daily Check-In (+20 EXP)
        </Button>
      )}

      {todayCompleted && (
        <div className="text-center p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
          <p className="text-green-800 dark:text-green-200 text-sm">
            🎉 Great job! You have completed your daily check-in. Keep growing! 🌱
          </p>
        </div>
      )}
    </Card>
  );
};

export default DailyCheck;
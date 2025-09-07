import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Calendar, Flame } from 'lucide-react';
import { storageService } from '@/services/storageService';

const DailyCheck = () => {
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [streakDays, setStreakDays] = useState(0);

  useEffect(() => {
    const stats = storageService.getPlantStats();
    setStreakDays(stats.streakDays);
    
    // Check if user has interacted today
    const lastInteraction = new Date(stats.lastInteraction);
    const today = new Date();
    const isToday = lastInteraction.toDateString() === today.toDateString();
    setTodayCompleted(isToday && stats.totalConversations > 0);
  }, []);

  const handleDailyCheckIn = () => {
    if (!todayCompleted) {
      storageService.updatePlantExperience(20);
      setTodayCompleted(true);
      setStreakDays(prev => prev + 1);
    }
  };

  const dailyTasks = [
    { id: 'chat', title: 'Chat with PlantPal', completed: todayCompleted },
    { id: 'mood', title: 'Log your mood', completed: false }, // This would need mood tracking logic
    { id: 'breathe', title: 'Take 3 deep breaths', completed: false }
  ];

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
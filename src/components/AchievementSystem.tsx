import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Target, Calendar } from 'lucide-react';
import { storageService, Achievement, PlantStats } from '@/services/storageService';

const AchievementSystem = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [plantStats, setPlantStats] = useState<PlantStats | null>(null);

  useEffect(() => {
    setAchievements(storageService.getAchievements());
    setPlantStats(storageService.getPlantStats());
  }, []);

  const allAchievements = [
    // Conversation achievements
    { id: 'first_chat', title: 'First Words', description: 'Started your first conversation', icon: '🌱', category: 'conversation', target: 1 },
    { id: 'chatter_10', title: 'Chatterbox', description: 'Had 10 conversations', icon: '💬', category: 'conversation', target: 10 },
    { id: 'chatter_25', title: 'Social Butterfly', description: 'Had 25 conversations', icon: '🦋', category: 'conversation', target: 25 },
    { id: 'chatter_50', title: 'Communication Master', description: 'Had 50 conversations', icon: '🗣️', category: 'conversation', target: 50 },
    
    // Growth achievements
    { id: 'level_5', title: 'Growing Strong', description: 'Reached level 5', icon: '🌿', category: 'growth', target: 5 },
    { id: 'level_10', title: 'Flourishing', description: 'Reached level 10', icon: '🌳', category: 'growth', target: 10 },
    { id: 'level_15', title: 'Mighty Oak', description: 'Reached level 15', icon: '🌲', category: 'growth', target: 15 },
    
    // Streak achievements
    { id: 'streak_3', title: 'Consistency Seedling', description: '3-day check-in streak', icon: '📅', category: 'streak', target: 3 },
    { id: 'streak_7', title: 'Weekly Warrior', description: '7-day check-in streak', icon: '⭐', category: 'streak', target: 7 },
    { id: 'streak_30', title: 'Monthly Master', description: '30-day check-in streak', icon: '🏆', category: 'streak', target: 30 },
    
    // Mood achievements
    { id: 'mood_tracker', title: 'Self-Aware Sprout', description: 'Logged your first mood', icon: '😊', category: 'mood', target: 1 },
    { id: 'mood_week', title: 'Mindful Week', description: 'Logged moods for 7 days', icon: '🧘', category: 'mood', target: 7 },
    { id: 'emotional_intelligence', title: 'Emotional Intelligence', description: 'Logged 30 mood entries', icon: '🧠', category: 'mood', target: 30 },
  ];

  const unlockedIds = achievements.map(a => a.id);
  
  const getProgress = (achievement: any): number => {
    if (!plantStats) return 0;
    
    switch (achievement.category) {
      case 'conversation':
        return Math.min(100, (plantStats.totalConversations / achievement.target) * 100);
      case 'growth':
        return Math.min(100, (plantStats.level / achievement.target) * 100);
      case 'streak':
        return Math.min(100, (plantStats.streakDays / achievement.target) * 100);
      case 'mood':
        const moodEntries = storageService.getMoodEntries().length;
        return Math.min(100, (moodEntries / achievement.target) * 100);
      default:
        return 0;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'conversation': return <Target className="w-4 h-4" />;
      case 'growth': return <Trophy className="w-4 h-4" />;
      case 'streak': return <Calendar className="w-4 h-4" />;
      case 'mood': return <Star className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'conversation': return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
      case 'growth': return 'bg-green-500/20 text-green-700 dark:text-green-300';
      case 'streak': return 'bg-purple-500/20 text-purple-700 dark:text-purple-300';
      case 'mood': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      {plantStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center bg-card/50">
            <div className="text-2xl font-bold text-primary">{plantStats.level}</div>
            <div className="text-sm text-muted-foreground">Plant Level</div>
          </Card>
          <Card className="p-4 text-center bg-card/50">
            <div className="text-2xl font-bold text-primary">{plantStats.totalConversations}</div>
            <div className="text-sm text-muted-foreground">Conversations</div>
          </Card>
          <Card className="p-4 text-center bg-card/50">
            <div className="text-2xl font-bold text-primary">{achievements.length}</div>
            <div className="text-sm text-muted-foreground">Achievements</div>
          </Card>
          <Card className="p-4 text-center bg-card/50">
            <div className="text-2xl font-bold text-primary">{plantStats.streakDays}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </Card>
        </div>
      )}

      {/* Achievement Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allAchievements.map((achievement) => {
          const isUnlocked = unlockedIds.includes(achievement.id);
          const progress = getProgress(achievement);
          
          return (
            <Card 
              key={achievement.id} 
              className={`p-4 transition-all duration-300 ${
                isUnlocked 
                  ? 'bg-primary/10 border-primary/50 shadow-lg' 
                  : 'bg-card/30 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`text-2xl ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </span>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
                {isUnlocked && (
                  <Badge variant="default" className="bg-primary/20">
                    <Trophy className="w-3 h-3 mr-1" />
                    Unlocked
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Badge variant="outline" className={getCategoryColor(achievement.category)}>
                    {getCategoryIcon(achievement.category)}
                    <span className="ml-1 capitalize">{achievement.category}</span>
                  </Badge>
                  <span className="text-muted-foreground">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Achievements */}
      {achievements.length > 0 && (
        <Card className="p-6 bg-card/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Recent Achievements
          </h3>
          <div className="space-y-3">
            {achievements
              .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
              .slice(0, 3)
              .map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                  <span className="text-xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{achievement.title}</div>
                    <div className="text-sm text-muted-foreground">{achievement.description}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {achievement.unlockedAt.toLocaleDateString()}
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AchievementSystem;
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Target, Calendar, Crown, Gem, Lock } from 'lucide-react';
import { databaseService, DbAchievement, DbPlantStats } from '@/services/databaseService';

interface AchievementTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'conversation' | 'mood' | 'streak' | 'growth';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  target: number;
  requirement: string;
}

const AchievementSystem = () => {
  const [achievements, setAchievements] = useState<DbAchievement[]>([]);
  const [plantStats, setPlantStats] = useState<DbPlantStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [achievementsData, statsData] = await Promise.all([
        databaseService.getAchievements(),
        databaseService.getPlantStats()
      ]);
      setAchievements(achievementsData);
      setPlantStats(statsData);
    } catch (error) {
      console.error('Error loading achievement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const allAchievementTemplates: AchievementTemplate[] = [
    { 
      id: 'first_chat', 
      title: 'First Words', 
      description: 'Started your first conversation with PlantPal', 
      icon: '🌱', 
      category: 'conversation', 
      rarity: 'common',
      target: 1,
      requirement: 'Have your first conversation'
    },
    { 
      id: 'chatter_10', 
      title: 'Chatterbox', 
      description: 'Had 10 meaningful conversations', 
      icon: '💬', 
      category: 'conversation', 
      rarity: 'common',
      target: 10,
      requirement: 'Complete 10 conversations'
    },
    { 
      id: 'level_5', 
      title: 'Growing Strong', 
      description: 'Your plant companion reached level 5', 
      icon: '🌿', 
      category: 'growth', 
      rarity: 'common',
      target: 5,
      requirement: 'Reach plant level 5'
    },
    { 
      id: 'streak_3', 
      title: 'Consistency Seedling', 
      description: 'Maintained a 3-day check-in streak', 
      icon: '📅', 
      category: 'streak', 
      rarity: 'common',
      target: 3,
      requirement: 'Check in for 3 consecutive days'
    },
    { 
      id: 'mood_tracker', 
      title: 'Self-Aware Sprout', 
      description: 'Logged your first mood entry', 
      icon: '😊', 
      category: 'mood', 
      rarity: 'common',
      target: 1,
      requirement: 'Record your first mood'
    }
  ];

  const unlockedIds = achievements.map(a => a.achievement_id);
  
  const getProgress = (template: AchievementTemplate): number => {
    if (!plantStats) return 0;
    
    switch (template.category) {
      case 'conversation':
        return Math.min(100, (plantStats.total_conversations / template.target) * 100);
      case 'growth':
        return Math.min(100, (plantStats.level / template.target) * 100);
      case 'streak':
        return Math.min(100, (plantStats.streak_days / template.target) * 100);
      case 'mood':
        return Math.min(100, (plantStats.total_mood_entries / template.target) * 100);
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

  const getCategoryGradient = (category: string) => {
    switch (category) {
      case 'conversation': return 'from-blue-500/20 to-cyan-500/20';
      case 'growth': return 'from-green-500/20 to-emerald-500/20';
      case 'streak': return 'from-purple-500/20 to-violet-500/20';
      case 'mood': return 'from-yellow-500/20 to-orange-500/20';
      default: return 'from-gray-500/20 to-slate-500/20';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Star className="w-3 h-3" />;
      case 'rare': return <Gem className="w-3 h-3" />;
      case 'epic': return <Crown className="w-3 h-3" />;
      case 'legendary': return <Trophy className="w-3 h-3" />;
      default: return <Star className="w-3 h-3" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-8 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {plantStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 text-center bg-gradient-to-br from-emerald-500/10 to-green-500/5 border-emerald-200/50 shadow-lg">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">{plantStats.level}</div>
            <div className="text-sm text-emerald-600/70 dark:text-emerald-400/70 font-medium">Plant Level</div>
          </Card>
          <Card className="p-6 text-center bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-200/50 shadow-lg">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{plantStats.total_conversations}</div>
            <div className="text-sm text-blue-600/70 dark:text-blue-400/70 font-medium">Conversations</div>
          </Card>
          <Card className="p-6 text-center bg-gradient-to-br from-purple-500/10 to-violet-500/5 border-purple-200/50 shadow-lg">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{achievements.length}</div>
            <div className="text-sm text-purple-600/70 dark:text-purple-400/70 font-medium">Achievements</div>
          </Card>
          <Card className="p-6 text-center bg-gradient-to-br from-orange-500/10 to-yellow-500/5 border-orange-200/50 shadow-lg">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">{plantStats.streak_days}</div>
            <div className="text-sm text-orange-600/70 dark:text-orange-400/70 font-medium">Day Streak</div>
          </Card>
        </div>
      )}

      {/* Achievement Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allAchievementTemplates.map((template) => {
          const isUnlocked = unlockedIds.includes(template.id);
          const progress = getProgress(template);
          const achievement = achievements.find(a => a.achievement_id === template.id);
          
          return (
            <Card 
              key={template.id} 
              className={`
                relative overflow-hidden transition-all duration-500 hover:scale-105
                ${isUnlocked 
                  ? `bg-gradient-to-br ${getCategoryGradient(template.category)} border-2 border-primary/50 shadow-lg` 
                  : 'bg-card/30 border-dashed border-muted-foreground/30 opacity-75'
                }
              `}
            >
              <div className="p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <span className={`text-3xl block ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
                        {template.icon}
                      </span>
                      {!isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold text-lg mb-1 ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {template.title}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                        {template.description}
                      </p>
                      {!isUnlocked && (
                        <p className="text-xs text-muted-foreground/70 italic">
                          {template.requirement}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`px-3 py-1 bg-gradient-to-r ${getCategoryGradient(template.category)} border-current text-xs font-medium`}
                      >
                        {getCategoryIcon(template.category)}
                        <span className="ml-1 capitalize">{template.category}</span>
                      </Badge>
                      
                      <Badge variant="outline" className="px-2 py-1 text-xs">
                        {getRarityIcon(template.rarity)}
                        <span className="ml-1 capitalize">{template.rarity}</span>
                      </Badge>
                    </div>
                    
                    {isUnlocked ? (
                      <Badge variant="default" className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        <Trophy className="w-3 h-3 mr-1" />
                        Unlocked
                      </Badge>
                    ) : (
                      <span className="text-sm font-medium text-muted-foreground">
                        {Math.round(progress)}%
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Progress 
                      value={progress} 
                      className={`h-2 ${isUnlocked ? 'bg-emerald-100 dark:bg-emerald-900/20' : 'bg-muted/50'}`}
                    />
                    {achievement && (
                      <div className="text-xs text-muted-foreground text-right">
                        Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Achievements */}
      {achievements.length > 0 && (
        <Card className="p-8 bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-primary/20 shadow-xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            Recent Achievements
            <Badge variant="outline" className="ml-auto">{achievements.length} Total</Badge>
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {achievements
              .sort((a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())
              .slice(0, 6)
              .map((achievement) => (
                <div 
                  key={achievement.id} 
                  className="flex items-center gap-4 p-4 bg-card/50 rounded-xl border border-border/50 hover:bg-card/70 transition-colors"
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground truncate">{achievement.title}</div>
                    <div className="text-sm text-muted-foreground truncate">{achievement.description}</div>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {achievement.category}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(achievement.unlocked_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {achievements.length === 0 && (
        <Card className="p-8 text-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Achievements Yet</h3>
          <p className="text-muted-foreground">
            Start chatting with PlantPal and tracking your moods to unlock achievements!
          </p>
        </Card>
      )}
    </div>
  );
};

export default AchievementSystem;
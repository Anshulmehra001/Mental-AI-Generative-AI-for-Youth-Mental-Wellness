export interface MoodEntry {
  id: string;
  mood: 'happy' | 'content' | 'neutral' | 'sad' | 'excited';
  intensity: number; // 1-10
  timestamp: Date;
  notes?: string;
  triggers?: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: 'conversation' | 'mood' | 'streak' | 'growth';
}

export interface PlantStats {
  level: number;
  experience: number;
  totalConversations: number;
  streakDays: number;
  lastInteraction: Date;
  plantType: string;
}

class StorageService {
  private readonly KEYS = {
    MOOD_ENTRIES: 'plantpal_mood_entries',
    ACHIEVEMENTS: 'plantpal_achievements',
    PLANT_STATS: 'plantpal_plant_stats',
    CHAT_HISTORY: 'plantpal_chat_history'
  };

  // Mood tracking
  saveMoodEntry(entry: MoodEntry): void {
    const entries = this.getMoodEntries();
    entries.push(entry);
    localStorage.setItem(this.KEYS.MOOD_ENTRIES, JSON.stringify(entries));
  }

  getMoodEntries(): MoodEntry[] {
    const data = localStorage.getItem(this.KEYS.MOOD_ENTRIES);
    if (!data) return [];
    return JSON.parse(data).map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    }));
  }

  // Achievements
  unlockAchievement(achievement: Achievement): void {
    const achievements = this.getAchievements();
    if (!achievements.find(a => a.id === achievement.id)) {
      achievements.push(achievement);
      localStorage.setItem(this.KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    }
  }

  getAchievements(): Achievement[] {
    const data = localStorage.getItem(this.KEYS.ACHIEVEMENTS);
    if (!data) return [];
    return JSON.parse(data).map((achievement: any) => ({
      ...achievement,
      unlockedAt: new Date(achievement.unlockedAt)
    }));
  }

  // Plant stats
  getPlantStats(): PlantStats {
    const data = localStorage.getItem(this.KEYS.PLANT_STATS);
    if (!data) {
      const defaultStats: PlantStats = {
        level: 1,
        experience: 0,
        totalConversations: 0,
        streakDays: 0,
        lastInteraction: new Date(),
        plantType: 'seedling'
      };
      this.savePlantStats(defaultStats);
      return defaultStats;
    }
    const stats = JSON.parse(data);
    return {
      ...stats,
      lastInteraction: new Date(stats.lastInteraction)
    };
  }

  savePlantStats(stats: PlantStats): void {
    localStorage.setItem(this.KEYS.PLANT_STATS, JSON.stringify(stats));
  }

  updatePlantExperience(points: number): PlantStats {
    const stats = this.getPlantStats();
    stats.experience += points;
    stats.totalConversations += 1;
    stats.lastInteraction = new Date();
    
    // Level up logic
    const requiredExp = stats.level * 100;
    if (stats.experience >= requiredExp) {
      stats.level += 1;
      stats.experience = 0;
      stats.plantType = this.getPlantTypeByLevel(stats.level);
    }
    
    this.savePlantStats(stats);
    this.checkAndUnlockAchievements(stats);
    return stats;
  }

  private getPlantTypeByLevel(level: number): string {
    if (level <= 3) return 'seedling';
    if (level <= 7) return 'sprout';
    if (level <= 12) return 'sapling';
    if (level <= 20) return 'tree';
    return 'ancient_tree';
  }

  private checkAndUnlockAchievements(stats: PlantStats): void {
    const achievements = this.getAchievements();
    const newAchievements: Achievement[] = [];

    // First conversation
    if (stats.totalConversations === 1 && !achievements.find(a => a.id === 'first_chat')) {
      newAchievements.push({
        id: 'first_chat',
        title: 'First Words',
        description: 'Started your first conversation with PlantPal',
        icon: '🌱',
        unlockedAt: new Date(),
        category: 'conversation'
      });
    }

    // Conversation milestones
    if (stats.totalConversations === 10 && !achievements.find(a => a.id === 'chatter_10')) {
      newAchievements.push({
        id: 'chatter_10',
        title: 'Chatterbox',
        description: 'Had 10 conversations with PlantPal',
        icon: '💬',
        unlockedAt: new Date(),
        category: 'conversation'
      });
    }

    // Level milestones
    if (stats.level === 5 && !achievements.find(a => a.id === 'level_5')) {
      newAchievements.push({
        id: 'level_5',
        title: 'Growing Strong',
        description: 'Reached level 5 with your plant companion',
        icon: '🌿',
        unlockedAt: new Date(),
        category: 'growth'
      });
    }

    newAchievements.forEach(achievement => this.unlockAchievement(achievement));
  }

  // Analytics data
  getWeeklyMoodData(): { day: string; mood: number; count: number }[] {
    const entries = this.getMoodEntries();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentEntries = entries.filter(entry => entry.timestamp >= weekAgo);
    const groupedByDay = recentEntries.reduce((acc, entry) => {
      const day = entry.timestamp.toLocaleDateString('en-US', { weekday: 'short' });
      if (!acc[day]) {
        acc[day] = { totalMood: 0, count: 0 };
      }
      acc[day].totalMood += this.moodToNumber(entry.mood);
      acc[day].count += 1;
      return acc;
    }, {} as Record<string, { totalMood: number; count: number }>);

    return Object.entries(groupedByDay).map(([day, data]) => ({
      day,
      mood: data.totalMood / data.count,
      count: data.count
    }));
  }

  private moodToNumber(mood: string): number {
    const moodValues = { sad: 1, neutral: 3, content: 4, happy: 5, excited: 5 };
    return moodValues[mood as keyof typeof moodValues] || 3;
  }
}

export const storageService = new StorageService();
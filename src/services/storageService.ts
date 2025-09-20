export interface MoodEntry {
  id: string;
  mood: 'happy' | 'content' | 'neutral' | 'sad' | 'excited';
  intensity: number; // 1-10
  timestamp: Date;
  notes?: string;
  triggers?: string[];
  weather?: {
    temperature: number;
    condition: string;
  };
  context?: {
    location?: string;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    dayOfWeek: string;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: 'conversation' | 'mood' | 'streak' | 'growth';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface PlantStats {
  level: number;
  experience: number;
  totalConversations: number;
  streakDays: number;
  lastInteraction: Date;
  plantType: string;
  totalMoodEntries: number;
  averageMood: number;
  longestStreak: number;
  birthDate: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  reminderTime?: string;
  crisisContactName?: string;
  crisisContactNumber?: string;
  preferredName?: string;
}

class StorageService {
  private readonly KEYS = {
    MOOD_ENTRIES: 'plantpal_mood_entries',
    ACHIEVEMENTS: 'plantpal_achievements',
    PLANT_STATS: 'plantpal_plant_stats',
    CHAT_HISTORY: 'plantpal_chat_history',
    USER_PREFERENCES: 'plantpal_user_preferences',
    BACKUP_DATA: 'plantpal_backup_data'
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
        plantType: 'seedling',
        totalMoodEntries: 0,
        averageMood: 2.5,
        longestStreak: 0,
        birthDate: new Date()
      };
      this.savePlantStats(defaultStats);
      return defaultStats;
    }
    const stats = JSON.parse(data);
    return {
      ...stats,
      lastInteraction: new Date(stats.lastInteraction),
      birthDate: stats.birthDate ? new Date(stats.birthDate) : new Date()
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
    
    // Update streak logic
    const today = new Date().toDateString();
    const lastDay = stats.lastInteraction.toDateString();
    if (today !== lastDay) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastDay === yesterday.toDateString()) {
        stats.streakDays += 1;
      } else if (lastDay !== today) {
        stats.streakDays = 1;
      }
    }
    
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
    const moodEntries = this.getMoodEntries();

    // Conversation achievements
    const conversationMilestones = [1, 5, 10, 25, 50, 100];
    conversationMilestones.forEach(milestone => {
      const achievementId = milestone === 1 ? 'first_chat' : `chatter_${milestone}`;
      if (stats.totalConversations >= milestone && !achievements.find(a => a.id === achievementId)) {
        newAchievements.push({
          id: achievementId,
          title: milestone === 1 ? 'First Words' : 
                 milestone === 5 ? 'Getting Chatty' :
                 milestone === 10 ? 'Chatterbox' : 
                 milestone === 25 ? 'Social Butterfly' :
                 milestone === 50 ? 'Communication Master' : 'Chat Champion',
          description: `Had ${milestone} conversation${milestone > 1 ? 's' : ''} with PlantPal`,
          icon: milestone === 1 ? '🌱' : milestone <= 10 ? '💬' : milestone <= 25 ? '🦋' : '🗣️',
          unlockedAt: new Date(),
          category: 'conversation',
          rarity: milestone === 1 ? 'common' : milestone <= 10 ? 'common' : milestone <= 25 ? 'rare' : 'epic'
        });
      }
    });

    // Level achievements
    const levelMilestones = [3, 5, 10, 15, 20];
    levelMilestones.forEach(milestone => {
      const achievementId = `level_${milestone}`;
      if (stats.level >= milestone && !achievements.find(a => a.id === achievementId)) {
        newAchievements.push({
          id: achievementId,
          title: milestone === 3 ? 'Growing Up' :
                 milestone === 5 ? 'Growing Strong' :
                 milestone === 10 ? 'Flourishing' :
                 milestone === 15 ? 'Mighty Oak' : 'Ancient Wisdom',
          description: `Reached level ${milestone}`,
          icon: milestone <= 5 ? '🌿' : milestone <= 10 ? '🌳' : milestone <= 15 ? '🌲' : '🌲',
          unlockedAt: new Date(),
          category: 'growth',
          rarity: milestone <= 5 ? 'common' : milestone <= 10 ? 'rare' : milestone <= 15 ? 'epic' : 'legendary'
        });
      }
    });

    // Streak achievements
    const streakMilestones = [3, 7, 14, 30];
    streakMilestones.forEach(milestone => {
      const achievementId = `streak_${milestone}`;
      if (stats.streakDays >= milestone && !achievements.find(a => a.id === achievementId)) {
        newAchievements.push({
          id: achievementId,
          title: milestone === 3 ? 'Consistency Seedling' :
                 milestone === 7 ? 'Weekly Warrior' :
                 milestone === 14 ? 'Two Week Champion' : 'Monthly Master',
          description: `${milestone}-day check-in streak`,
          icon: milestone <= 3 ? '📅' : milestone <= 7 ? '⭐' : milestone <= 14 ? '🔥' : '🏆',
          unlockedAt: new Date(),
          category: 'streak',
          rarity: milestone <= 3 ? 'common' : milestone <= 7 ? 'rare' : milestone <= 14 ? 'epic' : 'legendary'
        });
      }
    });

    // Mood tracking achievements
    const moodMilestones = [1, 7, 15, 30, 50];
    moodMilestones.forEach(milestone => {
      const achievementId = milestone === 1 ? 'mood_tracker' : `mood_${milestone}`;
      if (moodEntries.length >= milestone && !achievements.find(a => a.id === achievementId)) {
        newAchievements.push({
          id: achievementId,
          title: milestone === 1 ? 'Self-Aware Sprout' :
                 milestone === 7 ? 'Mindful Week' :
                 milestone === 15 ? 'Emotional Explorer' :
                 milestone === 30 ? 'Emotional Intelligence' : 'Mood Master',
          description: milestone === 1 ? 'Logged your first mood' : `Logged ${milestone} mood entries`,
          icon: milestone === 1 ? '😊' : milestone <= 7 ? '🧘' : milestone <= 15 ? '🧠' : '💭',
          unlockedAt: new Date(),
          category: 'mood',
          rarity: milestone === 1 ? 'common' : milestone <= 7 ? 'common' : milestone <= 15 ? 'rare' : 'epic'
        });
      }
    });

    // Special achievements
    if (moodEntries.length >= 5) {
      const recentPositive = moodEntries.slice(-5).filter(e => e.mood === 'happy' || e.mood === 'excited').length;
      if (recentPositive >= 4 && !achievements.find(a => a.id === 'positive_streak')) {
        newAchievements.push({
          id: 'positive_streak',
          title: 'Sunshine Streak',
          description: '4 out of 5 recent moods were positive',
          icon: '☀️',
          unlockedAt: new Date(),
          category: 'mood',
          rarity: 'rare'
        });
      }
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

  // Initialize with sample data for better demo experience
  initializeSampleData(): void {
    const existingMoods = this.getMoodEntries();
    const existingStats = this.getPlantStats();
    
    // Only add sample data if it's a fresh install
    if (existingMoods.length === 0) {
      const sampleMoods: MoodEntry[] = [
        {
          id: '1',
          mood: 'happy',
          intensity: 8,
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
          notes: 'Had a great day with friends',
          triggers: ['Social connection', 'Good news']
        },
        {
          id: '2',
          mood: 'content',
          intensity: 6,
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          notes: 'Feeling peaceful after meditation',
          triggers: ['Exercise']
        },
        {
          id: '3',
          mood: 'excited',
          intensity: 9,
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          notes: 'Got accepted into the program I wanted!',
          triggers: ['Achievement', 'Good news']
        },
        {
          id: '4',
          mood: 'neutral',
          intensity: 5,
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          notes: 'Regular day, nothing special',
          triggers: ['Work/Study stress']
        },
        {
          id: '5',
          mood: 'sad',
          intensity: 4,
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          notes: 'Feeling overwhelmed with studies',
          triggers: ['Work/Study stress', 'Sleep problems']
        },
        {
          id: '6',
          mood: 'happy',
          intensity: 7,
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          notes: 'Family time was wonderful',
          triggers: ['Social connection', 'Family concerns']
        }
      ];

      sampleMoods.forEach(mood => this.saveMoodEntry(mood));
    }

    // Add some experience and level to the plant for demo
    if (existingStats.totalConversations === 0) {
      const enhancedStats = {
        ...existingStats,
        level: 3,
        experience: 45,
        totalConversations: 12,
        streakDays: 4
      };
      this.savePlantStats(enhancedStats);
    }
  }

  // User preferences management
  getUserPreferences(): UserPreferences {
    const data = localStorage.getItem(this.KEYS.USER_PREFERENCES);
    if (!data) {
      const defaultPrefs: UserPreferences = {
        theme: 'auto',
        notifications: true,
        reminderTime: '20:00'
      };
      this.saveUserPreferences(defaultPrefs);
      return defaultPrefs;
    }
    return JSON.parse(data);
  }

  saveUserPreferences(preferences: UserPreferences): void {
    localStorage.setItem(this.KEYS.USER_PREFERENCES, JSON.stringify(preferences));
  }

  // Enhanced mood entry with context
  saveMoodEntryWithContext(entry: Omit<MoodEntry, 'id' | 'timestamp' | 'context'>): void {
    const currentHour = new Date().getHours();
    const timeOfDay = currentHour < 6 ? 'night' : 
                     currentHour < 12 ? 'morning' : 
                     currentHour < 18 ? 'afternoon' : 'evening';

    const enhancedEntry: MoodEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date(),
      context: {
        timeOfDay,
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' })
      }
    };

    this.saveMoodEntry(enhancedEntry);
  }

  // Analytics and insights
  getMoodAnalytics() {
    const entries = this.getMoodEntries();
    if (entries.length === 0) return null;

    const moodCounts = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageIntensity = entries.reduce((sum, entry) => sum + entry.intensity, 0) / entries.length;

    const weeklyData = this.getWeeklyMoodTrend();
    
    return {
      totalEntries: entries.length,
      moodDistribution: moodCounts,
      averageIntensity: Math.round(averageIntensity * 10) / 10,
      weeklyTrend: weeklyData,
      mostCommonMood: Object.entries(moodCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral'
    };
  }

  private getWeeklyMoodTrend() {
    const entries = this.getMoodEntries();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentEntries = entries.filter(entry => entry.timestamp >= weekAgo);
    const dailyMoods: Record<string, number[]> = {};

    // Group by day
    recentEntries.forEach(entry => {
      const day = entry.timestamp.toDateString();
      if (!dailyMoods[day]) dailyMoods[day] = [];
      dailyMoods[day].push(this.moodToNumber(entry.mood));
    });

    // Calculate daily averages
    return Object.entries(dailyMoods).map(([date, moods]) => ({
      date,
      averageMood: moods.reduce((a, b) => a + b, 0) / moods.length,
      entryCount: moods.length
    }));
  }

  private moodToNumber(mood: string): number {
    const moodValues = { sad: 1, neutral: 2, content: 3, happy: 4, excited: 5 };
    return moodValues[mood as keyof typeof moodValues] || 2;
  }

  // Data backup and sync (for future cloud integration)
  exportUserData() {
    return {
      moodEntries: this.getMoodEntries(),
      achievements: this.getAchievements(),
      plantStats: this.getPlantStats(),
      userPreferences: this.getUserPreferences(),
      exportDate: new Date().toISOString()
    };
  }

  importUserData(data: any) {
    try {
      if (data.moodEntries) {
        localStorage.setItem(this.KEYS.MOOD_ENTRIES, JSON.stringify(data.moodEntries));
      }
      if (data.achievements) {
        localStorage.setItem(this.KEYS.ACHIEVEMENTS, JSON.stringify(data.achievements));
      }
      if (data.plantStats) {
        localStorage.setItem(this.KEYS.PLANT_STATS, JSON.stringify(data.plantStats));
      }
      if (data.userPreferences) {
        localStorage.setItem(this.KEYS.USER_PREFERENCES, JSON.stringify(data.userPreferences));
      }
      return true;
    } catch (error) {
      console.error('Error importing user data:', error);
      return false;
    }
  }

  // Clear all data (for reset functionality)
  clearAllData(): void {
    Object.values(this.KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export const storageService = new StorageService();
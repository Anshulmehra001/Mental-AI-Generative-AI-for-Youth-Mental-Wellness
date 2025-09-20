import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Database types
export interface DbUser {
  id: string;
  email?: string;
  username?: string;
  created_at: string;
  updated_at: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    reminder_time?: string;
    crisis_contact_name?: string;
    crisis_contact_number?: string;
    preferred_name?: string;
  };
}

export interface DbMoodEntry {
  id: string;
  user_id: string;
  mood: 'happy' | 'content' | 'neutral' | 'sad' | 'excited';
  intensity: number;
  notes?: string;
  triggers?: string[];
  weather_data?: {
    temperature: number;
    condition: string;
    humidity: number;
    city: string;
  };
  created_at: string;
}

export interface DbAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  title: string;
  description: string;
  icon: string;
  category: 'conversation' | 'mood' | 'streak' | 'growth';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked_at: string;
}

export interface DbPlantStats {
  id: string;
  user_id: string;
  level: number;
  experience: number;
  total_conversations: number;
  streak_days: number;
  longest_streak: number;
  total_mood_entries: number;
  average_mood: number;
  plant_type: string;
  last_interaction: string;
  birth_date: string;
  updated_at: string;
}

export interface DbChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  sentiment?: 'positive' | 'negative' | 'neutral' | 'crisis';
  created_at: string;
}

class DatabaseService {
  private supabase: SupabaseClient | null = null;
  private userId: string;
  private isConfigured: boolean = false;

  constructor() {
    this.userId = this.getOrCreateUserId();
    this.initializeSupabase();
  }

  private initializeSupabase() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

    const isValidUrl = (url?: string) => {
      if (!url) return false;
      try {
        const u = new URL(url);
        return u.protocol === 'http:' || u.protocol === 'https:';
      } catch {
        return false;
      }
    };

    if (isValidUrl(supabaseUrl) && typeof supabaseKey === 'string' && supabaseKey.trim().length > 0) {
      try {
        this.supabase = createClient(supabaseUrl!, supabaseKey);
        this.isConfigured = true;
        console.log('✅ Supabase initialized successfully');
        return;
      } catch (err) {
        console.warn('⚠️ Supabase client creation failed, falling back to localStorage:', err);
      }
    } else {
      console.warn('⚠️ Supabase not configured or invalid. Using localStorage fallback.');
    }
    this.isConfigured = false;
  }

  private getOrCreateUserId(): string {
    let userId = localStorage.getItem('plantpal_user_id');
    if (!userId) {
      userId = uuidv4();
      localStorage.setItem('plantpal_user_id', userId);
    }
    return userId;
  }

  // User management
  async getOrCreateUser(): Promise<DbUser> {
    if (!this.isConfigured) return this.getFallbackUser();

    try {
      const { data: existingUser } = await this.supabase!
        .from('users')
        .select('*')
        .eq('id', this.userId)
        .single();

      if (existingUser) {
        return existingUser;
      }

      // Create new user
      const newUser: Omit<DbUser, 'created_at' | 'updated_at'> = {
        id: this.userId,
        preferences: {
          theme: 'auto',
          notifications: true
        }
      };

      const { data, error } = await this.supabase!
        .from('users')
        .insert(newUser)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      return this.getFallbackUser();
    }
  }

  private getFallbackUser(): DbUser {
    return {
      id: this.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      preferences: {
        theme: 'auto',
        notifications: true
      }
    };
  }

  // Mood entries
  async saveMoodEntry(moodEntry: Omit<DbMoodEntry, 'id' | 'user_id' | 'created_at'>): Promise<DbMoodEntry> {
    const entry: Omit<DbMoodEntry, 'created_at'> = {
      id: uuidv4(),
      user_id: this.userId,
      ...moodEntry
    };

    if (!this.isConfigured) {
      const fallbackEntry: DbMoodEntry = {
        ...entry,
        created_at: new Date().toISOString()
      };
      
      // Save to localStorage as fallback
      const entries = this.getMoodEntriesFromStorage();
      entries.push(fallbackEntry);
      localStorage.setItem('plantpal_mood_entries_db', JSON.stringify(entries));
      return fallbackEntry;
    }

    try {
      const { data, error } = await this.supabase!
        .from('mood_entries')
        .insert(entry)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving mood entry:', error);
      // Fallback to localStorage
      const fallbackEntry: DbMoodEntry = {
        ...entry,
        created_at: new Date().toISOString()
      };
      const entries = this.getMoodEntriesFromStorage();
      entries.push(fallbackEntry);
      localStorage.setItem('plantpal_mood_entries_db', JSON.stringify(entries));
      return fallbackEntry;
    }
  }

  async getMoodEntries(limit: number = 100): Promise<DbMoodEntry[]> {
    if (!this.isConfigured) {
      return this.getMoodEntriesFromStorage();
    }

    try {
      const { data, error } = await this.supabase!
        .from('mood_entries')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching mood entries:', error);
      return this.getMoodEntriesFromStorage();
    }
  }

  private getMoodEntriesFromStorage(): DbMoodEntry[] {
    const data = localStorage.getItem('plantpal_mood_entries_db');
    return data ? JSON.parse(data) : [];
  }

  // Plant stats
  async getPlantStats(): Promise<DbPlantStats> {
    if (!this.isConfigured) {
      return this.getPlantStatsFromStorage();
    }

    try {
      const { data } = await this.supabase!
        .from('plant_stats')
        .select('*')
        .eq('user_id', this.userId)
        .single();

      if (data) {
        return data;
      }

      // Create default stats
      return this.createDefaultPlantStats();
    } catch (error) {
      console.error('Error fetching plant stats:', error);
      return this.getPlantStatsFromStorage();
    }
  }

  async updatePlantStats(updates: Partial<Omit<DbPlantStats, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<DbPlantStats> {
    const currentStats = await this.getPlantStats();

    // Merge updates
    let updatedStats: DbPlantStats = { ...currentStats, ...updates, updated_at: new Date().toISOString() } as DbPlantStats;

    // Apply level-up logic based on experience like local storage service
    // Required experience increases linearly with level (level * 100)
    const requiredExp = updatedStats.level * 100;
    if (typeof updatedStats.experience === 'number' && updatedStats.experience >= requiredExp) {
      updatedStats = {
        ...updatedStats,
        level: updatedStats.level + 1,
        experience: 0,
        plant_type: this.getPlantTypeByLevel(updatedStats.level + 1)
      };
    }

    if (!this.isConfigured) {
      localStorage.setItem('plantpal_plant_stats_db', JSON.stringify(updatedStats));
      return updatedStats;
    }

    try {
      const { data, error } = await this.supabase!
        .from('plant_stats')
        .upsert(updatedStats)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating plant stats:', error);
      localStorage.setItem('plantpal_plant_stats_db', JSON.stringify(updatedStats));
      return updatedStats;
    }
  }

  private getPlantTypeByLevel(level: number): string {
    if (level <= 3) return 'seedling';
    if (level <= 7) return 'sprout';
    if (level <= 12) return 'sapling';
    if (level <= 20) return 'tree';
    return 'ancient_tree';
  }

  private async createDefaultPlantStats(): Promise<DbPlantStats> {
    const defaultStats: Omit<DbPlantStats, 'created_at' | 'updated_at'> = {
      id: uuidv4(),
      user_id: this.userId,
      level: 1,
      experience: 0,
      total_conversations: 0,
      streak_days: 0,
      longest_streak: 0,
      total_mood_entries: 0,
      average_mood: 2.5,
      plant_type: 'seedling',
      last_interaction: new Date().toISOString(),
      birth_date: new Date().toISOString()
    };

    if (!this.isConfigured) {
      const statsWithTimestamps: DbPlantStats = {
        ...defaultStats,
        updated_at: new Date().toISOString()
      };
      localStorage.setItem('plantpal_plant_stats_db', JSON.stringify(statsWithTimestamps));
      return statsWithTimestamps;
    }

    try {
      const { data, error } = await this.supabase!
        .from('plant_stats')
        .insert(defaultStats)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating plant stats:', error);
      const statsWithTimestamps: DbPlantStats = {
        ...defaultStats,
        updated_at: new Date().toISOString()
      };
      localStorage.setItem('plantpal_plant_stats_db', JSON.stringify(statsWithTimestamps));
      return statsWithTimestamps;
    }
  }

  private getPlantStatsFromStorage(): DbPlantStats {
    const data = localStorage.getItem('plantpal_plant_stats_db');
    if (data) {
      return JSON.parse(data);
    }

    const defaultStats: DbPlantStats = {
      id: uuidv4(),
      user_id: this.userId,
      level: 1,
      experience: 0,
      total_conversations: 0,
      streak_days: 0,
      longest_streak: 0,
      total_mood_entries: 0,
      average_mood: 2.5,
      plant_type: 'seedling',
      last_interaction: new Date().toISOString(),
      birth_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    localStorage.setItem('plantpal_plant_stats_db', JSON.stringify(defaultStats));
    return defaultStats;
  }

  // Achievements
  async getAchievements(): Promise<DbAchievement[]> {
    if (!this.isConfigured) {
      return this.getAchievementsFromStorage();
    }

    try {
      const { data, error } = await this.supabase!
        .from('achievements')
        .select('*')
        .eq('user_id', this.userId)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return this.getAchievementsFromStorage();
    }
  }

  async unlockAchievement(achievement: Omit<DbAchievement, 'id' | 'user_id' | 'unlocked_at'>): Promise<DbAchievement> {
    const newAchievement: Omit<DbAchievement, 'unlocked_at'> = {
      id: uuidv4(),
      user_id: this.userId,
      ...achievement
    };

    if (!this.isConfigured) {
      const achievementWithDate: DbAchievement = {
        ...newAchievement,
        unlocked_at: new Date().toISOString()
      };
      
      const achievements = this.getAchievementsFromStorage();
      achievements.push(achievementWithDate);
      localStorage.setItem('plantpal_achievements_db', JSON.stringify(achievements));
      return achievementWithDate;
    }

    try {
      const { data, error } = await this.supabase!
        .from('achievements')
        .insert(newAchievement)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      const achievementWithDate: DbAchievement = {
        ...newAchievement,
        unlocked_at: new Date().toISOString()
      };
      
      const achievements = this.getAchievementsFromStorage();
      achievements.push(achievementWithDate);
      localStorage.setItem('plantpal_achievements_db', JSON.stringify(achievements));
      return achievementWithDate;
    }
  }

  private getAchievementsFromStorage(): DbAchievement[] {
    const data = localStorage.getItem('plantpal_achievements_db');
    return data ? JSON.parse(data) : [];
  }

  // Chat messages
  async saveChatMessage(message: Omit<DbChatMessage, 'id' | 'user_id' | 'created_at'>): Promise<DbChatMessage> {
    const chatMessage: Omit<DbChatMessage, 'created_at'> = {
      id: uuidv4(),
      user_id: this.userId,
      ...message
    };

    if (!this.isConfigured) {
      const messageWithDate: DbChatMessage = {
        ...chatMessage,
        created_at: new Date().toISOString()
      };
      
      const messages = this.getChatMessagesFromStorage();
      messages.push(messageWithDate);
      localStorage.setItem('plantpal_chat_messages_db', JSON.stringify(messages));
      return messageWithDate;
    }

    try {
      const { data, error } = await this.supabase!
        .from('chat_messages')
        .insert(chatMessage)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving chat message:', error);
      const messageWithDate: DbChatMessage = {
        ...chatMessage,
        created_at: new Date().toISOString()
      };
      
      const messages = this.getChatMessagesFromStorage();
      messages.push(messageWithDate);
      localStorage.setItem('plantpal_chat_messages_db', JSON.stringify(messages));
      return messageWithDate;
    }
  }

  async getChatMessages(limit: number = 50): Promise<DbChatMessage[]> {
    if (!this.isConfigured) {
      return this.getChatMessagesFromStorage();
    }

    try {
      const { data, error } = await this.supabase!
        .from('chat_messages')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return this.getChatMessagesFromStorage();
    }
  }

  private getChatMessagesFromStorage(): DbChatMessage[] {
    const data = localStorage.getItem('plantpal_chat_messages_db');
    return data ? JSON.parse(data) : [];
  }

  // Analytics
  async getMoodAnalytics() {
    const moodEntries = await this.getMoodEntries();
    
    if (moodEntries.length === 0) return null;

    const moodCounts = moodEntries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageIntensity = moodEntries.reduce((sum, entry) => sum + entry.intensity, 0) / moodEntries.length;

    const weeklyData = this.getWeeklyMoodTrend(moodEntries);
    
    return {
      totalEntries: moodEntries.length,
      moodDistribution: moodCounts,
      averageIntensity: Math.round(averageIntensity * 10) / 10,
      weeklyTrend: weeklyData,
      mostCommonMood: Object.entries(moodCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral'
    };
  }

  private getWeeklyMoodTrend(entries: DbMoodEntry[]) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentEntries = entries.filter(entry => new Date(entry.created_at) >= weekAgo);
    const dailyMoods: Record<string, number[]> = {};

    recentEntries.forEach(entry => {
      const day = new Date(entry.created_at).toDateString();
      if (!dailyMoods[day]) dailyMoods[day] = [];
      dailyMoods[day].push(this.moodToNumber(entry.mood));
    });

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

  // Check if database is configured
  isDbConfigured(): boolean {
    return this.isConfigured;
  }

  // Initialize sample data for new users
  async initializeSampleData() {
    const user = await this.getOrCreateUser();
    const existingMoods = await this.getMoodEntries(1);
    
    if (existingMoods.length === 0) {
      // Add sample mood entries
      const sampleMoods = [
        { mood: 'happy' as const, intensity: 8, notes: 'Great day at work!' },
        { mood: 'content' as const, intensity: 6, notes: 'Peaceful evening' },
        { mood: 'excited' as const, intensity: 9, notes: 'Got great news!' },
        { mood: 'neutral' as const, intensity: 5, notes: 'Regular day' },
        { mood: 'content' as const, intensity: 7, notes: 'Good workout session' }
      ];

      for (const mood of sampleMoods) {
        await this.saveMoodEntry(mood);
      }

      // Update plant stats
      await this.updatePlantStats({
        level: 3,
        experience: 45,
        total_conversations: 12,
        streak_days: 4,
        total_mood_entries: 5
      });
    }
  }
}

export const databaseService = new DatabaseService();
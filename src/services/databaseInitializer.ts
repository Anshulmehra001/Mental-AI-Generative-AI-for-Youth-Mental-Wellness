import { databaseService } from './databaseService';

export class DatabaseInitializer {
  
  /**
   * Initialize the database with sample data for new users
   */
  static async initializeSampleData() {
    try {
      // Create or get user
      const user = await databaseService.getOrCreateUser();
      
      // Check if user already has data
      const existingMoods = await databaseService.getMoodEntries(1);
      const existingAchievements = await databaseService.getAchievements();
      
      if (existingMoods.length === 0 && existingAchievements.length === 0) {
        console.log('Initializing sample data for new user...');
        
        // Add sample mood entries
        const sampleMoods = [
          { 
            mood: 'happy' as const, 
            intensity: 8, 
            notes: 'Great day at work! Feeling accomplished.' 
          },
          { 
            mood: 'content' as const, 
            intensity: 6, 
            notes: 'Peaceful evening with a good book.' 
          },
          { 
            mood: 'excited' as const, 
            intensity: 9, 
            notes: 'Got great news from family!' 
          },
          { 
            mood: 'neutral' as const, 
            intensity: 5, 
            notes: 'Regular day, nothing special.' 
          }
        ];

        for (const mood of sampleMoods) {
          await databaseService.saveMoodEntry(mood);
        }

        // Add sample achievements
        const sampleAchievements = [
          {
            achievement_id: 'first_chat',
            title: 'First Words',
            description: 'Started your first conversation with PlantPal',
            icon: '🌱',
            category: 'conversation' as const,
            rarity: 'common' as const
          },
          {
            achievement_id: 'mood_tracker',
            title: 'Self-Aware Sprout',
            description: 'Logged your first mood entry',
            icon: '😊',
            category: 'mood' as const,
            rarity: 'common' as const
          }
        ];

        for (const achievement of sampleAchievements) {
          await databaseService.unlockAchievement(achievement);
        }

        // Update plant stats
        await databaseService.updatePlantStats({
          level: 2,
          experience: 25,
          total_conversations: 3,
          streak_days: 2,
          total_mood_entries: 4,
          average_mood: 6.5
        });

        console.log('✅ Sample data initialized successfully');
        return true;
      } else {
        console.log('ℹ️ User already has data, skipping sample data initialization');
        return false;
      }
    } catch (error) {
      console.error('❌ Error initializing sample data:', error);
      return false;
    }
  }

  /**
   * Migrate data from localStorage to database
   */
  static async migrateFromLocalStorage() {
    try {
      // Check if localStorage has data
      const localMoods = localStorage.getItem('mental_ai_mood_entries');
      const localStats = localStorage.getItem('mental_ai_plant_stats');
      const localAchievements = localStorage.getItem('mental_ai_achievements');

      if (!localMoods && !localStats && !localAchievements) {
        console.log('ℹ️ No localStorage data found to migrate');
        return false;
      }

      console.log('🔄 Starting migration from localStorage...');

      // Migrate mood entries
      if (localMoods) {
        const moods = JSON.parse(localMoods);
        for (const mood of moods) {
          await databaseService.saveMoodEntry({
            mood: mood.mood,
            intensity: mood.intensity,
            notes: mood.notes,
            triggers: mood.triggers
          });
        }
        console.log(`✅ Migrated ${moods.length} mood entries`);
      }

      // Migrate plant stats
      if (localStats) {
        const stats = JSON.parse(localStats);
        await databaseService.updatePlantStats({
          level: stats.level || 1,
          experience: stats.experience || 0,
          total_conversations: stats.totalConversations || 0,
          streak_days: stats.streakDays || 0,
          total_mood_entries: stats.totalMoodEntries || 0
        });
        console.log('✅ Migrated plant stats');
      }

      // Migrate achievements
      if (localAchievements) {
        const achievements = JSON.parse(localAchievements);
        for (const achievement of achievements) {
          await databaseService.unlockAchievement({
            achievement_id: achievement.id,
            title: achievement.title,
            description: achievement.description,
            icon: achievement.icon,
            category: achievement.category,
            rarity: achievement.rarity || 'common'
          });
        }
        console.log(`✅ Migrated ${achievements.length} achievements`);
      }

      // Backup localStorage data
      const backupData = {
        moods: localMoods ? JSON.parse(localMoods) : [],
        stats: localStats ? JSON.parse(localStats) : {},
        achievements: localAchievements ? JSON.parse(localAchievements) : [],
        migrationDate: new Date().toISOString()
      };

      localStorage.setItem('mental_ai_migration_backup', JSON.stringify(backupData));
      console.log('✅ Created backup of localStorage data');

      return true;
    } catch (error) {
      console.error('❌ Error migrating from localStorage:', error);
      return false;
    }
  }

  /**
   * Check database connectivity
   */
  static async checkDatabaseConnection() {
    try {
      if (!databaseService.isDbConfigured()) {
        console.log('⚠️ Database not configured - using localStorage fallback');
        return false;
      }

      // Try to fetch user data to test connection
      await databaseService.getOrCreateUser();
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }

  /**
   * Full initialization process
   */
  static async initialize() {
    console.log('🚀 Starting PlantPal database initialization...');
    
    const isConnected = await this.checkDatabaseConnection();
    
    const enableSamples = import.meta.env.VITE_ENABLE_SAMPLE_DATA === 'true';

    if (isConnected) {
      // Try to migrate existing localStorage data first
      await this.migrateFromLocalStorage();
      
      // Then initialize sample data if explicitly enabled
      if (enableSamples) {
        await this.initializeSampleData();
      }
    } else {
      console.log('📝 Running in localStorage mode');
      // Initialize sample data in localStorage if explicitly enabled
      if (enableSamples && !localStorage.getItem('mental_ai_mood_entries')) {
        await this.initializeSampleData();
      }
    }
    
    console.log('✅ Database initialization complete');
  }
}

// Export a convenient initialization function
export const initializeDatabase = () => DatabaseInitializer.initialize();

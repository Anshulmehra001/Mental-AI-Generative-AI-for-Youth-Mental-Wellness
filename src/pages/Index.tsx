import { useState, useEffect } from 'react';
import PlantCompanion from '@/components/PlantCompanion';
import ChatInterface from '@/components/ChatInterface';
import AchievementSystem from '@/components/AchievementSystem';
import MoodTracker from '@/components/MoodTracker';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import WellnessTips from '@/components/WellnessTips';
import DailyCheck from '@/components/DailyCheck';
import MotivationalQuotes from '@/components/MotivationalQuotes';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Leaf, BarChart3 } from 'lucide-react';
import { initializeDatabase } from '@/services/databaseInitializer';

type PlantMood = 'happy' | 'content' | 'neutral' | 'sad' | 'excited';

const Index = () => {
  const [plantMood, setPlantMood] = useState<PlantMood>('content');
  const [plantInteraction, setPlantInteraction] = useState<string>('');

  // Initialize database on component mount
  useEffect(() => {
    initializeDatabase();
  }, []);

  const handlePlantInteraction = (interaction: string) => {
    setPlantInteraction(interaction);
  };

  const handleSentimentChange = (sentiment: PlantMood) => {
    setPlantMood(sentiment);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-900/20 dark:via-blue-900/20 dark:to-purple-900/20 flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <header className="flex-shrink-0 px-4 sm:px-6 py-2 sm:py-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent mb-1 drop-shadow-sm">
            🧠 Mental AI - Your Wellness Companion
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium">
            Generative AI for Youth Mental Wellness - Confidential • Empathetic • Stigma-Free
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-2 sm:py-3 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
            <TabsTrigger value="chat" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 transition-all duration-200 hover:bg-green-100 dark:hover:bg-green-900/30">
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="garden" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 transition-all duration-200 hover:bg-green-100 dark:hover:bg-green-900/30">
              <Leaf className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Garden</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 transition-all duration-200 hover:bg-green-100 dark:hover:bg-green-900/30">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
          </TabsList>

          {/* Main Content Area - Scrollable */}
          <div className="flex-1 mt-2 sm:mt-4">
            <TabsContent value="chat" className="mt-0">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 h-[calc(100vh-140px)] sm:h-[calc(100vh-150px)]">
                {/* Plant Section - Enhanced Mobile Layout */}
                <div className="flex flex-col bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden shadow-xl">
                  <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-green-300/50 scrollbar-track-transparent">
                    <div className="p-3 sm:p-4">
                      <PlantCompanion 
                        mood={plantMood} 
                        onInteraction={handlePlantInteraction}
                      />
                    </div>
                  </div>
                </div>

                {/* Chat Section - Enhanced Mobile Layout */}
                <div className="flex flex-col bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden shadow-xl">
                  <ChatInterface 
                    onSentimentChange={handleSentimentChange}
                    plantInteraction={plantInteraction}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="garden" className="mt-0">
              <div className="h-[calc(100vh-140px)] sm:h-[calc(100vh-150px)] overflow-y-auto scrollbar-thin scrollbar-thumb-green-300/50 scrollbar-track-transparent">
                <div className="max-w-6xl mx-auto p-3 sm:p-6 space-y-6 sm:space-y-8">
                  {/* Mood Tracker - Full Width Priority */}
                  <div className="w-full">
                    <MoodTracker onMoodLogged={handleSentimentChange} />
                  </div>
                  
                  {/* Achievements - Full Width with Better Spacing */}
                  <div className="w-full">
                    <AchievementSystem />
                  </div>
                  
                  {/* Wellness & Daily Check - Side by Side */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    <WellnessTips />
                    <DailyCheck />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="mt-0">
              <div className="h-[calc(100vh-140px)] sm:h-[calc(100vh-150px)] overflow-y-auto scrollbar-thin scrollbar-thumb-green-300/50 scrollbar-track-transparent">
                <div className="max-w-6xl mx-auto p-3 sm:p-6 space-y-6 sm:space-y-8">
                  {/* Motivational Quotes - Top Priority */}
                  <div className="w-full">
                    <MotivationalQuotes />
                  </div>
                  
                  {/* Analytics Dashboard - Full Width */}
                  <div className="w-full">
                    <AnalyticsDashboard />
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;

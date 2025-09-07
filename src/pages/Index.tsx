import { useState } from 'react';
import PlantCompanion from '@/components/PlantCompanion';
import ChatInterface from '@/components/ChatInterface';
import AchievementSystem from '@/components/AchievementSystem';
import MoodTracker from '@/components/MoodTracker';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Leaf, BarChart3 } from 'lucide-react';

type PlantMood = 'happy' | 'content' | 'neutral' | 'sad' | 'excited';

const Index = () => {
  const [plantMood, setPlantMood] = useState<PlantMood>('content');
  const [plantInteraction, setPlantInteraction] = useState<string>('');

  const handlePlantInteraction = (interaction: string) => {
    setPlantInteraction(interaction);
  };

  const handleSentimentChange = (sentiment: PlantMood) => {
    setPlantMood(sentiment);
  };

  return (
    <div className="h-screen bg-gradient-nature flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <header className="flex-shrink-0 px-6 py-4 bg-card/30 backdrop-blur-sm border-b border-border/50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-1">
            🌱 PlantPal - Your AI Companion
          </h1>
          <p className="text-sm text-muted-foreground">
            An AI mental health companion that grows with your emotions
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex-shrink-0 px-6 py-3 bg-background/50">
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="chat" className="flex items-center gap-2 text-xs">
              <MessageCircle className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="garden" className="flex items-center gap-2 text-xs">
              <Leaf className="w-4 h-4" />
              Garden
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2 text-xs">
              <BarChart3 className="w-4 h-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Main Content Area - Scrollable */}
          <div className="flex-1 mt-4">
            <TabsContent value="chat" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-140px)]">
                {/* Plant Section - Independent Scroll */}
                <div className="flex flex-col bg-card/20 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden">
                  <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                    <div className="p-4">
                      <PlantCompanion 
                        mood={plantMood} 
                        onInteraction={handlePlantInteraction}
                      />
                    </div>
                  </div>
                </div>

                {/* Chat Section - Independent Scroll */}
                <div className="flex flex-col bg-card/20 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden">
                  <ChatInterface 
                    onSentimentChange={handleSentimentChange}
                    plantInteraction={plantInteraction}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="garden" className="mt-0">
              <div className="h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                <div className="grid lg:grid-cols-2 gap-6 p-2">
                  <AchievementSystem />
                  <MoodTracker onMoodLogged={handleSentimentChange} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="mt-0">
              <div className="h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                <div className="p-2">
                  <AnalyticsDashboard />
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

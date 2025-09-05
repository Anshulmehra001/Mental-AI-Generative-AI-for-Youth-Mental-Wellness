import { useState } from 'react';
import PlantCompanion from '@/components/PlantCompanion';
import ChatInterface from '@/components/ChatInterface';
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
    <div className="min-h-screen bg-gradient-nature">
      <main className="container mx-auto p-4 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            🌱 PlantPal - Your AI Companion
          </h1>
          <p className="text-muted-foreground">
            An AI mental health companion that grows with your emotions
          </p>
        </div>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="garden" className="flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              Garden
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
              <PlantCompanion 
                mood={plantMood} 
                onInteraction={handlePlantInteraction}
              />
              <ChatInterface 
                onSentimentChange={handleSentimentChange}
                plantInteraction={plantInteraction}
              />
            </div>
          </TabsContent>

          <TabsContent value="garden">
            <Card className="p-8 text-center bg-card/50 backdrop-blur-sm">
              <Leaf className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-semibold mb-2">Your Garden</h3>
              <p className="text-muted-foreground">
                Coming soon: View all your plant companions and achievements!
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <Card className="p-8 text-center bg-card/50 backdrop-blur-sm">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-semibold mb-2">Mood Analytics</h3>
              <p className="text-muted-foreground">
                Coming soon: Track your emotional journey and growth patterns!
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;

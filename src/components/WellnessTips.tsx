import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, RefreshCw, Clock, Heart } from 'lucide-react';

interface WellnessTip {
  id: string;
  title: string;
  description: string;
  category: 'breathing' | 'mindfulness' | 'physical' | 'social' | 'creative';
  duration: string;
  difficulty: 'easy' | 'medium' | 'advanced';
}

const WellnessTips = () => {
  const [currentTip, setCurrentTip] = useState<WellnessTip | null>(null);
  const [tipHistory, setTipHistory] = useState<string[]>([]);

  const wellnessTips: WellnessTip[] = [
    {
      id: '1',
      title: 'Box Breathing',
      description: 'Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat 5 times to calm your nervous system.',
      category: 'breathing',
      duration: '2-3 minutes',
      difficulty: 'easy'
    },
    {
      id: '2',
      title: '5-4-3-2-1 Grounding',
      description: 'Notice 5 things you see, 4 things you touch, 3 things you hear, 2 things you smell, 1 thing you taste.',
      category: 'mindfulness',
      duration: '3-5 minutes',
      difficulty: 'easy'
    },
    {
      id: '3',
      title: 'Gratitude Journaling',
      description: 'Write down 3 specific things you are grateful for today. Be detailed about why they matter to you.',
      category: 'creative',
      duration: '5-10 minutes',
      difficulty: 'easy'
    },
    {
      id: '4',
      title: 'Progressive Muscle Relaxation',
      description: 'Tense and release each muscle group starting from your toes up to your head.',
      category: 'physical',
      duration: '10-15 minutes',
      difficulty: 'medium'
    },
    {
      id: '5',
      title: 'Loving-Kindness Meditation',
      description: 'Send positive thoughts to yourself, loved ones, neutral people, difficult people, and all beings.',
      category: 'mindfulness',
      duration: '10-20 minutes',
      difficulty: 'medium'
    },
    {
      id: '6',
      title: 'Nature Connection',
      description: 'Spend time outdoors. Touch tree bark, listen to birds, feel the breeze. Connect with natural elements.',
      category: 'physical',
      duration: '15-30 minutes',
      difficulty: 'easy'
    },
    {
      id: '7',
      title: 'Reach Out Challenge',
      description: 'Send a message to someone you care about. Let them know you are thinking of them.',
      category: 'social',
      duration: '5 minutes',
      difficulty: 'easy'
    },
    {
      id: '8',
      title: 'Mindful Art Creation',
      description: 'Draw, doodle, or create something with full attention. Focus on colors, textures, and movements.',
      category: 'creative',
      duration: '15-30 minutes',
      difficulty: 'medium'
    }
  ];

  const getRandomTip = () => {
    const availableTips = wellnessTips.filter(tip => !tipHistory.includes(tip.id));
    if (availableTips.length === 0) {
      setTipHistory([]);
      return wellnessTips[Math.floor(Math.random() * wellnessTips.length)];
    }
    return availableTips[Math.floor(Math.random() * availableTips.length)];
  };

  const handleNewTip = () => {
    const newTip = getRandomTip();
    setCurrentTip(newTip);
    setTipHistory(prev => [...prev, newTip.id].slice(-5)); // Keep last 5 tips
  };

  useEffect(() => {
    handleNewTip();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'breathing': return '🫁';
      case 'mindfulness': return '🧘';
      case 'physical': return '🏃';
      case 'social': return '🤝';
      case 'creative': return '🎨';
      default: return '💡';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'breathing': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'mindfulness': return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
      case 'physical': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'social': return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
      case 'creative': return 'bg-pink-500/20 text-pink-700 border-pink-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!currentTip) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Daily Wellness Tip</h3>
        </div>
        <Button 
          onClick={handleNewTip} 
          variant="ghost" 
          size="sm"
          className="text-primary hover:bg-primary/10"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{getCategoryIcon(currentTip.category)}</span>
          <h4 className="text-xl font-semibold text-foreground">{currentTip.title}</h4>
        </div>

        <p className="text-muted-foreground leading-relaxed">{currentTip.description}</p>

        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className={getCategoryColor(currentTip.category)}>
            {currentTip.category}
          </Badge>
          <Badge variant="outline" className={getDifficultyColor(currentTip.difficulty)}>
            {currentTip.difficulty}
          </Badge>
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            <Clock className="w-3 h-3 mr-1" />
            {currentTip.duration}
          </Badge>
        </div>

        <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            Take a moment for yourself. Your mental health matters! 💚
          </p>
        </div>
      </div>
    </Card>
  );
};

export default WellnessTips;
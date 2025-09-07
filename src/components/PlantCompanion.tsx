import { useState, useEffect } from 'react';
import plantHappy from '@/assets/plant-happy.jpg';
import plantContent from '@/assets/plant-content.jpg';
import plantNeutral from '@/assets/plant-neutral.jpg';
import plantSad from '@/assets/plant-sad.jpg';
import plantExcited from '@/assets/plant-excited.jpg';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Sparkles, Leaf } from 'lucide-react';

type PlantMood = 'happy' | 'content' | 'neutral' | 'sad' | 'excited';

interface PlantCompanionProps {
  mood: PlantMood;
  onInteraction: (interaction: string) => void;
}

const PlantCompanion = ({ mood, onInteraction }: PlantCompanionProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const [showHearts, setShowHearts] = useState(false);

  const plantImages = {
    happy: plantHappy,
    content: plantContent,
    neutral: plantNeutral,
    sad: plantSad,
    excited: plantExcited
  };

  const moodMessages = {
    happy: "I'm blooming with joy! 🌸",
    content: "Feeling peaceful and growing strong! 🌿",
    neutral: "Just here, growing at my own pace 🌱",
    sad: "I could use some encouragement... 💧",
    excited: "I'm bursting with energy! ⚡"
  };

  const moodColors = {
    happy: "plant-happy",
    content: "plant-content", 
    neutral: "plant-neutral",
    sad: "plant-sad",
    excited: "plant-excited"
  };

  const handlePlantClick = () => {
    setIsAnimating(true);
    setInteractionCount(prev => prev + 1);
    setShowHearts(true);
    
    const interactions = [
      "You clicked on me! That makes me happy! 🌟",
      "Thanks for the attention! I feel loved! 💚",
      "Your touch helps me grow stronger! 🌱",
      "I appreciate your care! Keep talking to me! 🌸",
      "Your kindness makes me bloom! 🌺"
    ];
    
    const randomInteraction = interactions[Math.floor(Math.random() * interactions.length)];
    onInteraction(randomInteraction);
    
    setTimeout(() => {
      setIsAnimating(false);
      setShowHearts(false);
    }, 2000);
  };

  const handleLeafClick = () => {
    onInteraction("You touched my leaves! They're growing greener! 🍃");
  };

  const handlePotClick = () => {
    onInteraction("Thanks for checking my roots! I feel stable and secure! 🏺");
  };

  useEffect(() => {
    // Auto-sway animation every few seconds
    const interval = setInterval(() => {
      if (!isAnimating) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isAnimating]);

  return (
    <div className="relative flex flex-col items-center h-full">
      {/* Mood Badge */}
      <Badge 
        variant="secondary" 
        className={`mb-6 text-xs font-medium bg-${moodColors[mood]}/20 text-${moodColors[mood]} border-${moodColors[mood]}/30 animate-fade-in`}
      >
        {moodMessages[mood]}
      </Badge>

      {/* Plant Container */}
      <div className="relative group">
        {/* Flying Hearts Animation */}
        {showHearts && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <Heart
                key={i}
                className={`absolute w-4 h-4 text-red-500 animate-bounce`}
                style={{
                  left: `${30 + i * 20}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        )}

        {/* Main Plant Image */}
        <div 
          className={`cursor-pointer transition-all duration-300 ${
            isAnimating ? 'plant-grow' : ''
          } ${mood === 'excited' ? 'mood-glow' : ''} hover:scale-105`}
          onClick={handlePlantClick}
        >
          <img
            src={plantImages[mood]}
            alt={`Plant feeling ${mood}`}
            className={`w-64 h-48 object-contain rounded-xl ${
              isAnimating ? 'leaf-sway' : ''
            }`}
          />
        </div>

        {/* Interactive Elements */}
        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleLeafClick}
            className="bg-primary/20 hover:bg-primary/30 text-primary"
          >
            <Leaf className="w-4 h-4 mr-1" />
            Touch Leaves
          </Button>
        </div>

        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={handlePotClick}
            className="bg-primary/20 hover:bg-primary/30 text-primary"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            Check Pot
          </Button>
        </div>

        {/* Growth Level Indicator */}
        <div className="absolute -top-2 -right-2">
          <Badge 
            variant="outline" 
            className="bg-background/80 text-xs"
          >
            Level {Math.floor(interactionCount / 5) + 1}
          </Badge>
        </div>
      </div>

      {/* Plant Stats */}
      <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
        <div className="flex justify-center gap-6 text-sm">
          <div className="flex flex-col items-center gap-1">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="font-medium">{interactionCount}</span>
            <span className="text-xs text-muted-foreground">interactions</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <span className="font-medium">Level {Math.floor(interactionCount / 5) + 1}</span>
            <span className="text-xs text-muted-foreground">growing</span>
          </div>
        </div>
      </div>

      {/* Encouragement Message */}
      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-center text-sm text-muted-foreground leading-relaxed">
          Click on me or chat with me to help me grow! I respond to your emotions and love our conversations! 💚
        </p>
      </div>
    </div>
  );
};

export default PlantCompanion;
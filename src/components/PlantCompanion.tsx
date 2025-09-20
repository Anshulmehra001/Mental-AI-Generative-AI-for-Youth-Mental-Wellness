import { useState, useEffect } from 'react';
import { databaseService, DbPlantStats } from '@/services/databaseService';
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
  const [plantStats, setPlantStats] = useState<DbPlantStats | null>(null);
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

  // Load real plant stats and subscribe to updates from chat
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const stats = await databaseService.getPlantStats();
        if (isMounted) setPlantStats(stats);
      } catch (_) {}
    })();

    const onStatsUpdated = async () => {
      try {
        const stats = await databaseService.getPlantStats();
        setPlantStats(stats);
      } catch (_) {}
    };
    window.addEventListener('plant-stats-updated', onStatsUpdated as EventListener);
    return () => {
      isMounted = false;
      window.removeEventListener('plant-stats-updated', onStatsUpdated as EventListener);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center h-full min-h-[400px] sm:min-h-[500px] justify-center">
      {/* Mood Badge */}
      <Badge 
        variant="secondary" 
        className={`mb-4 sm:mb-6 text-xs sm:text-sm font-medium px-3 py-1 rounded-full shadow-lg backdrop-blur-sm border-2 transition-all duration-300 ${
          mood === 'happy' ? 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300' :
          mood === 'excited' ? 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300' :
          mood === 'content' ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300' :
          mood === 'neutral' ? 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300' :
          'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300'
        } animate-pulse`}
      >
        {moodMessages[mood]}
      </Badge>

      {/* Plant Container */}
      <div className="relative group mb-4 sm:mb-6">
        {/* Floating particles effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 bg-green-400 rounded-full animate-ping opacity-40`}
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Flying Hearts Animation */}
        {showHearts && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {[...Array(5)].map((_, i) => (
              <Heart
                key={i}
                className={`absolute w-4 h-4 sm:w-5 sm:h-5 text-red-500 animate-bounce`}
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${10 + i * 10}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
        )}

        {/* Main Plant Image */}
        <div 
          className={`cursor-pointer transition-all duration-500 transform hover:scale-105 active:scale-95 ${
            isAnimating ? 'animate-bounce scale-110' : 'hover:scale-105'
          } group-hover:drop-shadow-2xl`}
          onClick={handlePlantClick}
        >
          <img
            src={plantImages[mood]}
            alt={`Plant feeling ${mood}`}
            className={`w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 object-cover rounded-full border-4 shadow-2xl transition-all duration-500 ${
              mood === 'happy' ? 'border-yellow-300 shadow-yellow-500/50' :
              mood === 'excited' ? 'border-orange-300 shadow-orange-500/50' :
              mood === 'content' ? 'border-green-300 shadow-green-500/50' :
              mood === 'neutral' ? 'border-gray-300 shadow-gray-500/50' :
              'border-blue-300 shadow-blue-500/50'
            } ${isAnimating ? 'ring-4 ring-offset-4 ring-green-400' : ''}`}
          />
          
          {/* Glow effect overlay */}
          <div className={`absolute inset-0 rounded-full transition-opacity duration-500 ${
            isAnimating ? 'opacity-30' : 'opacity-0 group-hover:opacity-20'
          } ${
            mood === 'happy' ? 'bg-yellow-400' :
            mood === 'excited' ? 'bg-orange-400' :
            mood === 'content' ? 'bg-green-400' :
            mood === 'neutral' ? 'bg-gray-400' :
            'bg-blue-400'
          } blur-xl`} />
        </div>

        {/* Interactive Elements */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleLeafClick}
            className="bg-green-200/70 hover:bg-green-300/70 text-green-800 text-xs sm:text-sm backdrop-blur-sm border border-green-300/50 shadow-lg"
          >
            <Leaf className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">Touch Leaves</span>
          </Button>
        </div>

        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="sm"
            variant="ghost"
            onClick={handlePotClick}
            className="bg-amber-200/70 hover:bg-amber-300/70 text-amber-800 text-xs sm:text-sm backdrop-blur-sm border border-amber-300/50 shadow-lg"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">Check Roots</span>
          </Button>
        </div>
      </div>

      {/* Plant Stats */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg w-full max-w-sm">
        <div className="flex justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
          <div className="flex flex-col items-center gap-1">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            <span className="text-gray-600 dark:text-gray-300">Interactions</span>
            <span className="font-bold text-gray-800 dark:text-gray-200">{interactionCount}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            <span className="text-gray-600 dark:text-gray-300">Level</span>
            <span className="font-bold text-gray-800 dark:text-gray-200">{plantStats?.level ?? 1}</span>
          </div>
        </div>
      </div>

      {/* Interaction Guide */}
      <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-green-100/70 dark:bg-green-900/30 rounded-lg border border-green-300/50 backdrop-blur-sm">
        <p className="text-xs sm:text-sm text-green-800 dark:text-green-300 text-center font-medium">
          Click on me or chat with me to help me grow! 🌱
        </p>
      </div>
    </div>
  );
};

export default PlantCompanion;
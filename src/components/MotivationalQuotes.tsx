import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Quote, RefreshCw, Heart } from 'lucide-react';

interface MotivationalQuote {
  id: string;
  text: string;
  author: string;
  category: 'growth' | 'resilience' | 'mindfulness' | 'cultural' | 'success';
}

const MotivationalQuotes = () => {
  const [currentQuote, setCurrentQuote] = useState<MotivationalQuote | null>(null);
  const [quoteHistory, setQuoteHistory] = useState<string[]>([]);

  const quotes: MotivationalQuote[] = [
    {
      id: '1',
      text: 'The bamboo that bends is stronger than the oak that resists.',
      author: 'Japanese Proverb',
      category: 'resilience'
    },
    {
      id: '2',
      text: 'A single arrow is easily broken, but not ten in a bundle.',
      author: 'Sanskrit Saying',
      category: 'cultural'
    },
    {
      id: '3',
      text: 'Sab kuch theek ho jayega - Everything will be alright.',
      author: 'Indian Wisdom',
      category: 'cultural'
    },
    {
      id: '4',
      text: 'The mind is everything. What you think you become.',
      author: 'Buddha',
      category: 'mindfulness'
    },
    {
      id: '5',
      text: 'Fall seven times, rise eight.',
      author: 'Japanese Proverb',
      category: 'resilience'
    },
    {
      id: '6',
      text: 'Yoga is a journey of the self, through the self, to the self.',
      author: 'Bhagavad Gita',
      category: 'cultural'
    },
    {
      id: '7',
      text: 'Your present circumstances don\'t determine where you can go.',
      author: 'Modern Wisdom',
      category: 'growth'
    },
    {
      id: '8',
      text: 'In the middle of difficulty lies opportunity.',
      author: 'Einstein',
      category: 'growth'
    },
    {
      id: '9',
      text: 'Peace comes from within. Do not seek it without.',
      author: 'Buddha',
      category: 'mindfulness'
    },
    {
      id: '10',
      text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
      author: 'Winston Churchill',
      category: 'success'
    }
  ];

  const getRandomQuote = () => {
    const availableQuotes = quotes.filter(quote => !quoteHistory.includes(quote.id));
    if (availableQuotes.length === 0) {
      setQuoteHistory([]);
      return quotes[Math.floor(Math.random() * quotes.length)];
    }
    return availableQuotes[Math.floor(Math.random() * availableQuotes.length)];
  };

  const handleNewQuote = () => {
    const newQuote = getRandomQuote();
    setCurrentQuote(newQuote);
    setQuoteHistory(prev => [...prev, newQuote.id].slice(-5));
  };

  useEffect(() => {
    handleNewQuote();
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'growth': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'resilience': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'mindfulness': return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
      case 'cultural': return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
      case 'success': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  if (!currentQuote) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Quote className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-foreground">Daily Inspiration</h3>
        </div>
        <Button 
          onClick={handleNewQuote} 
          variant="ghost" 
          size="sm"
          className="text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Quote className="absolute -top-2 -left-1 w-8 h-8 text-purple-300 dark:text-purple-600" />
          <blockquote className="text-lg font-medium text-foreground italic pl-6 leading-relaxed">
            "{currentQuote.text}"
          </blockquote>
        </div>

        <div className="flex items-center justify-between">
          <cite className="text-sm text-muted-foreground font-medium">
            — {currentQuote.author}
          </cite>
          <span className={`px-2 py-1 text-xs rounded-full border ${getCategoryColor(currentQuote.category)}`}>
            {currentQuote.category}
          </span>
        </div>

        <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            Let this wisdom guide your day. You are stronger than you know! ✨
          </p>
        </div>
      </div>
    </Card>
  );
};

export default MotivationalQuotes;
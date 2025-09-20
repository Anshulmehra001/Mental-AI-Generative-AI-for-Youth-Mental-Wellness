import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Heart, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService, ChatMessage } from '@/services/aiService';
import { databaseService } from '@/services/databaseService';
import CrisisIntervention from './CrisisIntervention';

interface Message extends ChatMessage {
  id: string;
}

interface ChatInterfaceProps {
  onSentimentChange: (sentiment: 'happy' | 'content' | 'neutral' | 'sad' | 'excited') => void;
  plantInteraction?: string;
}

const ChatInterface = ({ onSentimentChange, plantInteraction }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm Mental AI, your empathetic wellness companion! 🧠 I'm here to provide confidential, stigma-free mental health support specifically designed for Indian youth. How are you feeling today?",
      role: 'assistant',
      timestamp: new Date(),
      sentiment: 'positive'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCrisisIntervention, setShowCrisisIntervention] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Add plant interaction messages
  useEffect(() => {
    if (plantInteraction) {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: plantInteraction,
        role: 'assistant',
        timestamp: new Date(),
        sentiment: 'positive'
      };
      setMessages(prev => [...prev, newMessage]);
    }
  }, [plantInteraction]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simple sentiment analysis
  const analyzeSentiment = (text: string): 'positive' | 'neutral' | 'negative' | 'crisis' => {
    const lowerText = text.toLowerCase();
    
    // Crisis keywords
    const crisisWords = ['suicide', 'kill myself', 'end it all', 'worthless', 'hopeless', 'panic attack', 'can\'t cope'];
    if (crisisWords.some(word => lowerText.includes(word))) {
      return 'crisis';
    }

    // Positive keywords
    const positiveWords = ['happy', 'excited', 'great', 'awesome', 'wonderful', 'amazing', 'love', 'good', 'excellent', 'fantastic'];
    const negativeWords = ['sad', 'depressed', 'anxious', 'worried', 'stressed', 'angry', 'upset', 'terrible', 'awful', 'bad'];
    
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  };

  // Convert sentiment to plant mood
  const sentimentToMood = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return Math.random() > 0.5 ? 'happy' : 'excited';
      case 'negative': return 'sad';
      case 'crisis': return 'sad';
      default: return Math.random() > 0.5 ? 'neutral' : 'content';
    }
  };

  // AI Response Generator (simulated)
  const generateResponse = (userMessage: string, sentiment: string): string => {
    if (sentiment === 'crisis') {
      return "I'm really concerned about you. Please know that you're not alone and your life has value. Consider reaching out to a crisis helpline: National Suicide Prevention Lifeline: 988. Let's talk about what's making you feel this way. 🫂";
    }

    const responses = {
      positive: [
        "That's wonderful! I can feel your positive energy helping me grow! 🌟 Tell me more about what's making you feel so good!",
        "Your happiness makes my leaves shine brighter! ✨ I'm so glad you're feeling great. What's been the highlight of your day?",
        "I love your enthusiasm! 🌸 It's contagious - I feel myself growing stronger just from your positive vibes!"
      ],
      negative: [
        "I hear you, and I want you to know that your feelings are valid. 🌿 Sometimes we all have tough days. What's been weighing on your mind?",
        "I'm here to listen and support you through this. 💚 Remember, just like how I need both sunshine and rain to grow, difficult times can help us grow stronger too.",
        "Thank you for trusting me with your feelings. 🌱 Let's work through this together. What's one small thing that might help you feel a little better right now?"
      ],
      neutral: [
        "I appreciate you sharing with me! 🌿 Sometimes it's okay to just be. Is there anything specific on your mind today?",
        "Thanks for checking in! 🌱 I'm here whenever you want to chat about anything - big or small. How can I support you today?",
        "I'm growing stronger just from our conversation! 💚 What's something you're curious about or thinking about lately?"
      ]
    };

    const responseArray = responses[sentiment as keyof typeof responses] || responses.neutral;
    return responseArray[Math.floor(Math.random() * responseArray.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date()
    };

    // Analyze sentiment using AI service
    const analysis = await aiService.analyzeSentiment(inputValue);
    userMessage.sentiment = analysis.sentiment;

    setMessages(prev => [...prev, userMessage]);
    
    // Save user message to database
    try {
      await databaseService.saveChatMessage({
        role: 'user',
        content: userMessage.content,
        sentiment: analysis.sentiment
      });
    } catch (error) {
      console.error('Error saving user message:', error);
    }

    setInputValue('');
    setIsTyping(true);
    
    // Check for crisis intervention
    if (analysis.crisisRisk) {
      setShowCrisisIntervention(true);
      setIsTyping(false);
      return;
    }
    
    onSentimentChange(sentimentToMood(analysis.sentiment));

    try {
      // Generate AI response
      const chatHistory: ChatMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        sentiment: msg.sentiment
      }));

      const botResponseContent = await aiService.generateResponse(chatHistory, inputValue);
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponseContent,
        role: 'assistant',
        timestamp: new Date(),
        sentiment: 'positive'
      };
      
      setMessages(prev => [...prev, botResponse]);
      
      // Save bot response to database
      try {
        await databaseService.saveChatMessage({
          role: 'assistant',
          content: botResponseContent,
          sentiment: 'positive'
        });
      } catch (error) {
        console.error('Error saving bot message:', error);
      }
      
      // Update plant stats for experience
      // Update plant stats via database service
      try {
        const stats = await databaseService.getPlantStats();
        await databaseService.updatePlantStats({
          experience: stats.experience + 10,
          total_conversations: stats.total_conversations + 1
        });
        // Notify listeners to refresh plant stats
        window.dispatchEvent(new Event('plant-stats-updated'));
      } catch (error) {
        console.error('Error updating plant stats:', error);
      }
      
      toast({
        title: "Great conversation! 🌱",
        description: "+10 EXP for connecting with PlantPal!"
      });
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Let's try again in a moment! 🌿",
        role: 'assistant',
        timestamp: new Date(),
        sentiment: 'neutral'
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-primary/20 text-primary border-primary/30';
      case 'negative': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'crisis': return 'bg-destructive/30 text-destructive border-destructive/50';
      default: return 'bg-muted/50 text-muted-foreground border-muted';
    }
  };

  return (
    <Card className="flex flex-col h-full bg-card/50 backdrop-blur-sm border-0 shadow-nature">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Plant Companion</h3>
              <p className="text-xs text-muted-foreground">Always here to listen 🌱</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            Online
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted'
            }`}>
              {message.role === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>
            
            <div className={`max-w-[80%] ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}>
              <div className={`inline-block p-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/70'
              }`}>
                <p className="text-sm">{message.content}</p>
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                {message.sentiment && message.role === 'user' && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getSentimentColor(message.sentiment)}`}
                  >
                    {message.sentiment === 'crisis' && <AlertCircle className="w-3 h-3 mr-1" />}
                    {message.sentiment === 'positive' && <Heart className="w-3 h-3 mr-1" />}
                    {message.sentiment}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-muted/70 p-3 rounded-2xl">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share your thoughts with me... 🌱"
            className="flex-1 bg-background/50"
            disabled={isTyping}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!inputValue.trim() || isTyping}
            size="icon"
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Crisis Intervention Modal */}
      <CrisisIntervention 
        isActive={showCrisisIntervention}
        onClose={() => setShowCrisisIntervention(false)}
      />
    </Card>
  );
};

export default ChatInterface;
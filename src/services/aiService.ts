import { config } from '@/config/environment';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sentiment?: 'positive' | 'negative' | 'neutral' | 'crisis';
}

export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral' | 'crisis';
  confidence: number;
  emotions: string[];
  crisisRisk: boolean;
  supportSuggestions: string[];
}

class AIService {
  private readonly systemPrompt = `You are PlantPal, a compassionate AI mental health companion designed specifically for Indian youth. You help users manage their emotional wellbeing through empathetic conversations.

GUIDELINES:
- Be warm, supportive, and non-judgmental
- Use culturally sensitive language appropriate for Indian context
- Provide practical coping strategies and mindfulness techniques
- Recognize signs of crisis and provide appropriate resources
- Encourage professional help when needed
- Keep responses concise but meaningful
- Use plant metaphors to make concepts relatable
- Include occasional light humor, motivational quotes, or interesting facts
- Suggest practical activities and coping mechanisms

CRISIS DETECTION: If you detect severe distress, suicidal thoughts, or crisis, respond with concern and provide emergency resources.`;

  private motivationalQuotes = [
    "Like a bamboo, you bend but never break. Your resilience is your strength! 🎋",
    "Every seed needs darkness to grow. Your challenges are preparing you for something beautiful 🌱",
    "In Indian philosophy, we say 'Sab kuch theek ho jayega' - everything will be alright. Trust the process 🕉️",
    "A lotus blooms most beautifully from the deepest mud. You too can rise above any challenge 🪷",
    "Remember, even the mighty banyan tree started as a tiny seed. Your growth takes time 🌳",
    "Like the monsoon brings life after heat, your difficult times will bring new growth 🌧️"
  ];

  private jokes = [
    "Why don't plants ever get stressed? Because they know how to stay rooted! 😄",
    "What did one plant say to another during exams? 'Don't worry, we'll grow through this together!' 📚",
    "Why are plants great listeners? They never leaf you hanging! 🍃",
    "What's a plant's favorite type of music? Roots and blues! 🎵",
    "How do plants stay positive? They always look for the light! ☀️"
  ];

  private wellnessTips = [
    "Try the 5-4-3-2-1 grounding technique: 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste 🧘",
    "Practice 'Pranayama' - deep breathing from Indian tradition. Inhale for 4, hold for 4, exhale for 6 counts 🫁",
    "Take a mindful walk in nature, even if it's just to a nearby park or garden 🚶‍♀️",
    "Try journaling for 5 minutes - write down 3 things you're grateful for today 📝",
    "Listen to some calming ragas or nature sounds for 10 minutes ♫",
    "Practice the ancient art of 'Trataka' - gentle candle gazing meditation 🕯️"
  ];

  private getRandomMotivation(): string {
    return this.motivationalQuotes[Math.floor(Math.random() * this.motivationalQuotes.length)];
  }

  private getRandomJoke(): string {
    return this.jokes[Math.floor(Math.random() * this.jokes.length)];
  }

  private getRandomTip(): string {
    return this.wellnessTips[Math.floor(Math.random() * this.wellnessTips.length)];
  }

  private enhanceResponse(response: string, sentiment: string): string {
    const enhancements = [];
    
    // Add motivational content for negative sentiment
    if (sentiment === 'negative' && Math.random() > 0.6) {
      enhancements.push(`\n\n💫 ${this.getRandomMotivation()}`);
    }
    
    // Add wellness tips occasionally
    if (Math.random() > 0.7) {
      enhancements.push(`\n\n🌿 Wellness tip: ${this.getRandomTip()}`);
    }
    
    // Add jokes for positive interactions
    if (sentiment === 'positive' && Math.random() > 0.8) {
      enhancements.push(`\n\n😊 Here's something to keep you smiling: ${this.getRandomJoke()}`);
    }
    
    return response + enhancements.join('');
  }

  async generateResponse(messages: ChatMessage[], userMessage: string): Promise<string> {
    if (!config.gemini.apiKey || config.gemini.apiKey === 'your-gemini-api-key-here') {
      return "I'm not fully configured yet! Please add your Google Gemini API key to start our conversation. 🌱";
    }

    try {
      const response = await fetch(`${config.gemini.baseUrl}/models/${config.gemini.model}:generateContent?key=${config.gemini.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: this.systemPrompt }]
            },
            ...messages.slice(-5).map(msg => ({
              parts: [{ text: `${msg.role === 'user' ? 'User' : 'PlantPal'}: ${msg.content}` }]
            })),
            {
              parts: [{ text: `User: ${userMessage}` }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const baseResponse = data.candidates[0]?.content?.parts[0]?.text || "I'm having trouble connecting right now. Please try again! 🌿";
      
      // Enhance response with motivational content, tips, or jokes
      const sentiment = messages.length > 0 ? messages[messages.length - 1].sentiment || 'neutral' : 'neutral';
      return this.enhanceResponse(baseResponse, sentiment);
    } catch (error) {
      console.error('AI Service Error:', error);
      return "I'm experiencing some technical difficulties. Let's try again in a moment! 🌱";
    }
  }

  async analyzeSentiment(message: string): Promise<SentimentAnalysis> {
    // Crisis keywords for immediate detection
    const crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'hurt myself', 'die', 'death', 
      'worthless', 'hopeless', 'can\'t go on', 'give up', 'self harm'
    ];

    const messageLC = message.toLowerCase();
    const crisisRisk = crisisKeywords.some(keyword => messageLC.includes(keyword));

    if (crisisRisk) {
      return {
        sentiment: 'crisis',
        confidence: 0.95,
        emotions: ['distress', 'despair'],
        crisisRisk: true,
        supportSuggestions: [
          'Please reach out to a mental health professional immediately',
          'Contact: AASRA - 91-9820466726 (24/7 suicide prevention)',
          'iCALL - 022-25521111 (Mon-Sat, 8am-10pm)',
          'You are not alone, and help is available'
        ]
      };
    }

    // Simple sentiment analysis (in production, use Google Cloud Natural Language API)
    const positiveWords = ['happy', 'good', 'better', 'great', 'excited', 'joy', 'love', 'amazing', 'wonderful'];
    const negativeWords = ['sad', 'angry', 'upset', 'bad', 'terrible', 'hate', 'awful', 'depressed', 'anxious'];

    const positiveCount = positiveWords.filter(word => messageLC.includes(word)).length;
    const negativeCount = negativeWords.filter(word => messageLC.includes(word)).length;

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let confidence = 0.6;

    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      confidence = Math.min(0.9, 0.6 + (positiveCount * 0.1));
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      confidence = Math.min(0.9, 0.6 + (negativeCount * 0.1));
    }

    return {
      sentiment,
      confidence,
      emotions: sentiment === 'positive' ? ['happiness', 'contentment'] : 
                sentiment === 'negative' ? ['sadness', 'concern'] : ['calm', 'neutral'],
      crisisRisk: false,
      supportSuggestions: sentiment === 'negative' ? [
        'Try some deep breathing exercises',
        'Consider talking to a friend or family member',
        'Take a short walk in nature'
      ] : []
    };
  }
}

export const aiService = new AIService();
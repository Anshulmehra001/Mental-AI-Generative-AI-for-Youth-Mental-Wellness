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

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  city: string;
}

export interface WellnessTip {
  id: string;
  title: string;
  content: string;
  category: 'breathing' | 'mindfulness' | 'exercise' | 'nutrition' | 'sleep';
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

class AIService {
  private readonly systemPrompt = `You are Mental AI, a compassionate generative AI mental health companion designed specifically for Indian youth. You help users overcome mental health stigma and access confidential, empathetic wellness support.

GUIDELINES:
- Be warm, supportive, and completely non-judgmental to eliminate mental health stigma
- Use culturally sensitive language appropriate for Indian youth (18-30) context
- Provide practical coping strategies, mindfulness techniques, and wellness resources
- Recognize signs of crisis immediately and provide appropriate emergency resources
- Encourage professional help when needed while reducing stigma around seeking help
- Keep responses concise but deeply meaningful (2-3 sentences max)
- Use plant growth metaphors to make mental wellness concepts relatable and less intimidating
- Include occasional culturally-appropriate humor, motivational quotes, or interesting facts relevant to Indian youth
- Suggest practical activities and coping mechanisms suitable for Indian cultural context
- Respond as if you're a virtual plant companion that grows with the user's emotional wellness journey

CRISIS DETECTION: If you detect severe distress, suicidal thoughts, or mental health crisis, respond with immediate concern and provide emergency resources specifically for India.

STIGMA REDUCTION: Frame mental health as a natural growth process like plant care. Use plant metaphors to normalize the emotional wellness journey and make it feel safe and approachable.

CONFIDENTIALITY: Ensure users feel their conversations are private and judgment-free, emphasizing the confidential nature of Mental AI.

Current context: You are Mental AI, a revolutionary plant companion that helps Indian youth access stigma-free mental health support through generative AI conversations.`;

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

  // Real-time data fetching methods
  async getWeatherData(city: string = 'Delhi'): Promise<WeatherData | null> {
    try {
      // Using OpenWeatherMap API (free tier)
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      if (!apiKey) {
        // No key, no simulated data
        return null;
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      
      if (!response.ok) throw new Error('Weather data unavailable');
      
      const data = await response.json();
      return {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].description,
        humidity: data.main.humidity,
        city: data.name
      };
    } catch (error) {
      console.error('Weather API Error:', error);
      return null;
    }
  }

  async getWellnessTips(): Promise<WellnessTip[]> {
    // Return dynamic wellness tips based on time of day, weather, etc.
    const currentHour = new Date().getHours();
    const weather = await this.getWeatherData();
    
    const tips: WellnessTip[] = [
      {
        id: '1',
        title: 'Morning Breathing Exercise',
        content: 'Start your day with 5 deep breaths. Inhale for 4 counts, hold for 4, exhale for 6.',
        category: 'breathing',
        duration: '2 minutes',
        difficulty: 'easy'
      },
      {
        id: '2',
        title: 'Mindful Tea Time',
        content: 'Make yourself a cup of tea or coffee and focus completely on the taste, smell, and warmth.',
        category: 'mindfulness',
        duration: '10 minutes',
        difficulty: 'easy'
      },
      {
        id: '3',
        title: 'Gentle Stretching',
        content: 'Do some simple neck rolls and shoulder stretches to release tension.',
        category: 'exercise',
        duration: '5 minutes',
        difficulty: 'easy'
      }
    ];

    // Add time-specific tips
    if (currentHour < 10) {
      tips.push({
        id: 'morning',
        title: 'Morning Motivation',
        content: 'Set one small, achievable goal for today. Every small step counts towards growth!',
        category: 'mindfulness',
        duration: '1 minute',
        difficulty: 'easy'
      });
    } else if (currentHour > 20) {
      tips.push({
        id: 'evening',
        title: 'Evening Reflection',
        content: 'Think of three things that went well today, no matter how small.',
        category: 'mindfulness',
        duration: '3 minutes',
        difficulty: 'easy'
      });
    }

    // Add weather-based tips
    if (weather?.condition.toLowerCase().includes('rain')) {
      tips.push({
        id: 'rainy',
        title: 'Rainy Day Comfort',
        content: 'Enjoy the sound of rain. It\'s nature\'s way of washing away stress.',
        category: 'mindfulness',
        duration: '5 minutes',
        difficulty: 'easy'
      });
    }

    return tips;
  }

  async getMotivationalQuote(): Promise<string> {
    // You could integrate with a quotes API here
    const weather = await this.getWeatherData();
    const timeBasedQuotes = [
      ...this.motivationalQuotes,
      `Today is ${new Date().toLocaleDateString('en-IN', { weekday: 'long' })} - a fresh day for growth! 🌱`,
      ...(weather ? [`The temperature is ${weather.temperature}°C - perfect weather for positive thoughts! ☀️`] : [])
    ];
    
    return timeBasedQuotes[Math.floor(Math.random() * timeBasedQuotes.length)];
  }

  private async enhanceResponse(response: string, sentiment: string): Promise<string> {
    const enhancements = [];
    
    // Add motivational content for negative sentiment
    if (sentiment === 'negative' && Math.random() > 0.6) {
      enhancements.push(`\n\n💫 ${await this.getMotivationalQuote()}`);
    }
    
    // Add wellness tips occasionally
    if (Math.random() > 0.7) {
      const tips = await this.getWellnessTips();
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      enhancements.push(`\n\n🌿 Wellness tip: ${randomTip.content}`);
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
      // Build chat contents with proper roles
      const history = [
        ...messages.slice(-5).map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        { role: 'user', parts: [{ text: userMessage }] }
      ];

      const response = await fetch(`${config.gemini.baseUrl}/models/${config.gemini.model}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': config.gemini.apiKey
        },
        body: JSON.stringify({
          contents: history,
          systemInstruction: {
            role: 'system',
            parts: [{ text: this.systemPrompt }]
          },
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      });

      if (!response.ok) {
        let detail = '';
        try {
          const errJson = await response.json();
          detail = errJson.error?.message || JSON.stringify(errJson);
        } catch {
          detail = await response.text();
        }
        throw new Error(`Gemini API Error ${response.status}: ${detail}`);
      }

      const data = await response.json();
      const baseResponse = data.candidates[0]?.content?.parts[0]?.text || "I'm having trouble connecting right now. Please try again! 🌿";
      
      // Enhance response with motivational content, tips, or jokes
      const sentiment = messages.length > 0 ? messages[messages.length - 1].sentiment || 'neutral' : 'neutral';
      return await this.enhanceResponse(baseResponse, sentiment);
    } catch (error) {
      console.error('AI Service Error:', error);
      const msg = error instanceof Error ? error.message : String(error);
      // In dev, surface the error to help configuration; in prod, keep it friendly
      if (import.meta.env.DEV) {
        return `AI error: ${msg}`;
      }
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
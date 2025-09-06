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

CRISIS DETECTION: If you detect severe distress, suicidal thoughts, or crisis, respond with concern and provide emergency resources.`;

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
      return data.candidates[0]?.content?.parts[0]?.text || "I'm having trouble connecting right now. Please try again! 🌿";
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
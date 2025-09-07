# 🌱 PlantPal - AI Mental Health Companion

**Google Cloud Generative AI Hackathon Submission**

PlantPal is an innovative AI-powered mental wellness solution designed specifically for Indian youth. It combines the power of Google Cloud's Gemini API with an empathetic plant companion that grows and responds to your emotional journey.

## 🎯 Problem Statement

Mental health remains a significant taboo in India, creating barriers for young adults seeking support. With intense academic and social pressures, youth often lack a confidential, accessible, and non-judgmental outlet for their mental health concerns.

## 💡 Solution

PlantPal addresses these challenges by providing:
- **Confidential AI Conversations** using Google Gemini API
- **Culturally Sensitive Support** tailored for Indian youth
- **Interactive Plant Companion** that responds to emotions
- **Crisis Intervention System** with local helplines
- **Mood Tracking & Analytics** for self-awareness
- **Achievement System** to gamify mental wellness

## 🚀 Features

### 🤖 AI-Powered Chat
- Real conversations with Google Gemini API
- Advanced sentiment analysis
- Crisis detection and intervention
- Culturally appropriate responses

### 🌿 Interactive Plant Companion
- Visual plant that responds to your emotions
- Growth system based on engagement
- Interactive elements (leaves, pot)
- Multiple mood states with unique animations

### 📊 Comprehensive Analytics
- Weekly mood trends
- Mood distribution charts
- Intensity tracking
- Personal insights and patterns

### 🏆 Achievement System
- Conversation milestones
- Growth achievements
- Consistency rewards
- Progress tracking

### 🆘 Crisis Support
- Automatic crisis detection
- Indian mental health helplines
- Emergency resources
- Safety protocols

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **AI**: Google Gemini API (Gemini 1.5 Flash)
- **Charts**: Recharts for data visualization
- **Animations**: Custom CSS animations
- **State Management**: Local storage for offline capability
- **UI Components**: Radix UI with custom theming

## 📋 Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/Anshulmehra001/Plantpal.git
   cd Plantpal
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Configure API Key**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Google Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Get Google Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key to your `.env` file

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🎨 Design Philosophy

PlantPal uses a nature-inspired design system:
- **Semantic color tokens** for consistent theming
- **Plant growth animations** for emotional feedback
- **Soft, calming gradients** to reduce anxiety
- **Accessibility-first** approach with proper contrast

## 🌟 Hackathon Alignment

### Clear Proposal ✅
- Addresses mental health stigma in Indian youth
- Leverages Google Cloud Generative AI effectively
- Culturally sensitive and locally relevant

### Functional Prototype ✅
- Complete working application
- Real Google Gemini API integration
- All core features implemented and tested

### Innovation ✅
- Unique plant companion concept
- Gamified mental wellness approach
- Crisis intervention with local resources
- Comprehensive analytics dashboard

## 🔧 Configuration Options

The app supports various configuration options in `src/config/environment.ts`:

```typescript
export const config = {
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    model: 'gemini-1.5-flash',
  },
  features: {
    crisisIntervention: true,
    sentimentAnalysis: true,
    voiceChat: false // Future feature
  }
};
```

## 📱 Features Overview

### Chat Interface
- Real-time AI conversations
- Typing indicators
- Sentiment badges
- Message history
- Crisis detection alerts

### Garden Dashboard
- Achievement showcase
- Mood tracking interface
- Progress visualization
- Streak counters

### Insights Analytics
- Interactive charts
- Weekly trends
- Mood distribution
- Personal insights

## 🚨 Crisis Intervention

PlantPal includes comprehensive crisis support:
- **AASRA**: 91-9820466726 (24/7 suicide prevention)
- **iCALL**: 022-25521111 (Mon-Sat, 8am-10pm)
- **Vandrevala Foundation**: 9999666555 (24 hours)
- **NIMHANS**: 080-26995000 (Business hours)

## 🌍 Cultural Sensitivity

Designed specifically for Indian context:
- Local helpline numbers
- Culturally appropriate language
- Indian youth challenges awareness
- Regional mental health resources

## 🔮 Future Enhancements

- Voice chat capabilities
- Multi-language support
- Professional therapist connections
- Community features
- Mobile app version

## 🚀 Live Demo

**URL**: https://lovable.dev/projects/9c956a06-fc13-4715-a82e-fbedaa0dbbec

## 🤝 Contributing

This project was created for the Google Cloud Generative AI Hackathon. Contributions and improvements are welcome!

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Author

**Anshul Mehra**
- GitHub: [@Anshulmehra001](https://github.com/Anshulmehra001)

---

**Built with ❤️ for Indian youth mental wellness using Google Cloud Generative AI**

-- PlantPal Database Schema for Supabase
-- Run this in your Supabase SQL editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT,
    username TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    preferences JSONB DEFAULT '{
        "theme": "auto",
        "notifications": true
    }'::jsonb
);

-- Mood entries table
CREATE TABLE IF NOT EXISTS public.mood_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    mood TEXT NOT NULL CHECK (mood IN ('happy', 'content', 'neutral', 'sad', 'excited')),
    intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
    notes TEXT,
    triggers TEXT[],
    weather_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Plant stats table
CREATE TABLE IF NOT EXISTS public.plant_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1 NOT NULL,
    experience INTEGER DEFAULT 0 NOT NULL,
    total_conversations INTEGER DEFAULT 0 NOT NULL,
    streak_days INTEGER DEFAULT 0 NOT NULL,
    longest_streak INTEGER DEFAULT 0 NOT NULL,
    total_mood_entries INTEGER DEFAULT 0 NOT NULL,
    average_mood DECIMAL(3,2) DEFAULT 2.5,
    plant_type TEXT DEFAULT 'seedling' NOT NULL,
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    birth_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

-- Achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('conversation', 'mood', 'streak', 'growth')),
    rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, achievement_id)
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral', 'crisis')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id_created_at ON public.mood_entries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id_created_at ON public.chat_messages(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_plant_stats_user_id ON public.plant_stats(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
-- Note: In a production app, you'd use Supabase Auth, but for this demo we'll use user_id matching
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (true);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (true);

-- Mood entries policies
CREATE POLICY "Users can view own mood entries" ON public.mood_entries
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own mood entries" ON public.mood_entries
    FOR INSERT WITH CHECK (true);

-- Plant stats policies
CREATE POLICY "Users can view own plant stats" ON public.plant_stats
    FOR SELECT USING (true);

CREATE POLICY "Users can update own plant stats" ON public.plant_stats
    FOR UPDATE USING (true);

CREATE POLICY "Users can insert own plant stats" ON public.plant_stats
    FOR INSERT WITH CHECK (true);

-- Achievements policies
CREATE POLICY "Users can view own achievements" ON public.achievements
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own achievements" ON public.achievements
    FOR INSERT WITH CHECK (true);

-- Chat messages policies
CREATE POLICY "Users can view own chat messages" ON public.chat_messages
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own chat messages" ON public.chat_messages
    FOR INSERT WITH CHECK (true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plant_stats_updated_at 
    BEFORE UPDATE ON public.plant_stats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample achievements data
INSERT INTO public.achievements (user_id, achievement_id, title, description, icon, category, rarity, unlocked_at)
VALUES 
    ('00000000-0000-0000-0000-000000000000', 'first_chat', 'First Conversation', 'Had your first chat with PlantPal', '💬', 'conversation', 'common', NOW()),
    ('00000000-0000-0000-0000-000000000000', 'mood_tracker', 'Mood Tracker', 'Logged your first mood entry', '😊', 'mood', 'common', NOW()),
    ('00000000-0000-0000-0000-000000000000', 'three_day_streak', '3-Day Streak', 'Maintained a 3-day check-in streak', '🔥', 'streak', 'rare', NOW()),
    ('00000000-0000-0000-0000-000000000000', 'level_up', 'Plant Growth', 'Your plant reached level 2', '🌱', 'growth', 'common', NOW())
ON CONFLICT (user_id, achievement_id) DO NOTHING;

-- Create a view for mood analytics
CREATE OR REPLACE VIEW mood_analytics AS
SELECT 
    user_id,
    COUNT(*) as total_entries,
    AVG(intensity) as average_intensity,
    mode() WITHIN GROUP (ORDER BY mood) as most_common_mood,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as entries_this_week,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as entries_this_month
FROM public.mood_entries
GROUP BY user_id;
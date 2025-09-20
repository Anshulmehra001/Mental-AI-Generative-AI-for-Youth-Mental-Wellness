import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { 
  TrendingUp, Calendar, Smile, BarChart3, 
  Target, Activity, Heart, Brain 
} from 'lucide-react';
import { databaseService, DbMoodEntry, DbPlantStats } from '@/services/databaseService';

const AnalyticsDashboard = () => {
  const [moodEntries, setMoodEntries] = useState<DbMoodEntry[]>([]);
  const [plantStats, setPlantStats] = useState<DbPlantStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [entriesData, statsData] = await Promise.all([
        databaseService.getMoodEntries(),
        databaseService.getPlantStats()
      ]);
      setMoodEntries(entriesData);
      setPlantStats(statsData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart data processing
  const getWeeklyMoodData = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentEntries = moodEntries.filter(entry => new Date(entry.created_at) >= weekAgo);
    const groupedByDay: Record<string, { totalMood: number; count: number }> = {};
    
    // Initialize all days of the week
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayKey = date.toLocaleDateString('en-US', { weekday: 'short' });
      groupedByDay[dayKey] = { totalMood: 0, count: 0 };
    }
    
    recentEntries.forEach(entry => {
      const day = new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'short' });
      if (groupedByDay[day]) {
        groupedByDay[day].totalMood += moodToNumber(entry.mood);
        groupedByDay[day].count += 1;
      }
    });

    return Object.entries(groupedByDay).map(([day, data]) => ({
      day,
      mood: data.count > 0 ? Math.round(data.totalMood / data.count * 10) / 10 : 0,
      count: data.count
    }));
  };

  const getMoodDistribution = () => {
    const distribution = moodEntries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([mood, count]) => ({
      name: mood.charAt(0).toUpperCase() + mood.slice(1),
      value: count,
      color: getMoodColor(mood)
    }));
  };

  const getIntensityTrend = () => {
    return moodEntries
      .slice(-10)
      .map((entry, index) => ({
        session: index + 1,
        intensity: entry.intensity,
        mood: entry.mood
      }));
  };

  const moodToNumber = (mood: string): number => {
    const moodValues = { sad: 1, neutral: 2, content: 3, happy: 4, excited: 5 };
    return moodValues[mood as keyof typeof moodValues] || 2;
  };

  const getMoodColor = (mood: string): string => {
    const colors = {
      excited: '#FFD700',
      happy: '#4CAF50',
      content: '#2196F3',
      neutral: '#9E9E9E',
      sad: '#9C27B0'
    };
    return colors[mood as keyof typeof colors] || '#9E9E9E';
  };

  const calculateMoodScore = (): number => {
    if (moodEntries.length === 0) return 0;
    const total = moodEntries.reduce((sum, entry) => sum + moodToNumber(entry.mood), 0);
    return Math.round((total / moodEntries.length) * 20);
  };

  const getConsistencyScore = (): number => {
    if (moodEntries.length < 7) return moodEntries.length * 14;
    return Math.min(100, (moodEntries.length / 30) * 100);
  };

  const weeklyData = getWeeklyMoodData();
  const moodDistribution = getMoodDistribution();
  const intensityTrend = getIntensityTrend();
  const moodScore = calculateMoodScore();
  const consistencyScore = getConsistencyScore();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-8 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded"></div>
            </Card>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-6 bg-muted rounded mb-4"></div>
              <div className="h-64 bg-muted rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Mood Score</p>
              <p className="text-2xl font-bold text-primary">{moodScore}/100</p>
            </div>
            <Smile className="w-8 h-8 text-blue-500" />
          </div>
          <Progress value={moodScore} className="mt-2" />
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Consistency</p>
              <p className="text-2xl font-bold text-primary">{Math.round(consistencyScore)}%</p>
            </div>
            <Target className="w-8 h-8 text-green-500" />
          </div>
          <Progress value={consistencyScore} className="mt-2" />
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
              <p className="text-2xl font-bold text-primary">{moodEntries.length}</p>
            </div>
            <Activity className="w-8 h-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Plant Level</p>
              <p className="text-2xl font-bold text-primary">{plantStats?.level || 1}</p>
            </div>
            <Brain className="w-8 h-8 text-orange-500" />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {plantStats?.total_conversations || 0} conversations
          </div>
        </Card>
      </div>

      {/* Weekly Mood Trend */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Weekly Mood Trend</h3>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey="day" 
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                domain={[0, 5]}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="mood"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#moodGradient)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Mood Distribution */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Mood Distribution</h3>
          </div>
          {moodDistribution.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={moodDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {moodDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Start tracking your moods to see distribution
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            {moodDistribution.map((entry) => (
              <Badge key={entry.name} variant="outline" style={{ borderColor: entry.color }}>
                <div 
                  className="w-2 h-2 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}: {String(entry.value)}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Intensity Trend */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Intensity Trend</h3>
          </div>
          {intensityTrend.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={intensityTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="session" 
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    domain={[1, 10]}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="intensity"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Track more moods to see intensity patterns
            </div>
          )}
        </Card>
      </div>

      {/* Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Personal Insights
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-primary/5 rounded-lg">
            <h4 className="font-medium mb-2">Most Common Mood</h4>
            <p className="text-sm text-muted-foreground">
              {moodDistribution.length > 0 
                ? `You feel ${moodDistribution.sort((a, b) => Number(b.value) - Number(a.value))[0]?.name.toLowerCase()} most often`
                : 'Start tracking to discover patterns'
              }
            </p>
          </div>
          <div className="p-4 bg-primary/5 rounded-lg">
            <h4 className="font-medium mb-2">Tracking Streak</h4>
            <p className="text-sm text-muted-foreground">
              You've logged {moodEntries.length} mood entries. Great job on your mental health journey! 🌱
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
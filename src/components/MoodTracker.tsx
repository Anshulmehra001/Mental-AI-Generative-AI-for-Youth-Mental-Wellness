import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { databaseService } from '@/services/databaseService';
import { toast } from '@/hooks/use-toast';

type Mood = 'happy' | 'content' | 'neutral' | 'sad' | 'excited';

interface MoodTrackerProps {
  onMoodLogged: (mood: Mood) => void;
}

const MoodTracker = ({ onMoodLogged }: MoodTrackerProps) => {
  const [selectedMood, setSelectedMood] = useState<Mood>('neutral');
  const [intensity, setIntensity] = useState([5]);
  const [notes, setNotes] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);

  const moods: { value: Mood; label: string; emoji: string; color: string }[] = [
    { value: 'excited', label: 'Excited', emoji: '🤩', color: 'bg-yellow-500' },
    { value: 'happy', label: 'Happy', emoji: '😊', color: 'bg-green-500' },
    { value: 'content', label: 'Content', emoji: '😌', color: 'bg-blue-500' },
    { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'bg-gray-500' },
    { value: 'sad', label: 'Sad', emoji: '😢', color: 'bg-purple-500' },
  ];

  const commonTriggers = [
    'Work/Study stress', 'Relationship issues', 'Family concerns', 'Health worries',
    'Financial stress', 'Social anxiety', 'Sleep problems', 'Weather changes',
    'Exercise', 'Good news', 'Social connection', 'Achievement'
  ];

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev => 
      prev.includes(trigger) 
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const handleSubmit = async () => {
    try {
      const entry = {
        mood: selectedMood,
        intensity: intensity[0],
        notes: notes.trim() || undefined,
        triggers: selectedTriggers.length > 0 ? selectedTriggers : undefined
      };

      await databaseService.saveMoodEntry(entry);
      onMoodLogged(selectedMood);
      
      toast({
        title: "Mood logged! 📝",
        description: "Your mood has been recorded. Keep growing! 🌱"
      });

      // Reset form
      setSelectedMood('neutral');
      setIntensity([5]);
      setNotes('');
      setSelectedTriggers([]);
    } catch (error) {
      console.error('Error saving mood entry:', error);
      toast({
        title: "Error",
        description: "Failed to save mood entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm">
      <h3 className="text-xl font-semibold mb-4 text-foreground">How are you feeling?</h3>
      
      {/* Mood Selection */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-3 block text-foreground">Select your mood:</label>
        <div className="grid grid-cols-5 gap-2">
          {moods.map((mood) => (
            <Button
              key={mood.value}
              variant={selectedMood === mood.value ? "default" : "outline"}
              className={`flex-col h-auto p-3 ${selectedMood === mood.value ? mood.color : ''}`}
              onClick={() => setSelectedMood(mood.value)}
            >
              <span className="text-2xl mb-1">{mood.emoji}</span>
              <span className="text-xs">{mood.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Intensity Slider */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-3 block text-foreground">
          Intensity: {intensity[0]}/10
        </label>
        <Slider
          value={intensity}
          onValueChange={setIntensity}
          max={10}
          min={1}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Mild</span>
          <span>Intense</span>
        </div>
      </div>

      {/* Triggers */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-3 block text-foreground">
          What influenced this mood? (optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {commonTriggers.map((trigger) => (
            <Badge
              key={trigger}
              variant={selectedTriggers.includes(trigger) ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/20"
              onClick={() => toggleTrigger(trigger)}
            >
              {trigger}
            </Badge>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-3 block text-foreground">
          Additional notes (optional):
        </label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How are you feeling today? What's on your mind?"
          className="resize-none"
          rows={3}
        />
      </div>

      <Button onClick={handleSubmit} className="w-full">
        Log Mood Entry
      </Button>
    </Card>
  );
};

export default MoodTracker;
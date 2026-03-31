import { useState } from 'react';
import { useMoods, useCreateMood, useDeleteMood } from '../hooks/useHealthData';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';

const MOOD_TYPES = ['happy', 'sad', 'anxious', 'angry', 'calm', 'irritable', 'energetic', 'tired', 'stressed', 'content', 'depressed', 'excited', 'neutral', 'other'];

const MOOD_COLORS: Record<string, string> = {
  happy: 'bg-yellow-100 text-yellow-800', sad: 'bg-blue-100 text-blue-800',
  anxious: 'bg-orange-100 text-orange-800', angry: 'bg-red-100 text-red-800',
  calm: 'bg-green-100 text-green-800', irritable: 'bg-rose-100 text-rose-800',
  energetic: 'bg-emerald-100 text-emerald-800', tired: 'bg-slate-100 text-slate-800',
  stressed: 'bg-amber-100 text-amber-800', content: 'bg-teal-100 text-teal-800',
  depressed: 'bg-indigo-100 text-indigo-800', excited: 'bg-pink-100 text-pink-800',
  neutral: 'bg-gray-100 text-gray-800', other: 'bg-purple-100 text-purple-800',
};

export function MoodTracker() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { data: moods, isLoading } = useMoods(startDate || undefined, endDate || undefined);
  const createMood = useCreateMood();
  const deleteMood = useDeleteMood();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], mood: 'neutral', intensity: '5', triggers: '', notes: '' });

  const handleCreate = async () => {
    await createMood.mutateAsync({
      date: form.date,
      mood: form.mood,
      intensity: parseInt(form.intensity),
      triggers: form.triggers ? form.triggers.split(',').map((t) => t.trim()) : [],
      notes: form.notes,
    });
    setShowForm(false);
    setForm({ date: new Date().toISOString().split('T')[0], mood: 'neutral', intensity: '5', triggers: '', notes: '' });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mood Tracker</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Track how you're feeling</p>
        </div>
        <Button onClick={() => setShowForm(true)}>Log Mood</Button>
      </div>

      <div className="mb-6 flex gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
        <Input label="From" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input label="To" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />)}
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {moods?.map((mood) => (
              <motion.div key={mood.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${MOOD_COLORS[mood.mood] || MOOD_COLORS.other}`}>
                        {mood.mood}
                      </span>
                      <div>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          {new Date(mood.date).toLocaleDateString()} | Intensity: {mood.intensity}/10
                        </p>
                        {mood.triggers.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {mood.triggers.map((t, i) => (
                              <span key={i} className="rounded bg-[hsl(var(--muted))] px-1.5 py-0.5 text-xs">{t}</span>
                            ))}
                          </div>
                        )}
                        {mood.notes && <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{mood.notes}</p>}
                      </div>
                    </div>
                    <Button variant="danger" onClick={() => deleteMood.mutate(mood.id)} className="text-xs px-2 py-1">
                      Delete
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
            {moods?.length === 0 && <p className="py-8 text-center text-[hsl(var(--muted-foreground))]">No moods logged</p>}
          </div>
        </AnimatePresence>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Log Your Mood">
        <div className="space-y-3">
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Mood</label>
            <select
              value={form.mood}
              onChange={(e) => setForm({ ...form, mood: e.target.value })}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--ring))]"
            >
              {MOOD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Intensity: {form.intensity}/10</label>
            <input type="range" min="1" max="10" value={form.intensity} onChange={(e) => setForm({ ...form, intensity: e.target.value })} className="w-full accent-[hsl(var(--primary))]" />
          </div>
          <Input label="Triggers (comma separated)" value={form.triggers} onChange={(e) => setForm({ ...form, triggers: e.target.value })} placeholder="work, sleep, diet" />
          <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleCreate} isLoading={createMood.isPending}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

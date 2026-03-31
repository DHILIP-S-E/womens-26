import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../services/api';

const GRIEF_STAGES = ['denial', 'anger', 'bargaining', 'depression', 'acceptance'] as const;

export function GriefCompanion() {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [stage, setStage] = useState<string>('');
  const [content, setContent] = useState('');

  const { data: entries = [] } = useQuery({
    queryKey: ['grief'],
    queryFn: () => api.get('/health/grief').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/health/grief', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grief'] });
      setContent('');
      setStage('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/health/grief/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['grief'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ date, stage: stage || undefined, content });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold mb-2">Grief & Loss Companion</h1>

      <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4 mb-6">
        <p className="text-sm text-purple-800 font-medium">
          Your entries are completely private. They are never shared, exported, analyzed by AI, or included in any health reports. This is your safe space.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border border-[hsl(var(--border))] p-6 mb-6 space-y-4">
        <h2 className="text-lg font-semibold">Write a Journal Entry</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stage (optional)</label>
            <select value={stage} onChange={e => setStage(e.target.value)} className="w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm">
              <option value="">Select stage...</option>
              {GRIEF_STAGES.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">How are you feeling?</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={6} required placeholder="Write freely... this is only for you." className="w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm resize-none" />
        </div>
        <button type="submit" disabled={createMutation.isPending} className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
          {createMutation.isPending ? 'Saving...' : 'Save Entry'}
        </button>
      </form>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Your Journal</h2>
        {entries.map((entry: any) => (
          <div key={entry.id} className="rounded-lg border border-[hsl(var(--border))] p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{new Date(entry.date).toLocaleDateString()}</span>
                {entry.stage && (
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                    {entry.stage}
                  </span>
                )}
              </div>
              <button onClick={() => deleteMutation.mutate(entry.id)} className="text-xs text-[hsl(var(--destructive))] hover:underline">
                Delete
              </button>
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] whitespace-pre-wrap">{entry.content}</p>
          </div>
        ))}
        {entries.length === 0 && <p className="text-sm text-[hsl(var(--muted-foreground))]">No journal entries yet. Take your time.</p>}
      </div>
    </motion.div>
  );
}

export default GriefCompanion;

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../services/api';

export function MenopauseCenter() {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState(5);
  const [trigger, setTrigger] = useState('');

  const { data: logs = [] } = useQuery({
    queryKey: ['hot-flashes'],
    queryFn: () => api.get('/health/hot-flashes').then(r => r.data),
  });

  const { data: stats } = useQuery({
    queryKey: ['hot-flashes-stats'],
    queryFn: () => api.get('/health/hot-flashes/stats').then(r => r.data),
  });

  const logMutation = useMutation({
    mutationFn: (data: any) => api.post('/health/hot-flashes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hot-flashes'] });
      queryClient.invalidateQueries({ queryKey: ['hot-flashes-stats'] });
      setDuration('');
      setTrigger('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logMutation.mutate({ date, duration: parseInt(duration), severity, trigger: trigger || undefined });
  };

  const triggers = ['stress', 'food', 'alcohol', 'exercise', 'caffeine', 'hot_weather', 'unknown'];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold mb-6">Menopause Center</h1>

      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border border-[hsl(var(--border))] p-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Avg Severity</p>
            <p className="text-2xl font-bold">{stats.avgSeverity?.toFixed(1) || '—'}/10</p>
          </div>
          <div className="rounded-lg border border-[hsl(var(--border))] p-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Per Week</p>
            <p className="text-2xl font-bold">{stats.frequencyPerWeek?.toFixed(1) || '—'}</p>
          </div>
          <div className="rounded-lg border border-[hsl(var(--border))] p-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Top Trigger</p>
            <p className="text-2xl font-bold">{stats.commonTriggers?.[0]?.trigger || '—'}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-lg border border-[hsl(var(--border))] p-6 mb-6 space-y-4">
        <h2 className="text-lg font-semibold">Log Hot Flash</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duration (seconds)</label>
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 120" min="1" required className="w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Severity: {severity}/10</label>
          <input type="range" min="1" max="10" value={severity} onChange={e => setSeverity(parseInt(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Trigger</label>
          <div className="flex flex-wrap gap-2">
            {triggers.map(t => (
              <button key={t} type="button" onClick={() => setTrigger(t)}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${trigger === t ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" disabled={logMutation.isPending} className="rounded-md bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
          {logMutation.isPending ? 'Logging...' : 'Log Hot Flash'}
        </button>
      </form>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">History</h2>
        {logs.map((log: any) => (
          <div key={log.id} className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-4">
            <div>
              <p className="text-sm font-medium">{new Date(log.date).toLocaleDateString()} - {log.duration}s</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Trigger: {log.trigger || 'unknown'}</p>
            </div>
            <div className={`rounded-full px-3 py-1 text-xs font-bold ${log.severity >= 7 ? 'bg-red-100 text-red-700' : log.severity >= 4 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
              {log.severity}/10
            </div>
          </div>
        ))}
        {logs.length === 0 && <p className="text-sm text-[hsl(var(--muted-foreground))]">No hot flashes logged yet.</p>}
      </div>
    </motion.div>
  );
}

export default MenopauseCenter;

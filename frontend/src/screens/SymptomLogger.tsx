import { useState } from 'react';
import { useSymptoms, useCreateSymptom, useDeleteSymptom } from '../hooks/useHealthData';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';

const SYMPTOM_TYPES = ['cramps', 'headache', 'bloating', 'fatigue', 'nausea', 'back_pain', 'breast_tenderness', 'acne', 'insomnia', 'dizziness', 'appetite_change', 'other'];

export function SymptomLogger() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { data: symptoms, isLoading } = useSymptoms(startDate || undefined, endDate || undefined);
  const createSymptom = useCreateSymptom();
  const deleteSymptom = useDeleteSymptom();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], type: 'cramps', severity: '5', notes: '' });

  const handleCreate = async () => {
    await createSymptom.mutateAsync({
      date: form.date,
      type: form.type,
      severity: parseInt(form.severity),
      notes: form.notes,
    });
    setShowForm(false);
    setForm({ date: new Date().toISOString().split('T')[0], type: 'cramps', severity: '5', notes: '' });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Symptom Logger</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Log and track your symptoms</p>
        </div>
        <Button onClick={() => setShowForm(true)}>Log Symptom</Button>
      </div>

      {/* Date Filter */}
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
            {symptoms?.map((symptom) => (
              <motion.div key={symptom.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--accent))]">
                        <span className="text-sm font-bold text-[hsl(var(--accent-foreground))]">{symptom.severity}</span>
                      </div>
                      <div>
                        <p className="font-medium capitalize">{symptom.type.replace('_', ' ')}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          {new Date(symptom.date).toLocaleDateString()} | Severity: {symptom.severity}/10
                        </p>
                        {symptom.notes && <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{symptom.notes}</p>}
                      </div>
                    </div>
                    <Button variant="danger" onClick={() => deleteSymptom.mutate(symptom.id)} className="text-xs px-2 py-1">
                      Delete
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
            {symptoms?.length === 0 && <p className="py-8 text-center text-[hsl(var(--muted-foreground))]">No symptoms logged</p>}
          </div>
        </AnimatePresence>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Log New Symptom">
        <div className="space-y-3">
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Symptom Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--ring))]"
            >
              {SYMPTOM_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Severity: {form.severity}/10</label>
            <input
              type="range"
              min="1"
              max="10"
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
              className="w-full accent-[hsl(var(--primary))]"
            />
          </div>
          <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleCreate} isLoading={createSymptom.isPending}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

import { useState } from 'react';
import { useCycles, useCreateCycle, useDeleteCycle } from '../hooks/useHealthData';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';

export function CycleTracker() {
  const { data: cycles, isLoading } = useCycles();
  const createCycle = useCreateCycle();
  const deleteCycle = useDeleteCycle();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ startDate: '', endDate: '', cycleLength: '28', periodLength: '5', notes: '' });

  const handleCreate = async () => {
    await createCycle.mutateAsync({
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      cycleLength: parseInt(form.cycleLength),
      periodLength: parseInt(form.periodLength),
      notes: form.notes,
    });
    setShowForm(false);
    setForm({ startDate: '', endDate: '', cycleLength: '28', periodLength: '5', notes: '' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this cycle?')) await deleteCycle.mutateAsync(id);
  };

  const isCurrentCycle = (cycle: { startDate: string; endDate: string | null }) => {
    const now = Date.now();
    const start = new Date(cycle.startDate).getTime();
    const end = cycle.endDate ? new Date(cycle.endDate).getTime() : Infinity;
    return start <= now && now <= end;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cycle Tracker</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Track your menstrual cycles</p>
        </div>
        <Button onClick={() => setShowForm(true)}>Add Cycle</Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />
          ))}
        </div>
      ) : (
        <AnimatePresence>
          <div className="grid gap-4 md:grid-cols-2">
            {cycles?.map((cycle) => (
              <motion.div key={cycle.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className={isCurrentCycle(cycle) ? 'ring-2 ring-[hsl(var(--primary))]' : ''}>
                  {isCurrentCycle(cycle) && (
                    <span className="mb-2 inline-block rounded-full bg-[hsl(var(--primary))] px-2 py-0.5 text-xs text-white">
                      Active
                    </span>
                  )}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        {new Date(cycle.startDate).toLocaleDateString()} - {cycle.endDate ? new Date(cycle.endDate).toLocaleDateString() : 'Ongoing'}
                      </p>
                      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                        Cycle: {cycle.cycleLength}d | Period: {cycle.periodLength}d
                      </p>
                      {cycle.notes && <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{cycle.notes}</p>}
                    </div>
                    <Button variant="danger" onClick={() => handleDelete(cycle.id)} className="text-xs px-2 py-1">
                      Delete
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add New Cycle">
        <div className="space-y-3">
          <Input label="Start Date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
          <Input label="End Date (optional)" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Cycle Length (days)" type="number" value={form.cycleLength} onChange={(e) => setForm({ ...form, cycleLength: e.target.value })} />
            <Input label="Period Length (days)" type="number" value={form.periodLength} onChange={(e) => setForm({ ...form, periodLength: e.target.value })} />
          </div>
          <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleCreate} isLoading={createCycle.isPending}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

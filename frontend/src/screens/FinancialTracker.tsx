import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financialService, type FinancialGoal } from '../services/financial.service';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';

const currencies = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'NGN', 'ZAR', 'BRL'];

function getGoalStatus(goal: FinancialGoal): 'on_track' | 'behind' | 'overdue' {
  const now = new Date();
  const deadline = new Date(goal.deadline);
  if (deadline < now && goal.currentAmount < goal.targetAmount) return 'overdue';
  const totalDays = (deadline.getTime() - new Date(goal.createdAt).getTime()) / 86400000;
  const elapsed = (now.getTime() - new Date(goal.createdAt).getTime()) / 86400000;
  const expectedProgress = elapsed / totalDays;
  const actualProgress = goal.currentAmount / goal.targetAmount;
  if (actualProgress >= expectedProgress * 0.8) return 'on_track';
  return 'behind';
}

const statusColors = {
  on_track: 'bg-green-500',
  behind: 'bg-yellow-500',
  overdue: 'bg-red-500',
};

const statusLabels = {
  on_track: 'On Track',
  behind: 'Behind',
  overdue: 'Overdue',
};

export function FinancialTracker() {
  const qc = useQueryClient();
  const { data: goals, isLoading } = useQuery({
    queryKey: ['financial', 'goals'],
    queryFn: financialService.getGoals,
    staleTime: 5 * 60 * 1000,
  });

  const createGoal = useMutation({
    mutationFn: financialService.createGoal,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['financial', 'goals'] }); },
  });

  const updateGoal = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FinancialGoal> }) =>
      financialService.updateGoal(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['financial', 'goals'] }); },
  });

  const deleteGoal = useMutation({
    mutationFn: financialService.deleteGoal,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['financial', 'goals'] }); },
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [form, setForm] = useState({ title: '', targetAmount: '', currency: 'USD', deadline: '' });

  const handleCreate = async () => {
    await createGoal.mutateAsync({
      title: form.title,
      targetAmount: Number(form.targetAmount),
      currency: form.currency,
      deadline: new Date(form.deadline).toISOString(),
    });
    setShowForm(false);
    setForm({ title: '', targetAmount: '', currency: 'USD', deadline: '' });
  };

  const handleUpdateAmount = async (id: string) => {
    await updateGoal.mutateAsync({ id, data: { currentAmount: Number(editAmount) } });
    setEditingId(null);
    setEditAmount('');
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Goals</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Track your financial independence journey</p>
        </div>
        <Button onClick={() => setShowForm(true)}>Add Goal</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />)}
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-4">
            {goals?.map((goal) => {
              const status = getGoalStatus(goal);
              const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              return (
                <motion.div key={goal.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Card>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{goal.title}</h3>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${statusColors[status]}`}>
                            {statusLabels[status]}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                          {goal.currency} {goal.currentAmount.toLocaleString()} / {goal.currency} {goal.targetAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          Deadline: {new Date(goal.deadline).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          className="text-xs px-2 py-1"
                          onClick={() => {
                            setEditingId(goal.id);
                            setEditAmount(String(goal.currentAmount));
                          }}
                        >
                          Update
                        </Button>
                        <Button variant="danger" className="text-xs px-2 py-1" onClick={() => deleteGoal.mutate(goal.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                        <span>{progress.toFixed(1)}%</span>
                        <span>{goal.currency} {(goal.targetAmount - goal.currentAmount).toLocaleString()} remaining</span>
                      </div>
                      <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${statusColors[status]}`}
                        />
                      </div>
                    </div>

                    {/* Inline edit amount */}
                    <AnimatePresence>
                      {editingId === goal.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 overflow-hidden"
                        >
                          <div className="flex items-end gap-2 border-t border-[hsl(var(--border))] pt-3">
                            <div className="flex-1">
                              <Input
                                label="Current Amount"
                                type="number"
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                              />
                            </div>
                            <Button onClick={() => handleUpdateAmount(goal.id)} isLoading={updateGoal.isPending}>
                              Save
                            </Button>
                            <Button variant="secondary" onClick={() => setEditingId(null)}>
                              Cancel
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
            {goals?.length === 0 && (
              <p className="py-8 text-center text-[hsl(var(--muted-foreground))]">No financial goals yet. Add one to get started.</p>
            )}
          </div>
        </AnimatePresence>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Financial Goal">
        <div className="space-y-3">
          <Input label="Goal Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="Target Amount" type="number" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} required />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Currency</label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2.5 text-sm"
            >
              {currencies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <Input label="Deadline" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleCreate} isLoading={createGoal.isPending}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

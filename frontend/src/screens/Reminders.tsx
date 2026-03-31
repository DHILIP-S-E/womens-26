import { useState } from 'react';
import { useReminders, useCreateReminder, useDeleteReminder } from '../hooks/useHealthData';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';

export function Reminders() {
  const { data: reminders, isLoading } = useReminders();
  const createReminder = useCreateReminder();
  const deleteReminder = useDeleteReminder();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'custom', title: '', description: '', scheduledTime: '', frequency: 'once', notificationMethod: 'sms' });

  const handleCreate = async () => {
    await createReminder.mutateAsync({
      type: form.type,
      title: form.title,
      description: form.description,
      scheduledTime: new Date(form.scheduledTime).toISOString(),
      frequency: form.frequency,
      notificationMethod: form.notificationMethod,
    });
    setShowForm(false);
    setForm({ type: 'custom', title: '', description: '', scheduledTime: '', frequency: 'once', notificationMethod: 'sms' });
  };

  const typeLabels: Record<string, string> = { period_alert: 'Period Alert', medication: 'Medication', custom: 'Custom' };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reminders</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Manage your health reminders</p>
        </div>
        <Button onClick={() => setShowForm(true)}>Add Reminder</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />)}
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {reminders?.map((reminder) => (
              <motion.div key={reminder.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{reminder.title}</h3>
                        <span className="rounded-full bg-[hsl(var(--accent))] px-2 py-0.5 text-xs text-[hsl(var(--accent-foreground))]">
                          {typeLabels[reminder.type] || reminder.type}
                        </span>
                        <span className="rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-xs capitalize">
                          {reminder.frequency}
                        </span>
                      </div>
                      {reminder.description && <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{reminder.description}</p>}
                      <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                        Scheduled: {new Date(reminder.scheduledTime).toLocaleString()} | Via: {reminder.notificationMethod}
                      </p>
                    </div>
                    <Button variant="danger" onClick={() => deleteReminder.mutate(reminder.id)} className="text-xs px-2 py-1">
                      Delete
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
            {reminders?.length === 0 && <p className="py-8 text-center text-[hsl(var(--muted-foreground))]">No active reminders</p>}
          </div>
        </AnimatePresence>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Reminder">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2.5 text-sm">
              <option value="period_alert">Period Alert</option>
              <option value="medication">Medication</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Scheduled Time" type="datetime-local" value={form.scheduledTime} onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">Frequency</label>
              <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2.5 text-sm">
                <option value="once">Once</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">Method</label>
              <select value={form.notificationMethod} onChange={(e) => setForm({ ...form, notificationMethod: e.target.value })} className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2.5 text-sm">
                <option value="sms">SMS</option>
                <option value="email">Email</option>
                <option value="push">Push</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleCreate} isLoading={createReminder.isPending}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

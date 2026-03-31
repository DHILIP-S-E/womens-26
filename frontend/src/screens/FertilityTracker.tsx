import { useState } from 'react';
import { useFertilityEntries, useCreateFertility, useIvfCycles, useCreateIvf } from '../hooks/useLifecycleData';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';

const MUCUS_TYPES = ['dry', 'sticky', 'creamy', 'watery', 'egg_white', 'not_checked'];
const IVF_STAGES = ['stimulation', 'retrieval', 'fertilisation', 'transfer', 'wait', 'result'] as const;

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export function FertilityTracker() {
  const { data: entries, isLoading } = useFertilityEntries();
  const createFertility = useCreateFertility();
  const { data: ivfCycles } = useIvfCycles();
  const createIvf = useCreateIvf();

  const [showForm, setShowForm] = useState(false);
  const [showIvfForm, setShowIvfForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    bbtTemperature: '36.5',
    ovulationTest: 'not_tested' as 'positive' | 'negative' | 'not_tested',
    cervicalMucus: 'not_checked',
    intercourse: false,
    notes: '',
  });
  const [ivfForm, setIvfForm] = useState({
    cycleName: '',
    currentStage: 'stimulation' as typeof IVF_STAGES[number],
    startDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleCreate = async () => {
    await createFertility.mutateAsync({
      date: form.date,
      bbtTemperature: parseFloat(form.bbtTemperature),
      ovulationTest: form.ovulationTest,
      cervicalMucus: form.cervicalMucus,
      intercourse: form.intercourse,
      notes: form.notes,
    });
    setShowForm(false);
    setForm({ date: new Date().toISOString().split('T')[0], bbtTemperature: '36.5', ovulationTest: 'not_tested', cervicalMucus: 'not_checked', intercourse: false, notes: '' });
  };

  const handleCreateIvf = async () => {
    await createIvf.mutateAsync({
      cycleName: ivfForm.cycleName,
      currentStage: ivfForm.currentStage,
      startDate: ivfForm.startDate,
      notes: ivfForm.notes,
    });
    setShowIvfForm(false);
    setIvfForm({ cycleName: '', currentStage: 'stimulation', startDate: new Date().toISOString().split('T')[0], notes: '' });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fertility Tracker</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Track BBT, ovulation, and IVF cycles</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowIvfForm(true)}>New IVF Cycle</Button>
          <Button onClick={() => setShowForm(true)}>Log Entry</Button>
        </div>
      </div>

      {/* IVF Cycles Pipeline */}
      {ivfCycles && ivfCycles.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-xl font-semibold">IVF Cycles</h2>
          <div className="space-y-4">
            {ivfCycles.map((cycle: any) => (
              <Card key={cycle.id}>
                <p className="mb-3 font-medium">{cycle.cycleName || 'IVF Cycle'} - Started {new Date(cycle.startDate).toLocaleDateString()}</p>
                <div className="flex items-center gap-1">
                  {IVF_STAGES.map((stage, i) => {
                    const stageIndex = IVF_STAGES.indexOf(cycle.currentStage);
                    const isActive = i === stageIndex;
                    const isCompleted = i < stageIndex;
                    return (
                      <div key={stage} className="flex flex-1 items-center">
                        <div className="flex flex-col items-center flex-1">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                              isActive
                                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                                : isCompleted
                                  ? 'bg-green-500 text-white'
                                  : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                            }`}
                          >
                            {isCompleted ? '✓' : i + 1}
                          </div>
                          <span className="mt-1 text-[10px] text-center capitalize text-[hsl(var(--muted-foreground))]">{stage}</span>
                        </div>
                        {i < IVF_STAGES.length - 1 && (
                          <div className={`h-0.5 w-full ${isCompleted ? 'bg-green-500' : 'bg-[hsl(var(--muted))]'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
                {cycle.notes && <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">{cycle.notes}</p>}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Fertility Entries */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />)}
        </div>
      ) : (
        <AnimatePresence>
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {entries?.map((entry: any) => (
              <motion.div key={entry.id} variants={item} layout>
                <Card>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--accent))]">
                        <span className="text-sm font-bold text-[hsl(var(--accent-foreground))]">{entry.bbtTemperature}°</span>
                      </div>
                      <div>
                        <p className="font-medium">{new Date(entry.date).toLocaleDateString()}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className={`rounded-full px-2 py-0.5 text-xs ${
                            entry.ovulationTest === 'positive' ? 'bg-green-100 text-green-800' :
                            entry.ovulationTest === 'negative' ? 'bg-red-100 text-red-800' :
                            'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                          }`}>
                            OPK: {entry.ovulationTest}
                          </span>
                          <span className="rounded-full bg-[hsl(var(--accent))] px-2 py-0.5 text-xs text-[hsl(var(--accent-foreground))] capitalize">
                            CM: {entry.cervicalMucus?.replace('_', ' ')}
                          </span>
                          {entry.intercourse && (
                            <span className="rounded-full bg-[hsl(var(--primary))]/10 px-2 py-0.5 text-xs text-[hsl(var(--primary))]">Intercourse</span>
                          )}
                        </div>
                        {entry.notes && <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{entry.notes}</p>}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
            {entries?.length === 0 && <p className="py-8 text-center text-[hsl(var(--muted-foreground))]">No fertility entries logged</p>}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Log Entry Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Log Fertility Entry">
        <div className="space-y-3">
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          <Input
            label="BBT Temperature (°C)"
            type="number"
            min="35.0"
            max="42.0"
            step="0.01"
            value={form.bbtTemperature}
            onChange={(e) => setForm({ ...form, bbtTemperature: e.target.value })}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Ovulation Test</label>
            <div className="flex gap-2">
              {(['positive', 'negative', 'not_tested'] as const).map((val) => (
                <button
                  key={val}
                  onClick={() => setForm({ ...form, ovulationTest: val })}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    form.ovulationTest === val
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                      : 'border-[hsl(var(--input))] hover:bg-[hsl(var(--muted))]'
                  }`}
                >
                  {val === 'not_tested' ? 'Not Tested' : val.charAt(0).toUpperCase() + val.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Cervical Mucus</label>
            <select
              value={form.cervicalMucus}
              onChange={(e) => setForm({ ...form, cervicalMucus: e.target.value })}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--ring))]"
            >
              {MUCUS_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Intercourse</label>
            <button
              onClick={() => setForm({ ...form, intercourse: !form.intercourse })}
              className={`relative h-6 w-11 rounded-full transition-colors ${form.intercourse ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted))]'}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${form.intercourse ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
          <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleCreate} isLoading={createFertility.isPending}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* IVF Modal */}
      <Modal isOpen={showIvfForm} onClose={() => setShowIvfForm(false)} title="New IVF Cycle">
        <div className="space-y-3">
          <Input label="Cycle Name" value={ivfForm.cycleName} onChange={(e) => setIvfForm({ ...ivfForm, cycleName: e.target.value })} placeholder="e.g. Cycle 1" />
          <Input label="Start Date" type="date" value={ivfForm.startDate} onChange={(e) => setIvfForm({ ...ivfForm, startDate: e.target.value })} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Current Stage</label>
            <select
              value={ivfForm.currentStage}
              onChange={(e) => setIvfForm({ ...ivfForm, currentStage: e.target.value as typeof IVF_STAGES[number] })}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--ring))]"
            >
              {IVF_STAGES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <Input label="Notes" value={ivfForm.notes} onChange={(e) => setIvfForm({ ...ivfForm, notes: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowIvfForm(false)}>Cancel</Button>
            <Button onClick={handleCreateIvf} isLoading={createIvf.isPending}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

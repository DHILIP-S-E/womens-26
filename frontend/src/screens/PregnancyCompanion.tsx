import { useState, useRef, useCallback } from 'react';
import { usePregnancyEntries, useCreatePregnancy, useCreateContraction, useContractions, useKicks, useCreateKick, useCreateBirthPlan } from '../hooks/useLifecycleData';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const PREGNANCY_SYMPTOMS = ['nausea', 'fatigue', 'back_pain', 'swelling', 'heartburn', 'insomnia', 'cramps', 'headache', 'dizziness', 'mood_changes'];

export function PregnancyCompanion() {
  const { data: entries, isLoading } = usePregnancyEntries();
  const createPregnancy = useCreatePregnancy();
  const { data: contractions } = useContractions();
  const createContraction = useCreateContraction();
  const { data: kicks } = useKicks();
  const createKick = useCreateKick();
  const createBirthPlan = useCreateBirthPlan();

  // Weekly logging
  const [showWeekForm, setShowWeekForm] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(20);
  const [weekForm, setWeekForm] = useState({
    week: '20',
    weight: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    symptoms: [] as string[],
    notes: '',
  });

  // Contraction timer
  const [contractionActive, setContractionActive] = useState(false);
  const [contractionStart, setContractionStart] = useState<number | null>(null);
  const [contractionDuration, setContractionDuration] = useState(0);
  const contractionInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Kick counter
  const [kickActive, setKickActive] = useState(false);
  const [kickStart, setKickStart] = useState<number | null>(null);
  const [kickCount, setKickCount] = useState(0);
  const [kickDuration, setKickDuration] = useState(0);
  const kickInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Birth plan
  const [showBirthPlan, setShowBirthPlan] = useState(false);
  const [birthPlan, setBirthPlan] = useState({
    birthLocation: 'hospital',
    painManagement: 'epidural',
    birthPartner: '',
    skinToSkin: true,
    cordClamping: 'delayed',
    feeding: 'breastfeeding',
    additionalNotes: '',
  });
  const [birthPlanSaved, setBirthPlanSaved] = useState(false);

  const handleCreateWeek = async () => {
    await createPregnancy.mutateAsync({
      week: parseInt(weekForm.week),
      weight: weekForm.weight ? parseFloat(weekForm.weight) : undefined,
      bloodPressure: weekForm.bloodPressureSystolic ? `${weekForm.bloodPressureSystolic}/${weekForm.bloodPressureDiastolic}` : undefined,
      symptoms: weekForm.symptoms,
      notes: weekForm.notes,
    });
    setShowWeekForm(false);
    setWeekForm({ week: '20', weight: '', bloodPressureSystolic: '', bloodPressureDiastolic: '', symptoms: [], notes: '' });
  };

  const toggleSymptom = (s: string) => {
    setWeekForm((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(s) ? prev.symptoms.filter((x) => x !== s) : [...prev.symptoms, s],
    }));
  };

  // Contraction timer controls
  const startContraction = useCallback(() => {
    setContractionActive(true);
    setContractionStart(Date.now());
    setContractionDuration(0);
    contractionInterval.current = setInterval(() => {
      setContractionDuration((d) => d + 1);
    }, 1000);
  }, []);

  const stopContraction = useCallback(async () => {
    setContractionActive(false);
    if (contractionInterval.current) clearInterval(contractionInterval.current);
    if (contractionStart) {
      const duration = Math.round((Date.now() - contractionStart) / 1000);
      await createContraction.mutateAsync({
        startTime: new Date(contractionStart).toISOString(),
        endTime: new Date().toISOString(),
        durationSeconds: duration,
      });
    }
    setContractionStart(null);
    setContractionDuration(0);
  }, [contractionStart, createContraction]);

  // Kick counter controls
  const startKickSession = useCallback(() => {
    setKickActive(true);
    setKickStart(Date.now());
    setKickCount(0);
    setKickDuration(0);
    kickInterval.current = setInterval(() => {
      setKickDuration((d) => d + 1);
    }, 1000);
  }, []);

  const recordKick = () => setKickCount((c) => c + 1);

  const stopKickSession = useCallback(async () => {
    setKickActive(false);
    if (kickInterval.current) clearInterval(kickInterval.current);
    if (kickStart) {
      await createKick.mutateAsync({
        startTime: new Date(kickStart).toISOString(),
        endTime: new Date().toISOString(),
        count: kickCount,
        durationSeconds: Math.round((Date.now() - kickStart) / 1000),
      });
    }
    setKickStart(null);
    setKickCount(0);
    setKickDuration(0);
  }, [kickStart, kickCount, createKick]);

  const handleSaveBirthPlan = async () => {
    await createBirthPlan.mutateAsync({ preferences: birthPlan });
    setBirthPlanSaved(true);
    setTimeout(() => setBirthPlanSaved(false), 3000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pregnancy Companion</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Track your pregnancy week by week</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowBirthPlan(true)}>Birth Plan</Button>
          <Button onClick={() => setShowWeekForm(true)}>Log Week</Button>
        </div>
      </div>

      {/* Week Selector */}
      <div className="mb-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
        <h3 className="mb-3 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Pregnancy Timeline</h3>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 42 }, (_, i) => i + 1).map((week) => {
            const hasData = entries?.some((e: any) => e.week === week);
            return (
              <button
                key={week}
                onClick={() => setCurrentWeek(week)}
                className={`flex h-8 w-8 items-center justify-center rounded text-xs font-medium transition-colors ${
                  week === currentWeek
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    : hasData
                      ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]'
                      : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
                }`}
              >
                {week}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contraction Timer + Kick Counter */}
      <motion.div variants={container} initial="hidden" animate="show" className="mb-6 grid gap-6 md:grid-cols-2">
        <motion.div variants={item}>
          <Card title="Contraction Timer">
            <div className="flex flex-col items-center gap-4">
              <p className="text-4xl font-bold text-[hsl(var(--primary))]">{formatTime(contractionDuration)}</p>
              {!contractionActive ? (
                <Button onClick={startContraction}>Start Timing</Button>
              ) : (
                <Button variant="danger" onClick={stopContraction}>Stop</Button>
              )}
              {contractions && contractions.length > 0 && (
                <div className="w-full border-t border-[hsl(var(--border))] pt-3">
                  <p className="mb-2 text-xs font-medium text-[hsl(var(--muted-foreground))]">Recent contractions</p>
                  {contractions.slice(0, 3).map((c: any) => (
                    <p key={c.id} className="text-xs text-[hsl(var(--muted-foreground))]">
                      {new Date(c.startTime).toLocaleTimeString()} - {c.durationSeconds}s
                    </p>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card title="Kick Counter">
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-[hsl(var(--primary))]">{kickCount}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">kicks in {formatTime(kickDuration)}</p>
              </div>
              {!kickActive ? (
                <Button onClick={startKickSession}>Start Session</Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={recordKick}>Tap for Kick</Button>
                  <Button variant="danger" onClick={stopKickSession}>End</Button>
                </div>
              )}
              {kicks && kicks.length > 0 && (
                <div className="w-full border-t border-[hsl(var(--border))] pt-3">
                  <p className="mb-2 text-xs font-medium text-[hsl(var(--muted-foreground))]">Recent sessions</p>
                  {kicks.slice(0, 3).map((k: any) => (
                    <p key={k.id} className="text-xs text-[hsl(var(--muted-foreground))]">
                      {new Date(k.startTime).toLocaleTimeString()} - {k.count} kicks in {k.durationSeconds}s
                    </p>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Weekly Entries */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />)}
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {entries?.map((entry: any) => (
              <motion.div key={entry.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--accent))]">
                      <span className="text-sm font-bold text-[hsl(var(--accent-foreground))]">W{entry.week}</span>
                    </div>
                    <div>
                      <p className="font-medium">Week {entry.week}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {entry.weight && <span className="rounded-full bg-[hsl(var(--accent))] px-2 py-0.5 text-xs text-[hsl(var(--accent-foreground))]">{entry.weight} kg</span>}
                        {entry.bloodPressure && <span className="rounded-full bg-[hsl(var(--accent))] px-2 py-0.5 text-xs text-[hsl(var(--accent-foreground))]">BP: {entry.bloodPressure}</span>}
                        {entry.symptoms?.map((s: string) => (
                          <span key={s} className="rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-xs text-[hsl(var(--muted-foreground))] capitalize">{s.replace('_', ' ')}</span>
                        ))}
                      </div>
                      {entry.notes && <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{entry.notes}</p>}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
            {entries?.length === 0 && <p className="py-8 text-center text-[hsl(var(--muted-foreground))]">No weekly entries logged</p>}
          </div>
        </AnimatePresence>
      )}

      {/* Log Week Modal */}
      <Modal isOpen={showWeekForm} onClose={() => setShowWeekForm(false)} title="Log Weekly Entry">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Week: {weekForm.week}</label>
            <input
              type="range"
              min="1"
              max="42"
              value={weekForm.week}
              onChange={(e) => setWeekForm({ ...weekForm, week: e.target.value })}
              className="w-full accent-[hsl(var(--primary))]"
            />
          </div>
          <Input label="Weight (kg)" type="number" step="0.1" value={weekForm.weight} onChange={(e) => setWeekForm({ ...weekForm, weight: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="BP Systolic" type="number" value={weekForm.bloodPressureSystolic} onChange={(e) => setWeekForm({ ...weekForm, bloodPressureSystolic: e.target.value })} />
            <Input label="BP Diastolic" type="number" value={weekForm.bloodPressureDiastolic} onChange={(e) => setWeekForm({ ...weekForm, bloodPressureDiastolic: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Symptoms</label>
            <div className="flex flex-wrap gap-2">
              {PREGNANCY_SYMPTOMS.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSymptom(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    weekForm.symptoms.includes(s)
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                      : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          <Input label="Notes" value={weekForm.notes} onChange={(e) => setWeekForm({ ...weekForm, notes: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowWeekForm(false)}>Cancel</Button>
            <Button onClick={handleCreateWeek} isLoading={createPregnancy.isPending}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* Birth Plan Modal */}
      <Modal isOpen={showBirthPlan} onClose={() => setShowBirthPlan(false)} title="Birth Plan Builder">
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Birth Location</label>
            <select
              value={birthPlan.birthLocation}
              onChange={(e) => setBirthPlan({ ...birthPlan, birthLocation: e.target.value })}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--ring))]"
            >
              <option value="hospital">Hospital</option>
              <option value="birth_center">Birth Center</option>
              <option value="home">Home</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Pain Management</label>
            <select
              value={birthPlan.painManagement}
              onChange={(e) => setBirthPlan({ ...birthPlan, painManagement: e.target.value })}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--ring))]"
            >
              <option value="epidural">Epidural</option>
              <option value="natural">Natural / Unmedicated</option>
              <option value="nitrous_oxide">Nitrous Oxide</option>
              <option value="open">Open to Options</option>
            </select>
          </div>
          <Input label="Birth Partner" value={birthPlan.birthPartner} onChange={(e) => setBirthPlan({ ...birthPlan, birthPartner: e.target.value })} />
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Immediate Skin-to-Skin</label>
            <button
              onClick={() => setBirthPlan({ ...birthPlan, skinToSkin: !birthPlan.skinToSkin })}
              className={`relative h-6 w-11 rounded-full transition-colors ${birthPlan.skinToSkin ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted))]'}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${birthPlan.skinToSkin ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Cord Clamping</label>
            <select
              value={birthPlan.cordClamping}
              onChange={(e) => setBirthPlan({ ...birthPlan, cordClamping: e.target.value })}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--ring))]"
            >
              <option value="delayed">Delayed</option>
              <option value="immediate">Immediate</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Feeding Preference</label>
            <select
              value={birthPlan.feeding}
              onChange={(e) => setBirthPlan({ ...birthPlan, feeding: e.target.value })}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--ring))]"
            >
              <option value="breastfeeding">Breastfeeding</option>
              <option value="formula">Formula</option>
              <option value="combination">Combination</option>
            </select>
          </div>
          <Input label="Additional Notes" value={birthPlan.additionalNotes} onChange={(e) => setBirthPlan({ ...birthPlan, additionalNotes: e.target.value })} />
          {birthPlanSaved && <p className="text-sm font-medium text-green-600">Birth plan saved successfully.</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowBirthPlan(false)}>Cancel</Button>
            <Button onClick={handleSaveBirthPlan} isLoading={createBirthPlan.isPending}>Save Plan</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

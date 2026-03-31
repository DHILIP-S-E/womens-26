import { useState } from 'react';
import { useEpdsScreenings, useCreateEpds, useFeedingLogs, useCreateFeeding, useBabySleepLogs, useCreateBabySleep } from '../hooks/useLifecycleData';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const EPDS_QUESTIONS = [
  'I have been able to laugh and see the funny side of things',
  'I have looked forward with enjoyment to things',
  'I have blamed myself unnecessarily when things went wrong',
  'I have been anxious or worried for no good reason',
  'I have felt scared or panicky for no very good reason',
  'Things have been getting on top of me',
  'I have been so unhappy that I have had difficulty sleeping',
  'I have felt sad or miserable',
  'I have been so unhappy that I have been crying',
  'The thought of harming myself has occurred to me',
];

const FEEDING_TYPES = ['breast_left', 'breast_right', 'bottle', 'formula'];
const SLEEP_QUALITY = ['poor', 'fair', 'good', 'excellent'];

export function PostpartumHub() {
  const { data: screenings } = useEpdsScreenings();
  const createEpds = useCreateEpds();
  const { data: feedings } = useFeedingLogs();
  const createFeeding = useCreateFeeding();
  const { data: sleepLogs } = useBabySleepLogs();
  const createBabySleep = useCreateBabySleep();

  // EPDS
  const [showEpds, setShowEpds] = useState(false);
  const [epdsAnswers, setEpdsAnswers] = useState<number[]>(Array(10).fill(0));
  const [epdsResult, setEpdsResult] = useState<{ score: number; shown: boolean }>({ score: 0, shown: false });

  // Feeding
  const [showFeedingForm, setShowFeedingForm] = useState(false);
  const [feedingForm, setFeedingForm] = useState({
    type: 'breast_left',
    startTime: '',
    endTime: '',
    latchRating: '3',
  });

  // Baby Sleep
  const [showSleepForm, setShowSleepForm] = useState(false);
  const [sleepForm, setSleepForm] = useState({
    startTime: '',
    endTime: '',
    quality: 'good',
  });

  const handleEpdsSubmit = async () => {
    const score = epdsAnswers.reduce((a, b) => a + b, 0);
    await createEpds.mutateAsync({ answers: epdsAnswers, score });
    setEpdsResult({ score, shown: true });
  };

  const handleFeedingCreate = async () => {
    await createFeeding.mutateAsync({
      type: feedingForm.type,
      startTime: feedingForm.startTime,
      endTime: feedingForm.endTime,
      latchRating: parseInt(feedingForm.latchRating),
    });
    setShowFeedingForm(false);
    setFeedingForm({ type: 'breast_left', startTime: '', endTime: '', latchRating: '3' });
  };

  const handleSleepCreate = async () => {
    await createBabySleep.mutateAsync({
      startTime: sleepForm.startTime,
      endTime: sleepForm.endTime,
      quality: sleepForm.quality,
    });
    setShowSleepForm(false);
    setSleepForm({ startTime: '', endTime: '', quality: 'good' });
  };

  const latestScore = screenings?.[0]?.score ?? null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Postpartum Hub</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Postpartum screening, feeding, and baby sleep tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowSleepForm(true)}>Log Sleep</Button>
          <Button variant="secondary" onClick={() => setShowFeedingForm(true)}>Log Feeding</Button>
          <Button onClick={() => { setShowEpds(true); setEpdsAnswers(Array(10).fill(0)); setEpdsResult({ score: 0, shown: false }); }}>EPDS Screening</Button>
        </div>
      </div>

      {/* Latest EPDS Score + Crisis Resources */}
      {latestScore !== null && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white ${
                latestScore >= 10 ? 'bg-red-500' : 'bg-green-500'
              }`}>
                {latestScore}
              </div>
              <div>
                <p className="font-semibold">Latest EPDS Score: {latestScore}/30</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {latestScore < 10 ? 'Score within normal range' : 'Elevated score - please review crisis resources below'}
                </p>
              </div>
            </div>
            {latestScore >= 10 && (
              <div className="mt-4 rounded-lg border-2 border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
                <p className="font-bold text-red-700 dark:text-red-400">Crisis Resources</p>
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  If you are in immediate danger, please call emergency services.
                </p>
                <div className="mt-2 space-y-1 text-sm">
                  <p><strong>Postpartum Support International:</strong> 1-800-944-4773</p>
                  <p><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
                  <p><strong>National Suicide Prevention Lifeline:</strong> 988</p>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Feeding + Sleep Logs */}
      <motion.div variants={container} initial="hidden" animate="show" className="mb-6 grid gap-6 md:grid-cols-2">
        {/* Feeding Log */}
        <motion.div variants={item}>
          <Card title="Recent Feedings">
            {feedings && feedings.length > 0 ? (
              <div className="space-y-2">
                {feedings.slice(0, 5).map((f: any) => (
                  <div key={f.id} className="flex items-center justify-between rounded-lg bg-[hsl(var(--muted))] p-2">
                    <div>
                      <p className="text-sm font-medium capitalize">{f.type.replace('_', ' ')}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {f.startTime && new Date(f.startTime).toLocaleTimeString()} - {f.endTime && new Date(f.endTime).toLocaleTimeString()}
                      </p>
                    </div>
                    {f.latchRating && (
                      <span className="rounded-full bg-[hsl(var(--accent))] px-2 py-0.5 text-xs text-[hsl(var(--accent-foreground))]">
                        Latch: {f.latchRating}/5
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">No feedings logged</p>
            )}
          </Card>
        </motion.div>

        {/* Baby Sleep Log */}
        <motion.div variants={item}>
          <Card title="Baby Sleep Log">
            {sleepLogs && sleepLogs.length > 0 ? (
              <div className="space-y-2">
                {sleepLogs.slice(0, 5).map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg bg-[hsl(var(--muted))] p-2">
                    <div>
                      <p className="text-sm font-medium">
                        {s.startTime && new Date(s.startTime).toLocaleTimeString()} - {s.endTime && new Date(s.endTime).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${
                      s.quality === 'excellent' || s.quality === 'good'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {s.quality}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">No sleep logs</p>
            )}
          </Card>
        </motion.div>
      </motion.div>

      {/* EPDS Screening History */}
      {screenings && screenings.length > 0 && (
        <div>
          <h2 className="mb-3 text-xl font-semibold">Screening History</h2>
          <AnimatePresence>
            <div className="space-y-3">
              {screenings.map((s: any) => (
                <motion.div key={s.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Card>
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${
                        s.score >= 10 ? 'bg-red-500' : 'bg-green-500'
                      }`}>
                        {s.score}
                      </div>
                      <div>
                        <p className="font-medium">EPDS Score: {s.score}/30</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'Date unknown'}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>
      )}

      {/* EPDS Modal */}
      <Modal isOpen={showEpds} onClose={() => setShowEpds(false)} title="Edinburgh Postnatal Depression Scale">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {!epdsResult.shown ? (
            <>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                For each question, select the answer that best describes how you have felt in the past 7 days.
              </p>
              {EPDS_QUESTIONS.map((q, i) => (
                <div key={i} className="space-y-1.5">
                  <p className="text-sm font-medium">{i + 1}. {q}</p>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3].map((v) => (
                      <button
                        key={v}
                        onClick={() => {
                          const next = [...epdsAnswers];
                          next[i] = v;
                          setEpdsAnswers(next);
                        }}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          epdsAnswers[i] === v
                            ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                            : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={() => setShowEpds(false)}>Cancel</Button>
                <Button onClick={handleEpdsSubmit} isLoading={createEpds.isPending}>Submit</Button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white ${
                epdsResult.score >= 10 ? 'bg-red-500' : 'bg-green-500'
              }`}>
                {epdsResult.score}
              </div>
              <p className="text-lg font-semibold">Your Score: {epdsResult.score}/30</p>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                {epdsResult.score < 10
                  ? 'Your score is within the normal range. Continue monitoring how you feel.'
                  : 'Your score suggests you may be experiencing postnatal depression. Please reach out to a healthcare professional.'}
              </p>
              {epdsResult.score >= 10 && (
                <div className="mt-4 rounded-lg border-2 border-red-300 bg-red-50 p-4 text-left dark:border-red-800 dark:bg-red-950/30">
                  <p className="font-bold text-red-700 dark:text-red-400">You are not alone. Help is available.</p>
                  <div className="mt-2 space-y-1 text-sm text-red-600 dark:text-red-400">
                    <p><strong>Postpartum Support International:</strong> 1-800-944-4773</p>
                    <p><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
                    <p><strong>National Suicide Prevention Lifeline:</strong> 988</p>
                  </div>
                </div>
              )}
              <div className="mt-4">
                <Button onClick={() => setShowEpds(false)}>Close</Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Feeding Modal */}
      <Modal isOpen={showFeedingForm} onClose={() => setShowFeedingForm(false)} title="Log Feeding">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Feeding Type</label>
            <div className="grid grid-cols-2 gap-2">
              {FEEDING_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setFeedingForm({ ...feedingForm, type: t })}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                    feedingForm.type === t
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                      : 'border-[hsl(var(--input))] hover:bg-[hsl(var(--muted))]'
                  }`}
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          <Input label="Start Time" type="datetime-local" value={feedingForm.startTime} onChange={(e) => setFeedingForm({ ...feedingForm, startTime: e.target.value })} />
          <Input label="End Time" type="datetime-local" value={feedingForm.endTime} onChange={(e) => setFeedingForm({ ...feedingForm, endTime: e.target.value })} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Latch Rating: {feedingForm.latchRating}/5</label>
            <input
              type="range"
              min="1"
              max="5"
              value={feedingForm.latchRating}
              onChange={(e) => setFeedingForm({ ...feedingForm, latchRating: e.target.value })}
              className="w-full accent-[hsl(var(--primary))]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowFeedingForm(false)}>Cancel</Button>
            <Button onClick={handleFeedingCreate} isLoading={createFeeding.isPending}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* Baby Sleep Modal */}
      <Modal isOpen={showSleepForm} onClose={() => setShowSleepForm(false)} title="Log Baby Sleep">
        <div className="space-y-3">
          <Input label="Start Time" type="datetime-local" value={sleepForm.startTime} onChange={(e) => setSleepForm({ ...sleepForm, startTime: e.target.value })} />
          <Input label="End Time" type="datetime-local" value={sleepForm.endTime} onChange={(e) => setSleepForm({ ...sleepForm, endTime: e.target.value })} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Sleep Quality</label>
            <div className="flex gap-2">
              {SLEEP_QUALITY.map((q) => (
                <button
                  key={q}
                  onClick={() => setSleepForm({ ...sleepForm, quality: q })}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                    sleepForm.quality === q
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                      : 'border-[hsl(var(--input))] hover:bg-[hsl(var(--muted))]'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowSleepForm(false)}>Cancel</Button>
            <Button onClick={handleSleepCreate} isLoading={createBabySleep.isPending}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

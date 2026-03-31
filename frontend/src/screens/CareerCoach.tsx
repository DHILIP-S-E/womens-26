import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { careerService, type SalaryBenchmark, type BurnoutAssessment } from '../services/career.service';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';

const experienceLevels = ['Junior', 'Mid-level', 'Senior', 'Lead', 'Director', 'Executive'];
const milestoneTypes = [
  { key: 'promotion', label: 'Promotion' },
  { key: 'pay_rise', label: 'Pay Rise' },
  { key: 'new_job', label: 'New Job' },
  { key: 'certification', label: 'Certification' },
  { key: 'other', label: 'Other' },
] as const;

const milestoneIcons: Record<string, string> = {
  promotion: 'M5 10l7-7m0 0l7 7m-7-7v18',
  pay_rise: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  new_job: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  certification: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
  other: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export function CareerCoach() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'salary' | 'milestones' | 'burnout'>('salary');

  // Salary state
  const [salaryForm, setSalaryForm] = useState({ role: '', country: '', experienceLevel: 'Mid-level' });
  const [salaryResult, setSalaryResult] = useState<SalaryBenchmark | null>(null);
  const [salaryLoading, setSalaryLoading] = useState(false);

  const lookupSalary = async () => {
    setSalaryLoading(true);
    try {
      const result = await careerService.getSalary(salaryForm.role, salaryForm.country, salaryForm.experienceLevel);
      setSalaryResult(result);
    } finally {
      setSalaryLoading(false);
    }
  };

  // Milestones
  const { data: milestones, isLoading: milestonesLoading } = useQuery({
    queryKey: ['career', 'milestones'],
    queryFn: careerService.getMilestones,
    enabled: activeTab === 'milestones',
    staleTime: 5 * 60 * 1000,
  });

  const createMilestone = useMutation({
    mutationFn: careerService.createMilestone,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['career', 'milestones'] }); },
  });

  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ type: 'promotion' as string, title: '', description: '', date: '' });

  const handleCreateMilestone = async () => {
    await createMilestone.mutateAsync({
      type: milestoneForm.type as any,
      title: milestoneForm.title,
      description: milestoneForm.description,
      date: new Date(milestoneForm.date).toISOString(),
    });
    setShowMilestoneForm(false);
    setMilestoneForm({ type: 'promotion', title: '', description: '', date: '' });
  };

  // Burnout
  const [burnoutForm, setBurnoutForm] = useState({ exhaustion: 3, cynicism: 3, inefficacy: 3 });
  const [burnoutResult, setBurnoutResult] = useState<BurnoutAssessment | null>(null);

  const submitBurnout = useMutation({
    mutationFn: careerService.submitBurnout,
    onSuccess: (data) => {
      setBurnoutResult(data);
      qc.invalidateQueries({ queryKey: ['career', 'burnout'] });
    },
  });

  const { data: burnoutHistory } = useQuery({
    queryKey: ['career', 'burnout', 'history'],
    queryFn: careerService.getBurnoutHistory,
    enabled: activeTab === 'burnout',
    staleTime: 5 * 60 * 1000,
  });

  const burnoutLevelColors = { low: 'text-green-500', moderate: 'text-yellow-500', high: 'text-red-500' };

  const tabs = [
    { key: 'salary' as const, label: 'Salary Benchmarks' },
    { key: 'milestones' as const, label: 'Career Timeline' },
    { key: 'burnout' as const, label: 'Burnout Check' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Career Coach</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Salary insights, milestones, and wellbeing</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Salary Tab */}
      {activeTab === 'salary' && (
        <div className="space-y-6">
          <Card title="Salary Lookup">
            <div className="grid gap-3 md:grid-cols-3">
              <Input label="Role / Job Title" value={salaryForm.role} onChange={(e) => setSalaryForm({ ...salaryForm, role: e.target.value })} placeholder="e.g. Software Engineer" />
              <Input label="Country" value={salaryForm.country} onChange={(e) => setSalaryForm({ ...salaryForm, country: e.target.value })} placeholder="e.g. United States" />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Experience Level</label>
                <select
                  value={salaryForm.experienceLevel}
                  onChange={(e) => setSalaryForm({ ...salaryForm, experienceLevel: e.target.value })}
                  className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2.5 text-sm"
                >
                  {experienceLevels.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={lookupSalary} isLoading={salaryLoading} disabled={!salaryForm.role || !salaryForm.country}>
                Look Up Salary
              </Button>
            </div>
          </Card>

          <AnimatePresence>
            {salaryResult && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card title="Salary Range">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Minimum</p>
                      <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                        {salaryResult.currency} {salaryResult.minSalary.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Median</p>
                      <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                        {salaryResult.currency} {salaryResult.medianSalary.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Maximum</p>
                      <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                        {salaryResult.currency} {salaryResult.maxSalary.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-center text-xs text-[hsl(var(--muted-foreground))]">
                    {salaryResult.role} - {salaryResult.experienceLevel} - {salaryResult.country}
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Milestones Tab */}
      {activeTab === 'milestones' && (
        <div>
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setShowMilestoneForm(true)}>Add Milestone</Button>
          </div>

          {milestonesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />)}
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 h-full w-0.5 bg-[hsl(var(--border))]" />

              <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
                {milestones?.map((milestone) => (
                  <motion.div key={milestone.id} variants={item} className="relative pl-14">
                    {/* Timeline dot */}
                    <div className="absolute left-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--primary))]">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={milestoneIcons[milestone.type] || milestoneIcons.other} />
                      </svg>
                    </div>
                    <Card>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{milestone.title}</h3>
                        <span className="rounded-full bg-[hsl(var(--accent))] px-2 py-0.5 text-xs text-[hsl(var(--accent-foreground))] capitalize">
                          {milestone.type.replace('_', ' ')}
                        </span>
                      </div>
                      {milestone.description && (
                        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{milestone.description}</p>
                      )}
                      <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                        {new Date(milestone.date).toLocaleDateString()}
                      </p>
                    </Card>
                  </motion.div>
                ))}
                {milestones?.length === 0 && (
                  <p className="py-8 text-center text-[hsl(var(--muted-foreground))]">No milestones yet. Start tracking your career journey.</p>
                )}
              </motion.div>
            </div>
          )}

          <Modal isOpen={showMilestoneForm} onClose={() => setShowMilestoneForm(false)} title="Add Milestone">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Type</label>
                <select
                  value={milestoneForm.type}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, type: e.target.value })}
                  className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2.5 text-sm"
                >
                  {milestoneTypes.map((t) => (
                    <option key={t.key} value={t.key}>{t.label}</option>
                  ))}
                </select>
              </div>
              <Input label="Title" value={milestoneForm.title} onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })} required />
              <Input label="Description" value={milestoneForm.description} onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })} />
              <Input label="Date" type="date" value={milestoneForm.date} onChange={(e) => setMilestoneForm({ ...milestoneForm, date: e.target.value })} required />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={() => setShowMilestoneForm(false)}>Cancel</Button>
                <Button onClick={handleCreateMilestone} isLoading={createMilestone.isPending}>Save</Button>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {/* Burnout Tab */}
      {activeTab === 'burnout' && (
        <div className="space-y-6">
          <Card title="Burnout Self-Assessment">
            <p className="mb-4 text-sm text-[hsl(var(--muted-foreground))]">
              Rate each area from 1 (low) to 7 (high). Higher scores indicate greater concern.
            </p>
            <div className="space-y-4">
              {[
                { key: 'exhaustion' as const, label: 'Emotional Exhaustion', desc: 'How drained do you feel from work?' },
                { key: 'cynicism' as const, label: 'Cynicism / Detachment', desc: 'How disconnected do you feel from your work?' },
                { key: 'inefficacy' as const, label: 'Reduced Efficacy', desc: 'How much has your sense of accomplishment decreased?' },
              ].map((scale) => (
                <div key={scale.key} className="space-y-2">
                  <div>
                    <label className="text-sm font-medium">{scale.label}</label>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{scale.desc}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">1</span>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={burnoutForm[scale.key]}
                      onChange={(e) => setBurnoutForm({ ...burnoutForm, [scale.key]: Number(e.target.value) })}
                      className="flex-1 accent-[hsl(var(--primary))]"
                    />
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">7</span>
                    <span className="w-8 text-center text-sm font-bold text-[hsl(var(--primary))]">{burnoutForm[scale.key]}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button onClick={() => submitBurnout.mutate(burnoutForm)} isLoading={submitBurnout.isPending}>
                Submit Assessment
              </Button>
            </div>
          </Card>

          {/* Result */}
          <AnimatePresence>
            {burnoutResult && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card title="Your Result">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Total Score</p>
                      <p className={`text-3xl font-bold ${burnoutLevelColors[burnoutResult.level]}`}>
                        {burnoutResult.totalScore}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Exhaustion</p>
                      <p className="text-xl font-bold text-[hsl(var(--primary))]">{burnoutResult.exhaustion}/7</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Cynicism</p>
                      <p className="text-xl font-bold text-[hsl(var(--primary))]">{burnoutResult.cynicism}/7</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Inefficacy</p>
                      <p className="text-xl font-bold text-[hsl(var(--primary))]">{burnoutResult.inefficacy}/7</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-lg bg-[hsl(var(--muted))] p-3">
                    <p className={`text-center font-medium ${burnoutLevelColors[burnoutResult.level]}`}>
                      Burnout Level: {burnoutResult.level.charAt(0).toUpperCase() + burnoutResult.level.slice(1)}
                    </p>
                    {burnoutResult.level === 'high' && (
                      <p className="mt-2 text-center text-sm text-red-500">
                        Your score indicates high burnout risk. Consider speaking with a professional or taking steps to reduce workplace stress.
                      </p>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History */}
          {burnoutHistory && burnoutHistory.length > 0 && (
            <Card title="Assessment History">
              <div className="space-y-2">
                {burnoutHistory.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between border-b border-[hsl(var(--border))] py-2 last:border-0">
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">Score: {entry.totalScore}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${burnoutLevelColors[entry.level]}`}>
                        {entry.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

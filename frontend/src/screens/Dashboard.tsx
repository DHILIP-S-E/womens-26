import { useAuth } from '../hooks/useAuth';
import { useCurrentCycle, useMoods, useSymptoms, useReminders } from '../hooks/useHealthData';
import { Card } from '../components/Card';
import { motion } from 'framer-motion';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export function Dashboard() {
  const { user } = useAuth();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const { data: currentCycle } = useCurrentCycle();
  const { data: recentMoods } = useMoods(sevenDaysAgo);
  const { data: recentSymptoms } = useSymptoms(sevenDaysAgo);
  const { data: reminders } = useReminders();

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">
        Welcome back, {user?.firstName}
      </h1>
      <p className="mb-8 text-[hsl(var(--muted-foreground))]">Here's your health overview</p>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Current Cycle */}
        <motion.div variants={item}>
          <Card title="Current Cycle" className="h-full">
            {currentCycle ? (
              <div className="space-y-2">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Started: {new Date(currentCycle.startDate).toLocaleDateString()}
                </p>
                <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                  Day {Math.ceil((Date.now() - new Date(currentCycle.startDate).getTime()) / 86400000)}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Cycle length: {currentCycle.cycleLength} days
                </p>
              </div>
            ) : (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">No active cycle</p>
            )}
          </Card>
        </motion.div>

        {/* Recent Moods */}
        <motion.div variants={item}>
          <Card title="Recent Moods" className="h-full">
            {recentMoods && recentMoods.length > 0 ? (
              <div className="space-y-2">
                <p className="text-2xl font-bold text-[hsl(var(--primary))]">{recentMoods.length}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">entries this week</p>
                <div className="flex flex-wrap gap-1">
                  {recentMoods.slice(0, 5).map((m) => (
                    <span key={m.id} className="rounded-full bg-[hsl(var(--accent))] px-2 py-0.5 text-xs text-[hsl(var(--accent-foreground))]">
                      {m.mood}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">No moods logged this week</p>
            )}
          </Card>
        </motion.div>

        {/* Recent Symptoms */}
        <motion.div variants={item}>
          <Card title="Recent Symptoms" className="h-full">
            {recentSymptoms && recentSymptoms.length > 0 ? (
              <div className="space-y-2">
                <p className="text-2xl font-bold text-[hsl(var(--primary))]">{recentSymptoms.length}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">symptoms this week</p>
                <div className="flex flex-wrap gap-1">
                  {recentSymptoms.slice(0, 5).map((s) => (
                    <span key={s.id} className="rounded-full bg-[hsl(var(--accent))] px-2 py-0.5 text-xs text-[hsl(var(--accent-foreground))]">
                      {s.type} ({s.severity}/10)
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">No symptoms this week</p>
            )}
          </Card>
        </motion.div>

        {/* Reminders */}
        <motion.div variants={item}>
          <Card title="Upcoming Reminders" className="h-full">
            {reminders && reminders.length > 0 ? (
              <div className="space-y-2">
                <p className="text-2xl font-bold text-[hsl(var(--primary))]">{reminders.length}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">active reminders</p>
                {reminders.slice(0, 3).map((r) => (
                  <p key={r.id} className="truncate text-xs text-[hsl(var(--muted-foreground))]">
                    {r.title} - {new Date(r.scheduledTime).toLocaleString()}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">No active reminders</p>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

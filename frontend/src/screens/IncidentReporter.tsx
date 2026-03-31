import { useState, useEffect } from 'react';
import { useNearbyIncidents, useReportIncident } from '../hooks/useSafetyData';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { motion, AnimatePresence } from 'framer-motion';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const incidentTypes = [
  { value: 'catcalling', label: 'Catcalling' },
  { value: 'following', label: 'Following' },
  { value: 'assault', label: 'Assault' },
  { value: 'groping', label: 'Groping' },
  { value: 'other', label: 'Other' },
];

const severityColors: Record<number, string> = {
  1: 'bg-yellow-500/20 text-yellow-600',
  2: 'bg-orange-400/20 text-orange-500',
  3: 'bg-orange-500/20 text-orange-600',
  4: 'bg-red-400/20 text-red-500',
  5: 'bg-red-600/20 text-red-600',
};

export function IncidentReporter() {
  const reportIncident = useReportIncident();

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [form, setForm] = useState({ type: '', severity: 0 });
  const [reported, setReported] = useState(false);

  const { data: nearby } = useNearbyIncidents(location?.latitude ?? null, location?.longitude ?? null);

  // Get location on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => { /* user denied or error - nearby will just not load */ }
    );
  }, []);

  const handleReport = async () => {
    if (!form.type || form.severity === 0) return;
    await reportIncident.mutateAsync({
      type: form.type,
      severity: form.severity,
      latitude: location?.latitude ?? 0,
      longitude: location?.longitude ?? 0,
    });
    setReported(true);
    setTimeout(() => {
      setReported(false);
      setForm({ type: '', severity: 0 });
    }, 3000);
  };

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Report Incident</h1>
      <p className="mb-8 text-[hsl(var(--muted-foreground))]">Quick anonymous incident reporting</p>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6 lg:grid-cols-2">
        {/* Report Form */}
        <motion.div variants={item}>
          <Card title="Quick Report">
            <AnimatePresence mode="wait">
              {reported ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-8"
                >
                  <svg className="mb-4 h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-lg font-semibold">Report Submitted</p>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Thank you for helping keep others safe</p>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                  {/* Step 1: Type */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">What happened?</label>
                    <div className="grid grid-cols-2 gap-2">
                      {incidentTypes.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => setForm({ ...form, type: t.value })}
                          className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                            form.type === t.value
                              ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                              : 'border-[hsl(var(--input))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Severity */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Severity</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          onClick={() => setForm({ ...form, severity: s })}
                          className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-bold transition-colors ${
                            form.severity === s
                              ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                              : 'border-[hsl(var(--input))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">1 = minor, 5 = severe</p>
                  </div>

                  {/* Location indicator */}
                  <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                    <div className={`h-2 w-2 rounded-full ${location ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    {location ? 'Location detected' : 'Getting location...'}
                  </div>

                  {/* Step 3: Submit */}
                  <Button
                    onClick={handleReport}
                    isLoading={reportIncident.isPending}
                    disabled={!form.type || form.severity === 0}
                    className="w-full"
                    variant="danger"
                  >
                    Submit Report
                  </Button>

                  <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
                    Reports are anonymous. No personal data is attached.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Nearby Incidents */}
        <motion.div variants={item}>
          <Card title="Nearby Reports">
            {!location ? (
              <p className="py-4 text-sm text-[hsl(var(--muted-foreground))]">
                Enable location to see nearby incidents
              </p>
            ) : nearby ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-[hsl(var(--muted))] p-4 text-center">
                  <p className="text-3xl font-bold text-[hsl(var(--primary))]">{nearby.count}</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">incidents reported near you</p>
                </div>

                <div className="space-y-2">
                  {nearby.incidents.map((incident) => (
                    <div key={incident.id} className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-3">
                      <div>
                        <p className="text-sm font-medium capitalize">{incident.type}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          {new Date(incident.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${severityColors[incident.severity] || ''}`}>
                        {incident.severity}/5
                      </span>
                    </div>
                  ))}
                  {nearby.incidents.length === 0 && (
                    <p className="py-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
                      No recent incidents near you
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />)}
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

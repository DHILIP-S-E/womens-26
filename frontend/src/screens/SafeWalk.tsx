import { useState, useEffect, useCallback } from 'react';
import { useActiveWalk, useStartWalk, useCompleteWalk, useUpdateWalkLocation } from '../hooks/useSafetyData';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { motion } from 'framer-motion';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Overdue';
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) return `${hours}h ${mins}m remaining`;
  return `${mins}m remaining`;
}

export function SafeWalk() {
  const { data: activeWalk, isLoading } = useActiveWalk();
  const startWalk = useStartWalk();
  const completeWalk = useCompleteWalk();
  const updateLocation = useUpdateWalkLocation();

  const [form, setForm] = useState({ destination: '', expectedArrival: '' });
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Countdown timer for active walk
  useEffect(() => {
    if (!activeWalk || activeWalk.status !== 'active') return;
    const update = () => {
      const remaining = new Date(activeWalk.expectedArrival).getTime() - Date.now();
      setTimeRemaining(remaining);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [activeWalk]);

  // Periodic location update for active walk
  useEffect(() => {
    if (!activeWalk || activeWalk.status !== 'active') return;
    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateLocation.mutate({
            id: activeWalk.id,
            data: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
          });
        },
        () => { /* silently ignore location errors during tracking */ }
      );
    }, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [activeWalk, updateLocation]);

  const handleStart = useCallback(async () => {
    setGettingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 })
      );
      await startWalk.mutateAsync({
        destination: form.destination,
        expectedArrival: new Date(form.expectedArrival).toISOString(),
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setForm({ destination: '', expectedArrival: '' });
    } catch {
      // Fallback without precise location
      await startWalk.mutateAsync({
        destination: form.destination,
        expectedArrival: new Date(form.expectedArrival).toISOString(),
        latitude: 0,
        longitude: 0,
      });
      setForm({ destination: '', expectedArrival: '' });
    } finally {
      setGettingLocation(false);
    }
  }, [form, startWalk]);

  const handleComplete = useCallback(async () => {
    if (!activeWalk) return;
    await completeWalk.mutateAsync(activeWalk.id);
  }, [activeWalk, completeWalk]);

  const handleCopyLink = useCallback(async () => {
    if (!activeWalk?.shareLink) return;
    await navigator.clipboard.writeText(activeWalk.shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [activeWalk]);

  if (isLoading) {
    return (
      <div>
        <h1 className="mb-2 text-3xl font-bold">Safe Walk</h1>
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Safe Walk</h1>
      <p className="mb-8 text-[hsl(var(--muted-foreground))]">Let your contacts track your walk home</p>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {activeWalk && activeWalk.status === 'active' ? (
          /* Active Walk View */
          <motion.div variants={item}>
            <Card className="border-2 border-[hsl(var(--primary))]">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="h-3 w-3 rounded-full bg-[hsl(var(--primary))]"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Walk in Progress</h2>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Walking to {activeWalk.destination}</p>
                  </div>
                </div>

                {/* Timer */}
                <div className="rounded-xl bg-[hsl(var(--muted))] p-6 text-center">
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Expected arrival</p>
                  <p className="text-3xl font-bold">
                    {new Date(activeWalk.expectedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className={`mt-1 text-sm font-medium ${timeRemaining <= 0 ? 'text-[hsl(var(--destructive))]' : 'text-[hsl(var(--primary))]'}`}>
                    {formatTimeRemaining(timeRemaining)}
                  </p>
                </div>

                {/* Share Link */}
                {activeWalk.shareLink && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Share tracking link</label>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={activeWalk.shareLink}
                        className="flex-1 rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2.5 text-sm"
                      />
                      <Button variant="secondary" onClick={handleCopyLink}>
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Complete Button */}
                <Button
                  onClick={handleComplete}
                  isLoading={completeWalk.isPending}
                  className="w-full bg-green-600 text-white hover:bg-green-700"
                >
                  I'm Safe - End Walk
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          /* Start Walk Form */
          <motion.div variants={item}>
            <Card title="Start Safe Walk">
              <div className="space-y-4">
                <Input
                  label="Destination"
                  placeholder="e.g., Home, Office, Friend's house"
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  required
                />
                <Input
                  label="Expected Arrival Time"
                  type="datetime-local"
                  value={form.expectedArrival}
                  onChange={(e) => setForm({ ...form, expectedArrival: e.target.value })}
                  required
                />
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Your current GPS location will be shared when you start the walk.
                  Your trusted contacts will be notified.
                </p>
                <Button
                  onClick={handleStart}
                  isLoading={startWalk.isPending || gettingLocation}
                  disabled={!form.destination || !form.expectedArrival}
                  className="w-full"
                >
                  {gettingLocation ? 'Getting location...' : 'Start Safe Walk'}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Info Card */}
        <motion.div variants={item}>
          <Card>
            <div className="space-y-3">
              <h3 className="font-medium">How Safe Walk works</h3>
              <div className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                <p>1. Enter your destination and expected arrival time</p>
                <p>2. Your trusted contacts will receive a tracking link</p>
                <p>3. Your location is updated every 30 seconds</p>
                <p>4. If you don't mark "I'm Safe" by the expected time, contacts are alerted</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

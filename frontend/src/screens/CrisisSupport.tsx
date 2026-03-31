import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

export function CrisisSupport() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [country, setCountry] = useState((user as any)?.country || 'IN');
  const [speciality, setSpeciality] = useState('');
  const [language, setLanguage] = useState('');

  const { data: resources = [] } = useQuery({
    queryKey: ['crisis-resources', country],
    queryFn: () => api.get(`/mental-health/crisis/resources?country=${country}`).then(r => r.data),
    enabled: !!country,
  });

  const { data: therapists = [] } = useQuery({
    queryKey: ['therapists', country, speciality, language],
    queryFn: () => {
      const params = new URLSearchParams();
      if (country) params.set('country', country);
      if (speciality) params.set('speciality', speciality);
      if (language) params.set('language', language);
      return api.get(`/mental-health/therapists?${params}`).then(r => r.data);
    },
  });

  const { data: favourites = [] } = useQuery({
    queryKey: ['favourite-therapists'],
    queryFn: () => api.get('/mental-health/therapists/favourites').then(r => r.data),
  });

  const favMutation = useMutation({
    mutationFn: (therapistId: string) => api.post(`/mental-health/therapists/${therapistId}/favourite`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favourite-therapists'] }),
  });

  const unfavMutation = useMutation({
    mutationFn: (therapistId: string) => api.delete(`/mental-health/therapists/${therapistId}/favourite`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favourite-therapists'] }),
  });

  const favIds = new Set(favourites.map((f: any) => f.therapistId));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold mb-6">Crisis Support & Therapy</h1>

      {/* Crisis Resources */}
      <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6 mb-6">
        <h2 className="text-lg font-bold text-red-800 mb-3">Emergency Crisis Lines</h2>
        <p className="text-sm text-red-700 mb-4">If you are in immediate danger, call emergency services.</p>
        <div className="grid gap-3">
          {resources.filter((r: any) => r.type === 'crisis_line' || r.type === 'hotline').map((r: any) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
              <div>
                <p className="font-medium text-red-800">{r.name}</p>
                <p className="text-sm text-red-600">{r.description}</p>
              </div>
              {r.phone && (
                <a href={`tel:${r.phone}`} className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
                  Call {r.phone}
                </a>
              )}
            </div>
          ))}
          {resources.length === 0 && <p className="text-sm text-red-600">No resources found for this country. Try changing the country filter.</p>}
        </div>
      </div>

      {/* Other Resources */}
      <div className="rounded-lg border border-[hsl(var(--border))] p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Support Resources</h2>
        <div className="grid gap-3">
          {resources.filter((r: any) => r.type !== 'crisis_line' && r.type !== 'hotline').map((r: any) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-4">
              <div>
                <p className="font-medium">{r.name}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{r.type.replace('_', ' ')} - {r.description}</p>
              </div>
              <div className="flex gap-2">
                {r.phone && <a href={`tel:${r.phone}`} className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-[hsl(var(--muted))]">Call</a>}
                {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer" className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-[hsl(var(--muted))]">Visit</a>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Therapist Directory */}
      <div className="rounded-lg border border-[hsl(var(--border))] p-6">
        <h2 className="text-lg font-semibold mb-4">Find a Therapist</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium mb-1">Country</label>
            <input value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. IN" className="w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Speciality</label>
            <select value={speciality} onChange={e => setSpeciality(e.target.value)} className="w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm">
              <option value="">All</option>
              <option value="therapist">Therapist</option>
              <option value="gynaecologist">Gynaecologist</option>
              <option value="menopause_specialist">Menopause Specialist</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Language</label>
            <input value={language} onChange={e => setLanguage(e.target.value)} placeholder="e.g. en" className="w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="space-y-3">
          {therapists.map((t: any) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{t.name}</p>
                  {t.isVerified && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Verified</span>}
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {t.speciality} {t.isOnline && '| Online'} {t.isInPerson && '| In-person'} {t.costRange && `| ${t.costRange}`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => favIds.has(t.id) ? unfavMutation.mutate(t.id) : favMutation.mutate(t.id)}
                  className={`rounded-md px-3 py-1 text-xs font-medium border ${favIds.has(t.id) ? 'bg-[hsl(var(--primary))] text-white' : 'hover:bg-[hsl(var(--muted))]'}`}
                >
                  {favIds.has(t.id) ? 'Saved' : 'Save'}
                </button>
                {t.bookingUrl && <a href={t.bookingUrl} target="_blank" rel="noopener noreferrer" className="rounded-md bg-[hsl(var(--primary))] px-3 py-1 text-xs font-medium text-white hover:opacity-90">Book</a>}
              </div>
            </div>
          ))}
          {therapists.length === 0 && <p className="text-sm text-[hsl(var(--muted-foreground))]">No therapists found. Try changing filters.</p>}
        </div>
      </div>
    </motion.div>
  );
}

export default CrisisSupport;

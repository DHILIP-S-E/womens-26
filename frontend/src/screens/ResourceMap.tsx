import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { resourceService, type Resource } from '../services/community.service';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { motion } from 'framer-motion';

const resourceTypes = [
  { key: '', label: 'All' },
  { key: 'shelter', label: 'Shelters' },
  { key: 'legal_aid', label: 'Legal Aid' },
  { key: 'clinic', label: 'Clinics' },
  { key: 'food_bank', label: 'Food Banks' },
  { key: 'support_group', label: 'Support Groups' },
];

const typeBadgeColors: Record<string, string> = {
  shelter: 'bg-purple-100 text-purple-800',
  legal_aid: 'bg-blue-100 text-blue-800',
  clinic: 'bg-green-100 text-green-800',
  food_bank: 'bg-orange-100 text-orange-800',
  support_group: 'bg-pink-100 text-pink-800',
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export function ResourceMap() {
  const [typeFilter, setTypeFilter] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [nearbyMode, setNearbyMode] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState('');

  const { data: resources, isLoading } = useQuery({
    queryKey: ['resources', typeFilter, country, city],
    queryFn: () => resourceService.getAll(typeFilter || undefined, country || undefined, city || undefined),
    enabled: !nearbyMode,
    staleTime: 5 * 60 * 1000,
  });

  const { data: nearbyResources, isLoading: nearbyLoading } = useQuery({
    queryKey: ['resources', 'nearby', coords?.lat, coords?.lng],
    queryFn: () => resourceService.getNearby(coords!.lat, coords!.lng),
    enabled: nearbyMode && !!coords,
    staleTime: 5 * 60 * 1000,
  });

  const handleNearMe = () => {
    setGpsError('');
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setNearbyMode(true);
      },
      () => {
        setGpsError('Unable to get your location. Please enable GPS.');
      }
    );
  };

  const displayResources = nearbyMode ? nearbyResources : resources;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Find shelters, legal aid, clinics, and support near you</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleNearMe} variant={nearbyMode ? 'primary' : 'secondary'}>
            <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Near Me
          </Button>
          {nearbyMode && (
            <Button variant="secondary" onClick={() => { setNearbyMode(false); setCoords(null); }}>
              Show All
            </Button>
          )}
        </div>
      </div>

      {gpsError && (
        <div className="mb-4 rounded-lg bg-[hsl(var(--destructive))]/10 p-3 text-sm text-[hsl(var(--destructive))]">
          {gpsError}
        </div>
      )}

      {/* Filters */}
      {!nearbyMode && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {resourceTypes.map((rt) => (
              <button
                key={rt.key}
                onClick={() => setTypeFilter(rt.key)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  typeFilter === rt.key
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
                }`}
              >
                {rt.label}
              </button>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="Country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Filter by country" />
            <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Filter by city" />
          </div>
        </div>
      )}

      {/* Resource list */}
      {(isLoading || nearbyLoading) ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />)}
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2">
          {displayResources?.map((resource: Resource) => (
            <motion.div key={resource.id} variants={item}>
              <Card className="h-full">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium">{resource.name}</h3>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeColors[resource.type] || 'bg-[hsl(var(--muted))]'}`}>
                    {resource.type.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-sm text-[hsl(var(--muted-foreground))]">
                  <p className="flex items-center gap-1.5">
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {resource.address}
                  </p>
                  {resource.phone && (
                    <p className="flex items-center gap-1.5">
                      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${resource.phone}`} className="hover:text-[hsl(var(--primary))]">{resource.phone}</a>
                    </p>
                  )}
                  {resource.link && (
                    <p className="flex items-center gap-1.5">
                      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <a href={resource.link} target="_blank" rel="noopener noreferrer" className="truncate hover:text-[hsl(var(--primary))]">
                        {resource.link}
                      </a>
                    </p>
                  )}
                  {resource.distance !== undefined && (
                    <p className="mt-1 flex items-center gap-1.5 font-medium text-[hsl(var(--primary))]">
                      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      {resource.distance < 1
                        ? `${(resource.distance * 1000).toFixed(0)} m away`
                        : `${resource.distance.toFixed(1)} km away`}
                    </p>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
          {displayResources?.length === 0 && (
            <p className="col-span-full py-8 text-center text-[hsl(var(--muted-foreground))]">No resources found. Try different filters.</p>
          )}
        </motion.div>
      )}
    </div>
  );
}

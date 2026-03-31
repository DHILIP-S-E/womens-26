import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sosService, contactService, walkService, incidentService } from '../services/safety.service';

// SOS
export function useSOSHistory() {
  return useQuery({ queryKey: ['sos', 'history'], queryFn: sosService.getHistory, staleTime: 5 * 60 * 1000 });
}

export function useTriggerSOS() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sosService.trigger,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sos'] }); },
  });
}

// Trusted Contacts
export function useTrustedContacts() {
  return useQuery({ queryKey: ['contacts'], queryFn: contactService.getAll, staleTime: 5 * 60 * 1000 });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: contactService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['contacts'] }); },
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof contactService.update>[1] }) =>
      contactService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['contacts'] }); },
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: contactService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['contacts'] }); },
  });
}

// Safe Walk
export function useActiveWalk() {
  return useQuery({ queryKey: ['walk', 'active'], queryFn: walkService.getActive, staleTime: 30 * 1000 });
}

export function useStartWalk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: walkService.start,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['walk'] }); },
  });
}

export function useUpdateWalkLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { latitude: number; longitude: number } }) =>
      walkService.updateLocation(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['walk'] }); },
  });
}

export function useCompleteWalk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: walkService.complete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['walk'] }); },
  });
}

// Incidents
export function useNearbyIncidents(latitude: number | null, longitude: number | null) {
  return useQuery({
    queryKey: ['incidents', 'nearby', latitude, longitude],
    queryFn: () => incidentService.getNearby(latitude!, longitude!),
    enabled: latitude !== null && longitude !== null,
    staleTime: 5 * 60 * 1000,
  });
}

export function useReportIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: incidentService.report,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['incidents'] }); },
  });
}

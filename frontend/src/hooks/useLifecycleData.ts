import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fertilityService, ivfService, pregnancyService, contractionService,
  kickService, birthPlanService, epdsService, feedingService,
  babySleepService, hotFlashService, griefService, crisisService, therapistService,
} from '../services/lifecycle.service';

// Fertility
export function useFertilityEntries() {
  return useQuery({ queryKey: ['fertility'], queryFn: fertilityService.getAll, staleTime: 5 * 60 * 1000 });
}
export function useCreateFertility() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fertilityService.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['fertility'] }); } });
}

// IVF
export function useIvfCycles() {
  return useQuery({ queryKey: ['ivf'], queryFn: ivfService.getAll, staleTime: 5 * 60 * 1000 });
}
export function useCreateIvf() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ivfService.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['ivf'] }); } });
}

// Pregnancy
export function usePregnancyEntries() {
  return useQuery({ queryKey: ['pregnancy'], queryFn: pregnancyService.getAll, staleTime: 5 * 60 * 1000 });
}
export function useCreatePregnancy() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: pregnancyService.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['pregnancy'] }); } });
}

// Contractions
export function useContractions() {
  return useQuery({ queryKey: ['contractions'], queryFn: contractionService.getAll, staleTime: 5 * 60 * 1000 });
}
export function useCreateContraction() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: contractionService.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['contractions'] }); } });
}

// Kicks
export function useKicks() {
  return useQuery({ queryKey: ['kicks'], queryFn: kickService.getAll, staleTime: 5 * 60 * 1000 });
}
export function useCreateKick() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: kickService.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['kicks'] }); } });
}

// Birth Plan
export function useCreateBirthPlan() {
  return useMutation({ mutationFn: birthPlanService.create });
}

// EPDS
export function useEpdsScreenings() {
  return useQuery({ queryKey: ['epds'], queryFn: epdsService.getAll, staleTime: 5 * 60 * 1000 });
}
export function useCreateEpds() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: epdsService.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['epds'] }); } });
}

// Feeding
export function useFeedingLogs() {
  return useQuery({ queryKey: ['feeding'], queryFn: feedingService.getAll, staleTime: 5 * 60 * 1000 });
}
export function useCreateFeeding() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: feedingService.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['feeding'] }); } });
}

// Baby Sleep
export function useBabySleepLogs() {
  return useQuery({ queryKey: ['baby-sleep'], queryFn: babySleepService.getAll, staleTime: 5 * 60 * 1000 });
}
export function useCreateBabySleep() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: babySleepService.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['baby-sleep'] }); } });
}

// Hot Flashes
export function useHotFlashes() {
  return useQuery({ queryKey: ['hot-flashes'], queryFn: hotFlashService.getAll, staleTime: 5 * 60 * 1000 });
}
export function useCreateHotFlash() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: hotFlashService.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['hot-flashes'] }); } });
}
export function useHotFlashStats() {
  return useQuery({ queryKey: ['hot-flashes', 'stats'], queryFn: hotFlashService.getStats, staleTime: 5 * 60 * 1000 });
}

// Grief
export function useGriefEntries() {
  return useQuery({ queryKey: ['grief'], queryFn: griefService.getAll, staleTime: 5 * 60 * 1000 });
}
export function useCreateGrief() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: griefService.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['grief'] }); } });
}
export function useDeleteGrief() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: griefService.delete, onSuccess: () => { qc.invalidateQueries({ queryKey: ['grief'] }); } });
}

// Crisis
export function useCrisisResources() {
  return useQuery({ queryKey: ['crisis-resources'], queryFn: crisisService.getResources, staleTime: 30 * 60 * 1000 });
}

// Therapists
export function useTherapists(params?: { speciality?: string; country?: string; language?: string; mode?: string }) {
  return useQuery({ queryKey: ['therapists', params], queryFn: () => therapistService.getAll(params), staleTime: 10 * 60 * 1000 });
}
export function useFavouriteTherapist() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: therapistService.favourite, onSuccess: () => { qc.invalidateQueries({ queryKey: ['therapists'] }); } });
}
export function useUnfavouriteTherapist() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: therapistService.unfavourite, onSuccess: () => { qc.invalidateQueries({ queryKey: ['therapists'] }); } });
}

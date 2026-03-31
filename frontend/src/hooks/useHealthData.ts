import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cycleService, symptomService, moodService, reminderService } from '../services/health.service';

// Cycles
export function useCycles() {
  return useQuery({ queryKey: ['cycles'], queryFn: cycleService.getAll, staleTime: 5 * 60 * 1000 });
}

export function useCurrentCycle() {
  return useQuery({ queryKey: ['cycles', 'current'], queryFn: cycleService.getCurrent, staleTime: 5 * 60 * 1000 });
}

export function useCreateCycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cycleService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cycles'] }); },
  });
}

export function useUpdateCycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof cycleService.update>[1] }) =>
      cycleService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cycles'] }); },
  });
}

export function useDeleteCycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cycleService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cycles'] }); },
  });
}

// Symptoms
export function useSymptoms(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['symptoms', startDate, endDate],
    queryFn: () => symptomService.getAll(startDate, endDate),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateSymptom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: symptomService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['symptoms'] }); },
  });
}

export function useUpdateSymptom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof symptomService.update>[1] }) =>
      symptomService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['symptoms'] }); },
  });
}

export function useDeleteSymptom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: symptomService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['symptoms'] }); },
  });
}

// Moods
export function useMoods(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['moods', startDate, endDate],
    queryFn: () => moodService.getAll(startDate, endDate),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateMood() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: moodService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['moods'] }); },
  });
}

export function useUpdateMood() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof moodService.update>[1] }) =>
      moodService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['moods'] }); },
  });
}

export function useDeleteMood() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: moodService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['moods'] }); },
  });
}

// Reminders
export function useReminders() {
  return useQuery({ queryKey: ['reminders'], queryFn: reminderService.getAll, staleTime: 5 * 60 * 1000 });
}

export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reminderService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reminders'] }); },
  });
}

export function useUpdateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof reminderService.update>[1] }) =>
      reminderService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reminders'] }); },
  });
}

export function useDeleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reminderService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reminders'] }); },
  });
}

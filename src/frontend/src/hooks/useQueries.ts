import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Service, StylistProfile, Appointment, UserProfile, HairstyleRecommendation, Salon, RegistrationStatus, Location, CustomizationVariation, BusinessDashboard } from '../backend';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';

export function useGetServices() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getServices();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetStylists() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StylistProfile[]>({
    queryKey: ['stylists'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStylists();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetMyAppointments() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Appointment[]>({
    queryKey: ['myAppointments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyAppointments();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllAppointments() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Appointment[]>({
    queryKey: ['allAppointments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAppointments();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useFilterBookings(searchTerm: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Appointment[]>({
    queryKey: ['filterBookings', searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      return actor.filterBookings(searchTerm);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(userId: Principal) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserProfile(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

export function useBookAppointment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      salonId,
      serviceId,
      stylistId,
      dateTime,
      note,
    }: {
      salonId: string;
      serviceId: string;
      stylistId: string;
      dateTime: bigint;
      note?: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bookAppointment(salonId, serviceId, stylistId, dateTime, note || null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['allAppointments'] });
      toast.success('Appointment booked successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to book appointment: ${error.message}`);
    },
  });
}

export function useCancelAppointment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.cancelAppointment(appointmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['allAppointments'] });
      toast.success('Appointment cancelled successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel appointment: ${error.message}`);
    },
  });
}

export function useConfirmAppointment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.confirmAppointment(appointmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAppointments'] });
      toast.success('Appointment confirmed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to confirm appointment: ${error.message}`);
    },
  });
}

export function useUploadStylingConsultation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      userPhoto,
      selectedStyles,
      aiRecommendations,
    }: {
      appointmentId: string;
      userPhoto: ExternalBlob;
      selectedStyles: HairstyleRecommendation[];
      aiRecommendations: HairstyleRecommendation[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadStylingConsultation(appointmentId, userPhoto, selectedStyles, aiRecommendations);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
      toast.success('Styling consultation uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload consultation: ${error.message}`);
    },
  });
}

export function useGetAllSalons() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Salon[]>({
    queryKey: ['allSalons'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSalons();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddSalon() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (salon: Salon) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSalon(salon);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSalons'] });
      toast.success('Salon added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add salon: ${error.message}`);
    },
  });
}

export function useUpdateSalon() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (salon: Salon) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSalon(salon);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSalons'] });
      toast.success('Salon updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update salon: ${error.message}`);
    },
  });
}

export function useVerifySalon() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      salonId,
      verified,
      status,
    }: {
      salonId: string;
      verified: boolean;
      status: RegistrationStatus;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.verifySalon(salonId, verified, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSalons'] });
      toast.success('Salon verification updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to verify salon: ${error.message}`);
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetBookingStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['bookingStats'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAllBookingStats(null);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUploadHairstylePhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photo: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadHairstylePhoto(photo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myHairstylePhoto'] });
      toast.success('Photo uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload photo: ${error.message}`);
    },
  });
}

export function useGetMyHairstylePhoto() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ExternalBlob | null>({
    queryKey: ['myHairstylePhoto'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyHairstylePhoto();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetCustomizationRecommendations() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (photo: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCustomizationRecommendations(photo);
    },
    onError: (error: Error) => {
      toast.error(`Failed to get recommendations: ${error.message}`);
    },
  });
}

export function useGetSalonDashboard(salonId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<BusinessDashboard>({
    queryKey: ['salonDashboard', salonId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSalonDashboard(salonId);
    },
    enabled: !!actor && !actorFetching && !!salonId,
    retry: false,
  });
}

/**
 * Hook pour gérer les réservations avec optimistic updates
 * L'interface réagit instantanément avant la réponse du serveur
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

interface Reservation {
  id: string;
  status: string;
  [key: string]: any;
}

interface UpdateReservationParams {
  id: string;
  status: string;
  [key: string]: any;
}

/**
 * Hook pour mettre à jour une réservation de manière optimiste
 */
export function useOptimisticUpdateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateReservationParams) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/reservations/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      return response.json();
    },

    // Optimistic update : Met à jour l'interface AVANT la réponse serveur
    onMutate: async (newReservation) => {
      // 1. Annuler les requêtes en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey: ['reservations'] });

      // 2. Snapshot de l'ancien état (pour rollback si erreur)
      const previousReservations = queryClient.getQueryData(['reservations']);

      // 3. Mise à jour optimiste de l'interface
      queryClient.setQueryData(['reservations'], (old: Reservation[] | undefined) => {
        if (!old) return old;

        return old.map(reservation =>
          reservation.id === newReservation.id
            ? { ...reservation, ...newReservation }
            : reservation
        );
      });

      // Afficher un feedback immédiat
      toast.loading('Mise à jour en cours...', { id: newReservation.id });

      // Retourner le context pour le rollback si nécessaire
      return { previousReservations };
    },

    // Si succès : afficher un message de confirmation
    onSuccess: (data, variables) => {
      toast.success('✅ Réservation mise à jour', { id: variables.id });
    },

    // Si erreur : rollback + message d'erreur
    onError: (error, variables, context: any) => {
      // Rollback vers l'ancien état
      if (context?.previousReservations) {
        queryClient.setQueryData(['reservations'], context.previousReservations);
      }

      toast.error('❌ Erreur lors de la mise à jour', { id: variables.id });
    },

    // Dans tous les cas : rafraîchir les données depuis le serveur
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}

/**
 * Hook pour supprimer une réservation de manière optimiste
 */
export function useOptimisticDeleteReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/reservations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      return response.json();
    },

    // Optimistic update : Retire la réservation de la liste immédiatement
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['reservations'] });

      const previousReservations = queryClient.getQueryData(['reservations']);

      // Retirer la réservation de la liste immédiatement
      queryClient.setQueryData(['reservations'], (old: Reservation[] | undefined) => {
        if (!old) return old;
        return old.filter(reservation => reservation.id !== deletedId);
      });

      toast.loading('Suppression en cours...', { id: deletedId });

      return { previousReservations };
    },

    onSuccess: (data, deletedId) => {
      toast.success('✅ Réservation supprimée', { id: deletedId });
    },

    onError: (error, deletedId, context: any) => {
      // Rollback : remettre la réservation
      if (context?.previousReservations) {
        queryClient.setQueryData(['reservations'], context.previousReservations);
      }

      toast.error('❌ Impossible de supprimer', { id: deletedId });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}

/**
 * Hook pour créer une réservation de manière optimiste
 */
export function useOptimisticCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newReservation: Partial<Reservation>) => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newReservation)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création');
      }

      return response.json();
    },

    // Optimistic update : Ajouter la réservation immédiatement (avec un ID temporaire)
    onMutate: async (newReservation) => {
      await queryClient.cancelQueries({ queryKey: ['reservations'] });

      const previousReservations = queryClient.getQueryData(['reservations']);

      // Créer une réservation temporaire avec un ID unique
      const tempReservation = {
        ...newReservation,
        id: `temp-${Date.now()}`,
        status: 'pending'
      };

      // Ajouter à la liste immédiatement
      queryClient.setQueryData(['reservations'], (old: Reservation[] | undefined) => {
        if (!old) return [tempReservation];
        return [tempReservation, ...old];
      });

      toast.loading('Création en cours...', { id: tempReservation.id });

      return { previousReservations, tempId: tempReservation.id };
    },

    onSuccess: (data, variables, context: any) => {
      toast.success('✅ Réservation créée', { id: context.tempId });
    },

    onError: (error, variables, context: any) => {
      if (context?.previousReservations) {
        queryClient.setQueryData(['reservations'], context.previousReservations);
      }

      toast.error('❌ Erreur lors de la création', { id: context?.tempId });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}

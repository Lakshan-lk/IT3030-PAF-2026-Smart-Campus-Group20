import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as notificationApi from '../api/notificationApi';

export function useAllNotifications() {
  return useQuery({
    queryKey: ['notifications', 'all'],
    queryFn: () => notificationApi.getAllNotifications().then((res) => res.data),
  });
}

export function useNotifications(userId) {
  return useQuery({
    queryKey: ['notifications', userId || 'all'],
    queryFn: () => {
      console.log('[useNotifications] Fetching for userId:', userId);
      if (!userId) {
        console.log('[useNotifications] No userId, fetching all');
        return notificationApi.getAllNotifications().then((res) => res.data);
      }
      return notificationApi.getNotifications(userId).then((res) => res.data);
    },
    enabled: true, // Always enabled for debugging
  });
}

export function useUnreadNotifications(userId) {
  return useQuery({
    queryKey: ['notifications', 'unread', userId],
    queryFn: () => notificationApi.getUnreadNotifications(userId).then((res) => res.data),
    enabled: !!userId,
    staleTime: 10000,
  });
}

export function useUnreadCount(userId) {
  return useQuery({
    queryKey: ['notifications', 'unread-count', userId],
    queryFn: () => notificationApi.getUnreadCount(userId).then((res) => res.data),
    enabled: true, // Always enabled
    staleTime: 5000,
    refetchInterval: 10000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId) => notificationApi.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => notificationApi.markAllAsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
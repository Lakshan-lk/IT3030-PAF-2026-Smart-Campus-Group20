import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/userApi';

export function useUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: () => userApi.getAll().then((res) => res.data),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => userApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

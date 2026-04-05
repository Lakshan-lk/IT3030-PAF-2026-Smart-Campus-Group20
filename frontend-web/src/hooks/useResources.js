import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export function useResources(params = {}) {
  return useQuery({
    queryKey: ['resources', params],
    queryFn: () => api.get('/api/v1/resources', { params }).then(res => res.data),
  });
}

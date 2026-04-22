import { useQuery } from '@tanstack/react-query';
import { equipmentApi } from '../api/equipmentApi';

export function useAvailableEquipment(excludeRoomId) {
  return useQuery({
    queryKey: ['equipment', 'available', excludeRoomId],
    queryFn: () => equipmentApi.getAvailableForRoom(excludeRoomId).then(res => res.data),
    enabled: !!excludeRoomId,
  });
}

export function useAllEquipment() {
  return useQuery({
    queryKey: ['equipment', 'all'],
    queryFn: () => equipmentApi.getAll().then(res => res.data),
  });
}

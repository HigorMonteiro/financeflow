import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';

export function useUserPagination() {
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: authService.me,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });

  const itemsPerPage = userData?.user?.itemsPerPage || 50;

  return itemsPerPage;
}


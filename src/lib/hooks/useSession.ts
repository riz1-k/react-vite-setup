import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getErrorMessage } from '../utils';
import { axiosPrivate as axios, type TSession } from './useAxios';
import { useNavigate } from '@tanstack/react-router';

export const userSessionKey = ['user-session'];

export const useSession = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const sessionQuery = useQuery({
    queryKey: userSessionKey,
    queryFn: async () => {
      const res = await axios.post('/auth/refresh-token', null);
      return res.data.data as TSession;
    },
    retry: false,
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  async function signOut() {
    try {
      await axios.post(`/auth/logout`, undefined, {
        params: {
          authMode: 'COOKIE',
        },
        withCredentials: true,
      });
      queryClient.setQueryData(userSessionKey, null);
      void navigate({
        to: '/login',
      });
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  function updateSession(session: TSession | null) {
    queryClient.setQueryData(userSessionKey, session);
  }

  return {
    ...sessionQuery,
    updateSession,
    signOut,
  };
};

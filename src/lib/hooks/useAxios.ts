import axios from 'axios';
import { useEffect } from 'react';

import { useSession } from './useSession';
import { useNavigate } from '@tanstack/react-router';

export const axiosPrivate = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TSession = any;

function useRefreshToken() {
  const session = useSession();
  const navigate = useNavigate();
  return async () => {
    try {
      const response = await axiosPrivate.post('/auth/refresh-token');
      const data = response.data.data as TSession;
      session.updateSession(data);
      return data.accessToken;
    } catch (error) {
      console.log(error);
      await session.signOut();
      void navigate({
        to: '/login',
      });
    }
  };
}

export function useAxios() {
  const refreshToken = useRefreshToken();
  const session = useSession();
  const accessToken = session.data?.accessToken;

  useEffect(() => {
    if (!accessToken) return;
    const requestInterceptor = axiosPrivate.interceptors.request.use(
      (config) => {
        if (config?.headers) {
          if (!config.headers.Authorization)
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      async (error) => {
        return await Promise.reject(error);
      }
    );

    const responseInterceptor = axiosPrivate.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const prevRequest = error.config;
        if (error.response?.status === 403 && !prevRequest.sent) {
          prevRequest.sent = true;
          const newToken = await refreshToken();
          if (newToken) {
            prevRequest.headers.Authorization = `Bearer ${newToken}`;

            return await axiosPrivate(prevRequest);
          }
        }
        return await Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestInterceptor);
      axiosPrivate.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken]);
  return axiosPrivate;
}

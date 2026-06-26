import { useAuth0 } from '@auth0/auth0-react';
import { createApiClient } from '../services/apiClient';

export const useApi = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const getClient = async (isMultipart = false) => {
    const headers: Record<string, string> = {};

    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }

    if (isAuthenticated) {
      try {
        // Retrieve the JWT token silently from Auth0 cache/refresh cycle
        const token = await getAccessTokenSilently();
        headers['Authorization'] = `Bearer ${token}`;
      } catch (err) {
        console.error('Failed to retrieve access token from Auth0:', err);
      }
    }

    return createApiClient(headers);
  };

  return { getClient };
};

export default useApi;

import axios, { AxiosInstance } from 'axios';

const normalizeBaseUrl = (url?: string): string => {
  const value = url?.trim();
  if (!value) return '';
  return value.replace(/\/+$/, '');
};

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);

export const createApiClient = (headers?: Record<string, string>): AxiosInstance => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers,
  });
};

export default createApiClient;

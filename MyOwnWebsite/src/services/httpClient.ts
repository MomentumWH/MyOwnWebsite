import axios, { type AxiosInstance } from "axios";
import { StorageKeys } from "@/constants/storage";

export interface HttpClientOptions {
  baseURL: string;
  apiToken?: string;
  authStorageKey?: string;
}

const getStorageToken = (key: string) => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(key);
};

export const createHttpClient = ({
  baseURL,
  apiToken,
  authStorageKey = StorageKeys.apiToken,
}: HttpClientOptions): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
      ...(apiToken ? { ApiToken: apiToken } : {}),
    },
  });

  client.interceptors.request.use((config) => {
    const token = getStorageToken(authStorageKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response.data,
    (error: unknown) => {
      if (
        axios.isAxiosError(error)
        && error.response?.status === 401
        && typeof window !== "undefined"
      ) {
        window.localStorage.removeItem(authStorageKey);
      }
      return Promise.reject(error);
    },
  );

  return client;
};

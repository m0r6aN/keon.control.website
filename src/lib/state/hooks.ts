/**
 * State Management Hooks
 * React hooks for fetching data with automatic mock fallback
 */

'use client';

import * as React from 'react';
import { useAppState } from './context';
import { ApiError, NetworkError } from '@/lib/api';

export interface UseApiOptions<T> {
  /**
   * Function to fetch data from API
   */
  fetcher: () => Promise<T>;

  /**
   * Fallback mock data when API is unavailable
   */
  mockData: T;

  /**
   * Whether to fetch on mount (default: true)
   */
  enabled?: boolean;

  /**
   * Refetch interval in milliseconds (0 = no auto-refetch)
   */
  refetchInterval?: number;

  /**
   * Callback when data is successfully fetched
   */
  onSuccess?: (data: T) => void;

  /**
   * Callback when fetch fails
   */
  onError?: (error: Error) => void;
}

export interface UseApiResult<T> {
  /**
   * The fetched or mock data
   */
  data: T | null;

  /**
   * Whether data is currently being fetched
   */
  isLoading: boolean;

  /**
   * Error from last fetch attempt
   */
  error: Error | null;

  /**
   * Whether mock data is being used
   */
  isUsingMock: boolean;

  /**
   * Manually trigger a refetch
   */
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching data from API with automatic mock fallback
 */
export function useApi<T>(options: UseApiOptions<T>): UseApiResult<T> {
  const {
    fetcher,
    mockData,
    enabled = true,
    refetchInterval = 0,
    onSuccess,
    onError,
  } = options;

  const { liveMode } = useAppState();

  const [data, setData] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [isUsingMock, setIsUsingMock] = React.useState(!liveMode);

  const fetchData = React.useCallback(async () => {
    if (!enabled) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!liveMode) {
        // In mock mode, use mock data
        setData(mockData);
        setIsUsingMock(true);
        onSuccess?.(mockData);
        return;
      }

      // In live mode, try to fetch from API
      const result = await fetcher();
      setData(result);
      setIsUsingMock(false);
      onSuccess?.(result);
    } catch (err) {
      const apiError = err instanceof Error ? err : new Error('Unknown error');
      setError(apiError);
      onError?.(apiError);

      // Fallback to mock data on network errors
      if (apiError instanceof NetworkError || apiError instanceof ApiError) {
        console.warn('API fetch failed, using mock data:', apiError.message);
        setData(mockData);
        setIsUsingMock(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [enabled, liveMode, fetcher, mockData, onSuccess, onError]);

  // Initial fetch
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refetch interval
  React.useEffect(() => {
    if (refetchInterval > 0 && enabled) {
      const intervalId = setInterval(fetchData, refetchInterval);
      return () => clearInterval(intervalId);
    }
  }, [refetchInterval, enabled, fetchData]);

  return {
    data,
    isLoading,
    error,
    isUsingMock,
    refetch: fetchData,
  };
}

/**
 * Hook for paginated API data
 */
export interface UsePaginatedApiOptions<T> extends UseApiOptions<{ items: T[]; nextPageToken?: string | null }> {
  /**
   * Initial page size
   */
  pageSize?: number;
}

export interface UsePaginatedApiResult<T> extends UseApiResult<{ items: T[]; nextPageToken?: string | null }> {
  /**
   * Load next page
   */
  loadMore: () => Promise<void>;

  /**
   * Whether more pages are available
   */
  hasMore: boolean;

  /**
   * All items loaded so far
   */
  items: T[];
}

export function usePaginatedApi<T>(
  options: UsePaginatedApiOptions<T>
): UsePaginatedApiResult<T> {
  const result = useApi(options);
  const [allItems, setAllItems] = React.useState<T[]>([]);
  const [pageToken, setPageToken] = React.useState<string | null>(null);

  // Accumulate items
  React.useEffect(() => {
    const page = result.data;
    if (page?.items) {
      setAllItems((prev) => [...prev, ...page.items]);
      setPageToken(page.nextPageToken || null);
    }
  }, [result.data]);

  const loadMore = React.useCallback(async () => {
    if (pageToken) {
      await result.refetch();
    }
  }, [pageToken, result]);

  return {
    ...result,
    items: allItems,
    hasMore: Boolean(pageToken),
    loadMore,
  };
}

/**
 * Custom React hooks for optimized data fetching with caching and automatic revalidation
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

// Simple in-memory cache
const cache = new Map<string, CacheEntry<any>>();

interface UseFetchOptions {
    // Cache duration in milliseconds (default: 5 minutes)
    cacheDuration?: number;
    // Whether to refetch on window focus
    refetchOnFocus?: boolean;
    // Whether to refetch on reconnect
    refetchOnReconnect?: boolean;
    // Polling interval in milliseconds (0 = no polling)
    pollingInterval?: number;
}

interface UseFetchResult<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    mutate: (newData: T) => void;
}

/**
 * Optimized data fetching hook with caching, automatic revalidation, and polling
 */
export function useFetch<T>(
    url: string | null,
    options: UseFetchOptions = {}
): UseFetchResult<T> {
    const {
        cacheDuration = 5 * 60 * 1000, // 5 minutes default
        refetchOnFocus = true,
        refetchOnReconnect = true,
        pollingInterval = 0,
    } = options;

    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);

    const fetchData = useCallback(async (skipCache = false) => {
        if (!url) {
            setIsLoading(false);
            return;
        }

        try {
            // Check cache first
            if (!skipCache) {
                const cached = cache.get(url);
                if (cached && Date.now() - cached.timestamp < cacheDuration) {
                    setData(cached.data);
                    setIsLoading(false);
                    setError(null);
                    return;
                }
            }

            setIsLoading(true);
            setError(null);

            const response = await fetch(url, {
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (isMountedRef.current) {
                setData(result);
                setError(null);

                // Update cache
                cache.set(url, {
                    data: result,
                    timestamp: Date.now(),
                });
            }
        } catch (err: any) {
            if (isMountedRef.current) {
                setError(err.message || 'An error occurred');
                console.error('Fetch error:', err);
            }
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [url, cacheDuration]);

    // Manual refetch function
    const refetch = useCallback(async () => {
        await fetchData(true);
    }, [fetchData]);

    // Optimistic update function
    const mutate = useCallback((newData: T) => {
        setData(newData);
        if (url) {
            cache.set(url, {
                data: newData,
                timestamp: Date.now(),
            });
        }
    }, [url]);

    // Initial fetch
    useEffect(() => {
        isMountedRef.current = true;
        fetchData();

        return () => {
            isMountedRef.current = false;
        };
    }, [fetchData]);

    // Polling
    useEffect(() => {
        if (pollingInterval > 0 && url) {
            const poll = () => {
                pollingTimeoutRef.current = setTimeout(async () => {
                    await fetchData();
                    poll();
                }, pollingInterval);
            };

            poll();

            return () => {
                if (pollingTimeoutRef.current) {
                    clearTimeout(pollingTimeoutRef.current);
                }
            };
        }
    }, [pollingInterval, url, fetchData]);

    // Refetch on window focus
    useEffect(() => {
        if (!refetchOnFocus) return;

        const handleFocus = () => {
            fetchData();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [refetchOnFocus, fetchData]);

    // Refetch on reconnect
    useEffect(() => {
        if (!refetchOnReconnect) return;

        const handleOnline = () => {
            fetchData();
        };

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [refetchOnReconnect, fetchData]);

    return { data, isLoading, error, refetch, mutate };
}

/**
 * Clear cache for a specific URL or all cache
 */
export function clearCache(url?: string) {
    if (url) {
        cache.delete(url);
    } else {
        cache.clear();
    }
}

/**
 * Prefetch data and store in cache
 */
export async function prefetch(url: string, cacheDuration: number = 5 * 60 * 1000) {
    try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        cache.set(url, {
            data,
            timestamp: Date.now(),
        });

        // Auto-expire cache
        setTimeout(() => {
            cache.delete(url);
        }, cacheDuration);

        return data;
    } catch (error) {
        console.error('Prefetch error:', error);
        throw error;
    }
}

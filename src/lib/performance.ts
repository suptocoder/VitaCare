/**
 * Performance monitoring utilities for tracking page load times and user interactions
 */

interface PerformanceMetrics {
    name: string;
    duration: number;
    timestamp: number;
}

class PerformanceMonitor {
    private metrics: PerformanceMetrics[] = [];
    private marks: Map<string, number> = new Map();

    /**
     * Start measuring a performance metric
     */
    start(name: string): void {
        this.marks.set(name, performance.now());
    }

    /**
     * End measuring a performance metric
     */
    end(name: string): number | null {
        const startTime = this.marks.get(name);
        if (!startTime) {
            console.warn(`No start mark found for: ${name}`);
            return null;
        }

        const duration = performance.now() - startTime;
        this.metrics.push({
            name,
            duration,
            timestamp: Date.now(),
        });

        this.marks.delete(name);

        // Log slow operations (> 1 second)
        if (duration > 1000) {
            console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
        }

        return duration;
    }

    /**
     * Measure a function execution time
     */
    async measure<T>(name: string, fn: () => Promise<T> | T): Promise<T> {
        this.start(name);
        try {
            const result = await fn();
            this.end(name);
            return result;
        } catch (error) {
            this.end(name);
            throw error;
        }
    }

    /**
     * Get all metrics
     */
    getMetrics(): PerformanceMetrics[] {
        return [...this.metrics];
    }

    /**
     * Get metrics by name
     */
    getMetricsByName(name: string): PerformanceMetrics[] {
        return this.metrics.filter((m) => m.name === name);
    }

    /**
     * Get average duration for a metric
     */
    getAverageDuration(name: string): number {
        const metrics = this.getMetricsByName(name);
        if (metrics.length === 0) return 0;

        const total = metrics.reduce((sum, m) => sum + m.duration, 0);
        return total / metrics.length;
    }

    /**
     * Clear all metrics
     */
    clear(): void {
        this.metrics = [];
        this.marks.clear();
    }

    /**
     * Log performance summary
     */
    logSummary(): void {
        const uniqueNames = [...new Set(this.metrics.map((m) => m.name))];

        console.group('Performance Summary');
        uniqueNames.forEach((name) => {
            const avg = this.getAverageDuration(name);
            const count = this.getMetricsByName(name).length;
            console.log(`${name}: ${avg.toFixed(2)}ms (${count} calls)`);
        });
        console.groupEnd();
    }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for measuring component render time
 */
export function usePerformanceMonitor(componentName: string) {
    if (typeof window !== 'undefined') {
        performanceMonitor.start(`${componentName}-render`);

        // Use setTimeout to measure after render
        setTimeout(() => {
            performanceMonitor.end(`${componentName}-render`);
        }, 0);
    }
}

/**
 * Get Web Vitals metrics
 */
export function getWebVitals() {
    if (typeof window === 'undefined') return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (!navigation) return null;

    return {
        // Time to First Byte
        ttfb: navigation.responseStart - navigation.requestStart,

        // DOM Content Loaded
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,

        // Load Complete
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,

        // Total Load Time
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,

        // DNS Lookup
        dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,

        // TCP Connection
        tcpConnection: navigation.connectEnd - navigation.connectStart,

        // Request Time
        requestTime: navigation.responseEnd - navigation.requestStart,

        // DOM Processing
        domProcessing: navigation.domComplete - navigation.domInteractive,
    };
}

/**
 * Log Web Vitals to console
 */
export function logWebVitals() {
    const vitals = getWebVitals();
    if (!vitals) {
        console.log('Web Vitals not available');
        return;
    }

    console.group('Web Vitals');
    console.log(`TTFB: ${vitals.ttfb.toFixed(2)}ms`);
    console.log(`DOM Content Loaded: ${vitals.domContentLoaded.toFixed(2)}ms`);
    console.log(`Total Load Time: ${vitals.totalLoadTime.toFixed(2)}ms`);
    console.log(`DNS Lookup: ${vitals.dnsLookup.toFixed(2)}ms`);
    console.log(`TCP Connection: ${vitals.tcpConnection.toFixed(2)}ms`);
    console.log(`Request Time: ${vitals.requestTime.toFixed(2)}ms`);
    console.log(`DOM Processing: ${vitals.domProcessing.toFixed(2)}ms`);
    console.groupEnd();
}

// Auto-log web vitals on load (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    window.addEventListener('load', () => {
        setTimeout(logWebVitals, 0);
    });
}

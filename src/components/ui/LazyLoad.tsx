/**
 * Lazy loading wrapper component with loading state
 */

'use client'

import React, { Suspense, ComponentType } from 'react';

interface LazyLoadProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Default loading spinner component
 */
export function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center min-h-[200px]">
            <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
        </div>
    );
}

/**
 * Lazy load wrapper with suspense boundary
 */
export function LazyLoad({ children, fallback = <LoadingSpinner /> }: LazyLoadProps) {
    return <Suspense fallback={fallback}>{children}</Suspense>;
}

/**
 * Higher-order component for lazy loading
 */
export function withLazyLoad<P extends object>(
    Component: ComponentType<P>,
    fallback?: React.ReactNode
) {
    return function LazyLoadedComponent(props: P) {
        return (
            <LazyLoad fallback={fallback}>
                <Component {...props} />
            </LazyLoad>
        );
    };
}

/**
 * Skeleton loader for cards
 */
export function CardSkeleton() {
    return (
        <div className="w-full p-6 bg-white rounded-lg shadow-md animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
        </div>
    );
}

/**
 * Skeleton loader for lists
 */
export function ListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

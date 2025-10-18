import { useState, useEffect, useCallback } from "react";

interface UnsplashImage {
    id: string;
    urls: {
        raw: string;
        small: string;
        regular: string;
        thumb: string;
    };
    alt_description: string;
    user: {
        name: string;
    };
}

interface UnsplashSearchResponse {
    results: UnsplashImage[];
    total: number;
}

// Using serverless function to keep API key secure

// Function to generate properly sized raw URL
export const getSizedImageUrl = (rawUrl: string, size: number): string => {
    return `${rawUrl}&w=${size}&h=${size}&fit=crop&crop=center`;
};

export const useUnsplashSearch = (query: string, debounceMs: number = 1000) => {
    const [images, setImages] = useState<UnsplashImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    console.log("images", images);
    const searchImages = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setImages([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/.netlify/functions/unsplash-search?query=${encodeURIComponent(
                    searchQuery
                )}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: UnsplashSearchResponse = await response.json();
            setImages(data.results);
        } catch (err) {
            console.error("Error searching Unsplash:", err);
            setError(
                err instanceof Error ? err.message : "Failed to search images"
            );
            setImages([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchImages(query);
        }, debounceMs);

        return () => clearTimeout(timeoutId);
    }, [query, debounceMs, searchImages]);

    return {
        images,
        loading,
        error,
        searchImages,
    };
};

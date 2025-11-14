import { useState, useEffect, useCallback } from "react";
import { TierList } from "../types";
import { seedTemplates, getTemplates } from "../utils/seedTemplates";

const STORAGE_KEY = "tierlistify-tier-lists";

export const useTierLists = () => {
    const [tierLists, setTierLists] = useState<TierList[]>([]);
    const [templates, setTemplates] = useState<TierList[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Seed templates and load tier lists from localStorage on mount
    useEffect(() => {
        try {
            // Seed templates on first load
            seedTemplates();
            const loadedTemplates = getTemplates();
            setTemplates(loadedTemplates);

            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsedTierLists = JSON.parse(stored);
                // Convert createdAt strings back to Date objects
                const tierListsWithDates = parsedTierLists.map(
                    (tierList: any) => ({
                        ...tierList,
                        createdAt: new Date(tierList.createdAt),
                    })
                );
                setTierLists(tierListsWithDates);
            }
        } catch (err) {
            console.error("Failed to load tier lists from localStorage:", err);
            setError("Failed to load saved tier lists");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Save tier lists to localStorage whenever tierLists changes
    useEffect(() => {
        if (!isLoading) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(tierLists));
            } catch (err) {
                console.error(
                    "Failed to save tier lists to localStorage:",
                    err
                );
                setError("Failed to save tier lists");
            }
        }
    }, [tierLists, isLoading]);

    const addTierList = useCallback((tierList: TierList) => {
        setTierLists((prev) => [...prev, tierList]);
    }, []);

    const useTemplate = useCallback((template: TierList) => {
        // Create a copy of the template with a new ID and current timestamp
        const newTierList: TierList = {
            ...template,
            id: Date.now().toString(),
            createdAt: new Date(),
            // Reset all items to untiered
            items: template.items.map((item) => ({
                ...item,
                tier: null,
            })),
        };
        addTierList(newTierList);
        return newTierList;
    }, [addTierList]);

    const updateTierList = useCallback(
        (id: string, updates: Partial<TierList>) => {
            setTierLists((prev) =>
                prev.map((tierList) =>
                    tierList.id === id ? { ...tierList, ...updates } : tierList
                )
            );
        },
        []
    );

    const deleteTierList = useCallback((id: string) => {
        setTierLists((prev) => prev.filter((tierList) => tierList.id !== id));
    }, []);

    const getTierListById = useCallback(
        (id: string) => {
            return tierLists.find((tierList) => tierList.id === id);
        },
        [tierLists]
    );

    const clearAllTierLists = useCallback(() => {
        setTierLists([]);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (err) {
            console.error("Failed to clear tier lists from localStorage:", err);
            setError("Failed to clear tier lists");
        }
    }, []);

    // Development utility - clear all data
    const clearAllData = useCallback(() => {
        setTierLists([]);
        try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem("tierlistify-current-tier-list");
        } catch (err) {
            console.error("Failed to clear all data from localStorage:", err);
            setError("Failed to clear all data");
        }
    }, []);

    return {
        tierLists,
        templates,
        isLoading,
        error,
        addTierList,
        updateTierList,
        deleteTierList,
        getTierListById,
        useTemplate,
        clearAllTierLists,
        clearAllData,
    };
};

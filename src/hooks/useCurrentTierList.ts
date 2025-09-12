import { useState, useEffect, useCallback } from "react";
import { TierList } from "../types";

const CURRENT_TIER_LIST_KEY = "tierlistify-current-tier-list";

export const useCurrentTierList = () => {
    const [currentTierList, setCurrentTierList] = useState<Partial<TierList>>(
        {}
    );

    // Load current tier list from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(CURRENT_TIER_LIST_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Convert createdAt string back to Date object if it exists
                if (parsed.createdAt) {
                    parsed.createdAt = new Date(parsed.createdAt);
                }
                setCurrentTierList(parsed);
            }
        } catch (err) {
            console.error(
                "Failed to load current tier list from localStorage:",
                err
            );
        }
    }, []);

    // Save current tier list to localStorage whenever it changes
    useEffect(() => {
        try {
            if (Object.keys(currentTierList).length > 0) {
                localStorage.setItem(
                    CURRENT_TIER_LIST_KEY,
                    JSON.stringify(currentTierList)
                );
            } else {
                localStorage.removeItem(CURRENT_TIER_LIST_KEY);
            }
        } catch (err) {
            console.error(
                "Failed to save current tier list to localStorage:",
                err
            );
        }
    }, [currentTierList]);

    const updateCurrentTierList = useCallback((updates: Partial<TierList>) => {
        setCurrentTierList((prev) => ({ ...prev, ...updates }));
    }, []);

    const clearCurrentTierList = useCallback(() => {
        setCurrentTierList({});
        try {
            localStorage.removeItem(CURRENT_TIER_LIST_KEY);
        } catch (err) {
            console.error(
                "Failed to clear current tier list from localStorage:",
                err
            );
        }
    }, []);

    return {
        currentTierList,
        updateCurrentTierList,
        clearCurrentTierList,
    };
};

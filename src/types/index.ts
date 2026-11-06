export interface Tier {
    id: string;
    name: string;
    color: string;
}

export interface TierItem {
    id: string;
    name: string;
    /** http(s) or data URL. Anything else is treated as an emoji. null = text-only tile. */
    image: string | null;
    /** Attribution line, e.g. the Unsplash photographer. */
    credit?: string;
    /** null = still in the tray. */
    tierId: string | null;
}

export interface PublishedRef {
    id: string;
    /** Secret returned on publish. It is the only way to update or remove the list. */
    token: string;
    author: string;
    at: number;
}

export interface TierList {
    id: string;
    name: string;
    tiers: Tier[];
    items: TierItem[];
    status: "draft" | "done";
    showLabels: boolean;
    createdAt: number;
    updatedAt: number;
    /** Community list this one was started from. */
    forkedFrom?: string;
    published?: PublishedRef;
}

/** Feed entry. Keep in sync with netlify/lib/lists.ts. */
export interface CommunitySummary {
    id: string;
    title: string;
    author: string;
    itemCount: number;
    forks: number;
    createdAt: number;
    updatedAt: number;
}

/** Full published list. Keep in sync with netlify/lib/lists.ts. */
export interface CommunityList extends CommunitySummary {
    tiers: Tier[];
    items: TierItem[];
    forkedFrom?: string;
}

/** A pick from image search. */
export interface ImageResult {
    id: string;
    name: string;
    image: string;
    credit?: string;
    /** Called once when the result is actually used (Unsplash download tracking). */
    onUse?: () => void;
}

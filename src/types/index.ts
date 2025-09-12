export interface TierItem {
    id: string;
    name: string;
    image: string;
    tier?: string | null; // This will now store the tier name, not letter
}

export interface Tier {
    name: string;
    color: string;
}

export interface TierList {
    id: string;
    name: string;
    description: string;
    tiers: Tier[];
    items: TierItem[];
    createdAt: Date;
    icon?: string;
}

export type Screen = "home" | "init" | "creation" | "view";
export type Modal = "item-upload" | "image-search" | null;
export type CreationTab = "build" | "preview";

// Route parameters
export interface RouteParams {
    tierListId?: string;
    modal?: string;
}

export type TierColors = {
    [key: string]: string;
};

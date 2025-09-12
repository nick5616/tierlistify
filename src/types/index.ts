export interface TierItem {
    id: string;
    name: string;
    image: string;
    tier?: string;
}

export interface TierList {
    id: string;
    name: string;
    description: string;
    tiers: string[];
    items: TierItem[];
    createdAt: Date;
    icon?: string;
}

export interface TierColors {
    [key: string]: string;
}

export type Screen = "home" | "init" | "creation" | "view";
export type Modal = "item-upload" | "image-search" | null;
export type CreationTab = "build" | "preview";

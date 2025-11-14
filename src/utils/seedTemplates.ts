import { TierList } from "../types";
import { defaultTierColors } from "../constants";

const TEMPLATES_STORAGE_KEY = "tierlistify-tier-list-templates";

// Default tiers for templates
const defaultTiers = Object.entries(defaultTierColors)
    .filter(([tier]) => tier !== "F")
    .map(([tier, color]) => ({ name: tier, color }));

export const getTemplateTierLists = (): TierList[] => {
    return [
        {
            id: "template-pies",
            name: "Pies",
            description: "Rank your favorite pies",
            icon: "🥧",
            tiers: defaultTiers,
            items: [
                {
                    id: "pie-apple",
                    name: "Apple Pie",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Apple_pie.jpg/800px-Apple_pie.jpg",
                    tier: null,
                },
                {
                    id: "pie-cherry",
                    name: "Cherry Pie",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Cherry_pie_%281%29.jpg/800px-Cherry_pie_%281%29.jpg",
                    tier: null,
                },
                {
                    id: "pie-pumpkin",
                    name: "Pumpkin Pie",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Pumpkin_pie.jpg/800px-Pumpkin_pie.jpg",
                    tier: null,
                },
                {
                    id: "pie-pecan",
                    name: "Pecan Pie",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Pecan_pie.jpg/800px-Pecan_pie.jpg",
                    tier: null,
                },
                {
                    id: "pie-keylime",
                    name: "Key Lime Pie",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Key_Lime_Pie.jpg/800px-Key_Lime_Pie.jpg",
                    tier: null,
                },
                {
                    id: "pie-blueberry",
                    name: "Blueberry Pie",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Blueberry_pie.jpg/800px-Blueberry_pie.jpg",
                    tier: null,
                },
                {
                    id: "pie-lemon",
                    name: "Lemon Meringue Pie",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Lemon_meringue_pie.jpg/800px-Lemon_meringue_pie.jpg",
                    tier: null,
                },
                {
                    id: "pie-strawberry",
                    name: "Strawberry Pie",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Strawberry_pie.jpg/800px-Strawberry_pie.jpg",
                    tier: null,
                },
            ],
            createdAt: new Date(),
        },
        {
            id: "template-spiritual-elements",
            name: "Spiritual Elements",
            description: "Rank the classical elements",
            icon: "✨",
            tiers: defaultTiers,
            items: [
                {
                    id: "spirit-fire",
                    name: "Fire",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Fire_02.jpg/800px-Fire_02.jpg",
                    tier: null,
                },
                {
                    id: "spirit-water",
                    name: "Water",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Ocean_Water.jpg/800px-Ocean_Water.jpg",
                    tier: null,
                },
                {
                    id: "spirit-earth",
                    name: "Earth",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Soil_profile.jpg/800px-Soil_profile.jpg",
                    tier: null,
                },
                {
                    id: "spirit-air",
                    name: "Air",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Clouds_over_the_Atlantic_Ocean.jpg/800px-Clouds_over_the_Atlantic_Ocean.jpg",
                    tier: null,
                },
                {
                    id: "spirit-spirit",
                    name: "Spirit",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Aurora_Borealis.jpg/800px-Aurora_Borealis.jpg",
                    tier: null,
                },
            ],
            createdAt: new Date(),
        },
        {
            id: "template-chemical-elements",
            name: "Chemical Elements",
            description: "Rank the elements",
            icon: "⚛️",
            tiers: defaultTiers,
            items: [
                {
                    id: "element-gold",
                    name: "Gold",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Gold-crystals.jpg/800px-Gold-crystals.jpg",
                    tier: null,
                },
                {
                    id: "element-silver",
                    name: "Silver",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Silver_crystal.jpg/800px-Silver_crystal.jpg",
                    tier: null,
                },
                {
                    id: "element-iron",
                    name: "Iron",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Iron_electrolytic_and_1cm3_cube.jpg/800px-Iron_electrolytic_and_1cm3_cube.jpg",
                    tier: null,
                },
                {
                    id: "element-copper",
                    name: "Copper",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Copper_crystals.jpg/800px-Copper_crystals.jpg",
                    tier: null,
                },
                {
                    id: "element-carbon",
                    name: "Carbon",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Graphite-233436.jpg/800px-Graphite-233436.jpg",
                    tier: null,
                },
                {
                    id: "element-oxygen",
                    name: "Oxygen",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Liquid_oxygen_in_a_beaker_%28cropped_and_retouched%29.jpg/800px-Liquid_oxygen_in_a_beaker_%28cropped_and_retouched%29.jpg",
                    tier: null,
                },
                {
                    id: "element-hydrogen",
                    name: "Hydrogen",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Hydrogen_discharge_tube.jpg/800px-Hydrogen_discharge_tube.jpg",
                    tier: null,
                },
                {
                    id: "element-sulfur",
                    name: "Sulfur",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Sulfur-sample.jpg/800px-Sulfur-sample.jpg",
                    tier: null,
                },
            ],
            createdAt: new Date(),
        },
    ];
};

export const seedTemplates = (): void => {
    try {
        const existing = localStorage.getItem(TEMPLATES_STORAGE_KEY);
        if (!existing) {
            const templates = getTemplateTierLists();
            localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
        }
    } catch (err) {
        console.error("Failed to seed templates:", err);
    }
};

export const getTemplates = (): TierList[] => {
    try {
        const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return parsed.map((template: any) => ({
                ...template,
                createdAt: new Date(template.createdAt),
            }));
        }
    } catch (err) {
        console.error("Failed to load templates:", err);
    }
    return [];
};


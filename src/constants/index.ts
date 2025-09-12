import { TierColors } from "../types";

export const defaultTierColors: TierColors = {
    S: "#ffb3ba",
    A: "#ffdfba",
    B: "#ffffba",
    C: "#baffc9",
    D: "#bae1ff",
    F: "#c9c9ff",
};

export const mockSearchResults = [
    "🍎",
    "🍌",
    "🍊",
    "🍇",
    "🥝",
    "🍓",
    "🥭",
    "🍑",
];

export const animations = {
    fadeIn: {
        animation: "fadeIn 0.3s ease-in-out",
        "@keyframes fadeIn": {
            from: { opacity: 0, transform: "translateY(20px)" },
            to: { opacity: 1, transform: "translateY(0)" },
        },
    },
    slideIn: {
        animation: "slideIn 0.3s ease-out",
        "@keyframes slideIn": {
            from: { transform: "translateX(100%)" },
            to: { transform: "translateX(0)" },
        },
    },
};

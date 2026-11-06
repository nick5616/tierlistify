import type { Tier } from "../types";
import { newId } from "./board";

export const PALETTE = [
    "#ff6b6b",
    "#ff922b",
    "#ffb63b",
    "#ffe066",
    "#a9e34b",
    "#51cf66",
    "#38d9a9",
    "#4dabf7",
    "#748ffc",
    "#b197fc",
    "#f783ac",
    "#adb5bd",
];

const [red, orange, amber, yellow, lime, green, , blue, indigo, violet] =
    PALETTE;

const named = (...pairs: [string, string][]) =>
    pairs.map(([name, color]) => ({ name, color }));

export interface TierPreset {
    id: string;
    label: string;
    tiers: Omit<Tier, "id">[];
}

export const TIER_PRESETS: TierPreset[] = [
    {
        id: "classic",
        label: "S A B C D F",
        tiers: named(
            ["S", red],
            ["A", orange],
            ["B", yellow],
            ["C", lime],
            ["D", green],
            ["F", blue]
        ),
    },
    {
        id: "short",
        label: "S A B C",
        tiers: named(["S", red], ["A", orange], ["B", yellow], ["C", lime]),
    },
    {
        id: "numbers",
        label: "1 to 5",
        tiers: named(
            ["5", red],
            ["4", orange],
            ["3", yellow],
            ["2", lime],
            ["1", blue]
        ),
    },
    {
        id: "god",
        label: "God to Trash",
        tiers: named(
            ["God tier", red],
            ["Great", amber],
            ["Good", yellow],
            ["Okay", lime],
            ["Bad", blue],
            ["Trash", indigo]
        ),
    },
    {
        id: "verdict",
        label: "Love / Like / Meh / Nope",
        tiers: named(
            ["Love", red],
            ["Like", amber],
            ["Meh", lime],
            ["Nope", violet]
        ),
    },
    {
        id: "tried",
        label: "Tried / Want / Never",
        tiers: named(["Loved it", green], ["Want to", amber], ["Never", red]),
    },
];

export const defaultTiers = (): Tier[] =>
    TIER_PRESETS[0].tiers.map((tier) => ({ ...tier, id: newId() }));

import { describe, expect, it } from "vitest";
import type { TierItem } from "../types";
import {
    boardHeight,
    fitTileSize,
    insertionIndex,
    itemsInTier,
    moveItem,
    nudgeItem,
    remapTiers,
    TILE_SIZES,
} from "./board";

const item = (id: string, tierId: string | null = null): TierItem => ({
    id,
    name: id,
    image: null,
    tierId,
});

const order = (items: TierItem[], tierId: string | null) =>
    itemsInTier(items, tierId).map((i) => i.id);

describe("moveItem", () => {
    const items = [item("a", "s"), item("b", "s"), item("c", "a"), item("d")];

    it("appends without an index", () => {
        expect(order(moveItem(items, "d", "s"), "s")).toEqual(["a", "b", "d"]);
    });

    it("inserts at an index", () => {
        expect(order(moveItem(items, "d", "s", 0), "s")).toEqual(["d", "a", "b"]);
        expect(order(moveItem(items, "d", "s", 1), "s")).toEqual(["a", "d", "b"]);
    });

    it("treats the index as a position among the other items", () => {
        expect(order(moveItem(items, "a", "s", 1), "s")).toEqual(["b", "a"]);
        expect(order(moveItem(items, "b", "s", 0), "s")).toEqual(["b", "a"]);
    });

    it("moves into an empty tier", () => {
        expect(order(moveItem(items, "a", "f", 0), "f")).toEqual(["a"]);
    });

    it("sends items back to the tray", () => {
        expect(order(moveItem(items, "a", null, 0), null)).toEqual(["a", "d"]);
    });

    it("never loses or duplicates an item", () => {
        const moved = moveItem(items, "c", "s", 5);
        expect(moved.map((i) => i.id).sort()).toEqual(["a", "b", "c", "d"]);
    });

    it("ignores unknown ids", () => {
        expect(moveItem(items, "zzz", "s")).toBe(items);
    });
});

describe("nudgeItem", () => {
    const items = [item("a", "s"), item("x"), item("b", "s"), item("c", "s")];

    it("moves within the tier, skipping other tiers", () => {
        expect(order(nudgeItem(items, "b", -1), "s")).toEqual(["b", "a", "c"]);
        expect(order(nudgeItem(items, "a", 1), "s")).toEqual(["b", "a", "c"]);
    });

    it("stops at both ends", () => {
        expect(nudgeItem(items, "a", -1)).toBe(items);
        expect(order(nudgeItem(items, "c", 1), "s")).toEqual(["a", "b", "c"]);
    });

    it("does nothing in the tray", () => {
        expect(nudgeItem(items, "x", 1)).toBe(items);
    });
});

describe("remapTiers", () => {
    const list = {
        tiers: [
            { id: "1", name: "S", color: "#000000" },
            { id: "2", name: "A", color: "#000000" },
            { id: "3", name: "B", color: "#000000" },
        ],
        items: [item("a", "1"), item("b", "3")],
    };

    it("keeps placements by position and untiers the rest", () => {
        const next = remapTiers(list, [
            { name: "Top", color: "#111111" },
            { name: "Bottom", color: "#222222" },
        ]);
        expect(next.tiers.map((t) => t.name)).toEqual(["Top", "Bottom"]);
        expect(next.items[0].tierId).toBe("1");
        expect(next.items[1].tierId).toBeNull();
    });
});

describe("insertionIndex", () => {
    const box = (left: number, top: number) => ({
        left,
        top,
        right: left + 50,
        bottom: top + 50,
    });
    const wrapped = [box(0, 0), box(60, 0), box(120, 0), box(0, 60), box(60, 60)];

    it("handles an empty row", () => {
        expect(insertionIndex([], 10, 10)).toBe(0);
    });

    it("picks a slot by the tile's midpoint", () => {
        expect(insertionIndex(wrapped, 10, 20)).toBe(0);
        expect(insertionIndex(wrapped, 40, 20)).toBe(1);
        expect(insertionIndex(wrapped, 170, 20)).toBe(3);
    });

    it("uses the line nearest the pointer in wrapped rows", () => {
        expect(insertionIndex(wrapped, 10, 80)).toBe(3);
        expect(insertionIndex(wrapped, 300, 80)).toBe(5);
    });
});

describe("fitTileSize", () => {
    const input = {
        width: 378,
        height: 440,
        counts: [0, 0, 0, 0, 0, 0],
        labelWidth: 52,
        gap: 3,
        rowGap: 3,
        rowPadding: 3,
    };

    it("uses the largest size that fits", () => {
        const size = fitTileSize(input);
        expect(boardHeight(size, input)).toBeLessThanOrEqual(input.height);
        const larger = TILE_SIZES[TILE_SIZES.indexOf(size) - 1];
        expect(boardHeight(larger, input)).toBeGreaterThan(input.height);
    });

    it("shrinks as a row wraps", () => {
        const crowded = { ...input, counts: [14, 2, 2, 2, 2, 2] };
        expect(fitTileSize(crowded)).toBeLessThan(fitTileSize(input));
    });

    it("bottoms out at the smallest size, which then scrolls", () => {
        const full = { ...input, counts: [40, 40, 40, 40, 40, 40] };
        expect(fitTileSize(full)).toBe(TILE_SIZES[TILE_SIZES.length - 1]);
        expect(boardHeight(fitTileSize(full), full)).toBeGreaterThan(input.height);
    });
});

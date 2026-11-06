import type { Tier, TierItem, TierList } from "../types";

/** crypto.randomUUID only exists in secure contexts, which excludes phones testing over LAN http. */
export const newId = (): string =>
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const itemsInTier = (items: TierItem[], tierId: string | null) =>
    items.filter((item) => item.tierId === tierId);

export const countRanked = (list: Pick<TierList, "items">) =>
    list.items.filter((item) => item.tierId !== null).length;

/**
 * Moves an item into a tier, or into the tray when tierId is null.
 * `index` is the position among that tier's other items. Omit it to append.
 */
export function moveItem(
    items: TierItem[],
    itemId: string,
    tierId: string | null,
    index?: number
): TierItem[] {
    const moving = items.find((item) => item.id === itemId);
    if (!moving) return items;

    const rest = items.filter((item) => item.id !== itemId);
    const siblings = itemsInTier(rest, tierId);
    const next = { ...moving, tierId };

    if (index !== undefined && index < siblings.length) {
        const at = rest.indexOf(siblings[Math.max(0, index)]);
        return [...rest.slice(0, at), next, ...rest.slice(at)];
    }
    if (siblings.length > 0) {
        const at = rest.lastIndexOf(siblings[siblings.length - 1]) + 1;
        return [...rest.slice(0, at), next, ...rest.slice(at)];
    }
    return [...rest, next];
}

/** Shifts an item left or right within its tier. */
export function nudgeItem(
    items: TierItem[],
    itemId: string,
    direction: -1 | 1
): TierItem[] {
    const item = items.find((candidate) => candidate.id === itemId);
    if (!item || item.tierId === null) return items;
    const position = itemsInTier(items, item.tierId).indexOf(item);
    const target = position + direction;
    if (target < 0) return items;
    return moveItem(items, itemId, item.tierId, target);
}

export const resetRanking = (items: TierItem[]): TierItem[] =>
    items.map((item) => ({ ...item, tierId: null }));

/**
 * Replaces the tier set, keeping placements by position so that switching
 * "S A B C" to "1 2 3 4" doesn't throw away work. Items in tiers that no
 * longer exist go back to the tray.
 */
export function remapTiers(
    list: Pick<TierList, "tiers" | "items">,
    preset: Omit<Tier, "id">[]
): Pick<TierList, "tiers" | "items"> {
    const tiers = preset.map((tier, i) => ({
        ...tier,
        id: list.tiers[i]?.id ?? newId(),
    }));
    const kept = new Set(tiers.map((tier) => tier.id));
    return {
        tiers,
        items: list.items.map((item) =>
            item.tierId && !kept.has(item.tierId)
                ? { ...item, tierId: null }
                : item
        ),
    };
}

export interface Box {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

/**
 * Where a dragged tile lands among a tier's tiles. Rows wrap, so first find
 * the visual line nearest the pointer, then the slot within that line.
 */
export function insertionIndex(boxes: Box[], x: number, y: number): number {
    if (boxes.length === 0) return 0;

    const lines: { top: number; bottom: number; start: number; end: number }[] =
        [];
    boxes.forEach((box, i) => {
        const line = lines[lines.length - 1];
        if (line && Math.abs(line.top - box.top) < 4) line.end = i;
        else lines.push({ top: box.top, bottom: box.bottom, start: i, end: i });
    });

    const nearest = lines.reduce((best, line) => {
        const distance = (l: (typeof lines)[number]) =>
            y < l.top ? l.top - y : y > l.bottom ? y - l.bottom : 0;
        return distance(line) < distance(best) ? line : best;
    });

    for (let i = nearest.start; i <= nearest.end; i++) {
        if (x < (boxes[i].left + boxes[i].right) / 2) return i;
    }
    return nearest.end + 1;
}

export interface FitInput {
    width: number;
    height: number;
    /** Items per tier, top to bottom. */
    counts: number[];
    labelWidth: number;
    gap: number;
    rowGap: number;
    rowPadding: number;
}

export const TILE_SIZES = [84, 78, 72, 68, 64, 60, 56, 52, 48, 46];

/** Height all rows need at a given tile size. */
export function boardHeight(size: number, input: FitInput): number {
    const { width, counts, labelWidth, gap, rowGap, rowPadding } = input;
    const inner = width - labelWidth - rowPadding * 2;
    const perLine = Math.max(1, Math.floor((inner + gap) / (size + gap)));
    const rows = counts.map((count) => {
        const lines = Math.max(1, Math.ceil(count / perLine));
        return lines * size + (lines - 1) * gap + rowPadding * 2;
    });
    return (
        rows.reduce((sum, row) => sum + row, 0) +
        Math.max(0, rows.length - 1) * rowGap
    );
}

/**
 * Biggest tile at which every tier stays on screen. Scrolling only happens
 * once the smallest tile no longer fits.
 */
export function fitTileSize(input: FitInput): number {
    return (
        TILE_SIZES.find((size) => boardHeight(size, input) <= input.height) ??
        TILE_SIZES[TILE_SIZES.length - 1]
    );
}

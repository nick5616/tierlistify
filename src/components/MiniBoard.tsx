import { memo } from "react";
import type { Tier, TierItem } from "../types";
import { itemsInTier } from "../lib/board";
import { TileFace } from "./Tile";

interface MiniBoardProps {
    tiers: Tier[];
    items: TierItem[];
    /** Maximum tiles drawn per row. They clip anyway; this skips the wasted images. */
    limit?: number;
}

/** Thumbnail of a list for cards on the dashboard. */
const MiniBoard = memo(function MiniBoard({
    tiers,
    items,
    limit = 7,
}: MiniBoardProps) {
    return (
        <div
            aria-hidden
            className="grid aspect-[4/3] w-full gap-[2px] overflow-hidden rounded-xl bg-canvas p-1"
            style={{ gridTemplateRows: `repeat(${tiers.length}, minmax(0, 1fr))` }}
        >
            {tiers.map((tier) => (
                <div
                    key={tier.id}
                    className="flex min-h-0 gap-px overflow-hidden rounded-[3px] bg-surface"
                >
                    <div
                        className="w-[14%] shrink-0"
                        style={{ background: tier.color }}
                    />
                    {itemsInTier(items, tier.id)
                        .slice(0, limit)
                        .map((item) => (
                            <div
                                key={item.id}
                                className="relative aspect-square h-full shrink-0 overflow-hidden"
                            >
                                <TileFace item={item} size={22} />
                            </div>
                        ))}
                </div>
            ))}
        </div>
    );
});

export default MiniBoard;

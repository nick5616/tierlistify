import type { TierItem, Tier } from "../types";
import { itemsInTier } from "../lib/board";
import { TileFace } from "./Tile";

const labelSize = (name: string) => {
    if (name.length <= 2) return 28;
    if (name.length <= 5) return 16;
    const longestWord = Math.max(...name.split(/\s+/).map((w) => w.length));
    return longestWord <= 8 ? 12 : 10;
};

interface TierTableProps {
    tiers: Tier[];
    items: TierItem[];
    showLabels?: boolean;
}

/** Read-only finished list. */
export default function TierTable({
    tiers,
    items,
    showLabels = true,
}: TierTableProps) {
    const unranked = itemsInTier(items, null);
    const size = 72;

    return (
        <div className="space-y-1">
            {tiers.map((tier) => (
                <section
                    key={tier.id}
                    aria-label={`${tier.name} tier`}
                    className="flex min-h-[76px] overflow-hidden rounded-xl bg-surface"
                >
                    <div
                        className="flex w-16 shrink-0 items-center justify-center p-1 text-center font-display font-extrabold leading-none text-[#121214]"
                        style={{
                            background: tier.color,
                            fontSize: labelSize(tier.name),
                            overflowWrap: "break-word",
                        }}
                    >
                        {tier.name}
                    </div>
                    <ul className="flex flex-1 flex-wrap content-start gap-[3px] p-[2px]">
                        {itemsInTier(items, tier.id).map((item) => (
                            <li
                                key={item.id}
                                title={item.credit}
                                className="relative overflow-hidden rounded-lg"
                                style={{ width: size, height: size }}
                            >
                                <TileFace
                                    item={item}
                                    size={size}
                                    showLabel={showLabels}
                                />
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
            {unranked.length > 0 && (
                <p className="pt-2 text-center text-sm text-muted">
                    {unranked.length} not ranked yet
                </p>
            )}
        </div>
    );
}

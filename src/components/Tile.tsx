import { memo, useState } from "react";
import type { TierItem } from "../types";
import { isImageUrl } from "../lib/image";
import type { DragZone } from "../hooks/useDragEngine";

const hueOf = (text: string) =>
    [...text].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 360, 7);

interface FaceProps {
    item: Pick<TierItem, "name" | "image">;
    size: number;
    showLabel?: boolean;
}

/** What a tile looks like: image, emoji, or a color card with the name. */
export const TileFace = memo(function TileFace({
    item,
    size,
    showLabel = false,
}: FaceProps) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const hasImage = isImageUrl(item.image) && failedSrc !== item.image;

    if (hasImage) {
        return (
            <>
                <img
                    src={item.image!}
                    alt=""
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                    onError={() => setFailedSrc(item.image)}
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition: "50% 20%" }}
                />
                {showLabel && item.name && size >= 52 && (
                    <span
                        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-0.5 pb-[2px] pt-3 text-center font-semibold leading-[1.05] text-white"
                        style={{ fontSize: Math.max(9.5, size * 0.15) }}
                    >
                        <span className="line-clamp-2 [overflow-wrap:anywhere] [text-wrap:balance]">
                            {item.name}
                        </span>
                    </span>
                )}
            </>
        );
    }

    const isEmoji = !!item.image && !isImageUrl(item.image);
    if (isEmoji) {
        return (
            <span
                className="absolute inset-0 flex items-center justify-center bg-raised"
                style={{ fontSize: size * 0.5 }}
            >
                {item.image}
            </span>
        );
    }

    const label = item.name || "?";
    const length = label.length;
    const fontSize =
        length <= 6 ? 0.22 : length <= 12 ? 0.17 : length <= 22 ? 0.145 : 0.125;

    return (
        <span
            className="absolute inset-0 flex items-center justify-center p-[6%] text-center font-semibold leading-[1.1] text-white"
            style={{
                background: `hsl(${hueOf(label)} 32% 28%)`,
                fontSize: Math.max(8, size * fontSize),
                overflowWrap: "break-word",
                hyphens: "auto",
            }}
        >
            {label}
        </span>
    );
});

interface TileProps {
    item: TierItem;
    size: number;
    zone: DragZone;
    showLabel?: boolean;
    selected?: boolean;
    dimmed?: boolean;
    onTap: (id: string) => void;
    tierName?: string;
}

/** A draggable tile. Gestures are handled by useDragEngine on a parent. */
export const Tile = memo(function Tile({
    item,
    size,
    zone,
    showLabel,
    selected,
    dimmed,
    onTap,
    tierName,
}: TileProps) {
    const placement = tierName ? `in ${tierName}` : "unranked";

    return (
        <button
            type="button"
            data-drag-id={item.id}
            data-drag-zone={zone}
            data-tile-id={item.id}
            aria-label={`${item.name || "Item"}, ${placement}`}
            aria-pressed={selected}
            onClick={() => onTap(item.id)}
            onContextMenu={(event) => event.preventDefault()}
            className="tile relative shrink-0 overflow-hidden rounded-lg bg-raised transition-[width,height,opacity] duration-150"
            style={{
                width: size,
                height: size,
                opacity: dimmed ? 0.25 : 1,
                boxShadow: selected
                    ? "0 0 0 2px var(--canvas), 0 0 0 4px var(--accent)"
                    : undefined,
            }}
        >
            <TileFace item={item} size={size} showLabel={showLabel} />
        </button>
    );
});

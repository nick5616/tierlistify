import type { Tier, TierItem } from "../types";
import { itemsInTier } from "./board";
import { corsUrl, isImageUrl } from "./image";

export interface ExportableList {
    name: string;
    tiers: Tier[];
    items: TierItem[];
}

const COLORS = {
    background: "#111113",
    row: "#1d1d21",
    ink: "#f6f5f1",
    muted: "#8b8b93",
    label: "#121214",
};

const FONT = `"Bricolage Grotesque Variable", system-ui, sans-serif`;
const IMAGE_TIMEOUT_MS = 8000;

function load(src: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        const timeout = window.setTimeout(() => resolve(null), IMAGE_TIMEOUT_MS);
        image.onload = () => {
            window.clearTimeout(timeout);
            resolve(image);
        };
        // A failed image becomes a text tile instead of aborting the export.
        image.onerror = () => {
            window.clearTimeout(timeout);
            resolve(null);
        };
        image.src = corsUrl(src);
    });
}

async function loadAll(items: TierItem[]) {
    const entries = await Promise.all(
        items.map(async (item) => {
            const image = isImageUrl(item.image)
                ? await load(item.image)
                : null;
            return [item.id, image] as const;
        })
    );
    return new Map(entries);
}

const hueOf = (text: string) =>
    [...text].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 360, 7);

function wrap(
    context: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    maxLines: number
) {
    const lines: string[] = [];
    let line = "";
    for (const word of text.split(/\s+/)) {
        const candidate = line ? `${line} ${word}` : word;
        if (line && context.measureText(candidate).width > maxWidth) {
            lines.push(line);
            line = word;
        } else {
            line = candidate;
        }
    }
    if (line) lines.push(line);
    return lines.slice(0, maxLines);
}

function drawCentered(
    context: CanvasRenderingContext2D,
    lines: string[],
    centerX: number,
    centerY: number,
    lineHeight: number
) {
    context.textAlign = "center";
    context.textBaseline = "middle";
    const top = centerY - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, i) =>
        context.fillText(line, centerX, top + i * lineHeight)
    );
}

function drawTile(
    context: CanvasRenderingContext2D,
    item: TierItem,
    image: HTMLImageElement | null | undefined,
    x: number,
    y: number,
    size: number
) {
    context.save();
    context.beginPath();
    context.roundRect(x, y, size, size, size * 0.08);
    context.clip();

    if (image) {
        const side = Math.min(image.naturalWidth, image.naturalHeight);
        const offsetX = (image.naturalWidth - side) / 2;
        const offsetY = (image.naturalHeight - side) * 0.2;
        context.drawImage(image, offsetX, offsetY, side, side, x, y, size, size);
    } else {
        const label = item.name || (item.image && !isImageUrl(item.image) ? item.image : "?");
        context.fillStyle = `hsl(${hueOf(label)} 32% 28%)`;
        context.fillRect(x, y, size, size);
        context.fillStyle = COLORS.ink;
        const fontSize = Math.round(size * 0.15);
        context.font = `600 ${fontSize}px ${FONT}`;
        drawCentered(
            context,
            wrap(context, label, size * 0.86, 4),
            x + size / 2,
            y + size / 2,
            fontSize * 1.15
        );
    }
    context.restore();
}

/** Full image for saving: every item shown, rows wrap, height follows content. */
export async function renderPoster(list: ExportableList) {
    const width = 1080;
    const margin = 32;
    const labelWidth = 150;
    const tile = 124;
    const gap = 6;
    const padding = 8;
    const rowGap = 6;
    const headerHeight = 112;
    const footerHeight = 64;

    await document.fonts?.ready;
    const images = await loadAll(list.items);

    const perLine = Math.floor(
        (width - margin * 2 - labelWidth - padding * 2 + gap) / (tile + gap)
    );
    const rows = list.tiers.map((tier) => {
        const items = itemsInTier(list.items, tier.id);
        const lines = Math.max(1, Math.ceil(items.length / perLine));
        return {
            tier,
            items,
            height: lines * tile + (lines - 1) * gap + padding * 2,
        };
    });
    const unranked = itemsInTier(list.items, null);
    const body =
        rows.reduce((sum, row) => sum + row.height + rowGap, 0) - rowGap;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = headerHeight + body + footerHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");

    context.fillStyle = COLORS.background;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = COLORS.ink;
    context.font = `700 44px ${FONT}`;
    context.textAlign = "left";
    context.textBaseline = "middle";
    context.fillText(
        list.name || "Untitled tier list",
        margin,
        headerHeight / 2,
        width - margin * 2
    );

    let y = headerHeight;
    for (const row of rows) {
        const rowWidth = width - margin * 2;

        context.fillStyle = COLORS.row;
        context.beginPath();
        context.roundRect(margin, y, rowWidth, row.height, 12);
        context.fill();

        context.save();
        context.beginPath();
        context.roundRect(margin, y, rowWidth, row.height, 12);
        context.clip();
        context.fillStyle = row.tier.color;
        context.fillRect(margin, y, labelWidth, row.height);
        context.restore();

        context.fillStyle = COLORS.label;
        const fontSize = row.tier.name.length <= 2 ? 64 : 30;
        context.font = `800 ${fontSize}px ${FONT}`;
        drawCentered(
            context,
            wrap(context, row.tier.name, labelWidth - 20, 3),
            margin + labelWidth / 2,
            y + row.height / 2,
            fontSize * 1.1
        );

        row.items.forEach((item, i) => {
            const column = i % perLine;
            const line = Math.floor(i / perLine);
            drawTile(
                context,
                item,
                images.get(item.id),
                margin + labelWidth + padding + column * (tile + gap),
                y + padding + line * (tile + gap),
                tile
            );
        });

        y += row.height + rowGap;
    }

    context.fillStyle = COLORS.muted;
    context.font = `500 24px ${FONT}`;
    context.textAlign = "left";
    context.fillText(
        unranked.length ? `${unranked.length} unranked` : "",
        margin,
        canvas.height - footerHeight / 2
    );
    context.textAlign = "right";
    context.fillText(
        "tierlistify",
        width - margin,
        canvas.height - footerHeight / 2
    );

    return canvas;
}

/** Small fixed-size card for the feed. Rows clip instead of wrapping. */
export async function renderCover(list: ExportableList): Promise<string> {
    const width = 480;
    const height = 360;
    const labelWidth = 60;
    const gap = 3;
    const pad = 10;

    await document.fonts?.ready;
    const ranked = list.items.filter((item) => item.tierId !== null);
    const images = await loadAll(ranked);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");

    context.fillStyle = COLORS.background;
    context.fillRect(0, 0, width, height);

    const rowHeight =
        (height - pad * 2 - (list.tiers.length - 1) * gap) / list.tiers.length;

    list.tiers.forEach((tier, i) => {
        const y = pad + i * (rowHeight + gap);

        context.fillStyle = COLORS.row;
        context.fillRect(pad, y, width - pad * 2, rowHeight);
        context.fillStyle = tier.color;
        context.fillRect(pad, y, labelWidth, rowHeight);

        context.fillStyle = COLORS.label;
        const fontSize = Math.min(
            rowHeight * 0.5,
            tier.name.length <= 2 ? 30 : 13
        );
        context.font = `800 ${fontSize}px ${FONT}`;
        drawCentered(
            context,
            wrap(context, tier.name, labelWidth - 8, 2),
            pad + labelWidth / 2,
            y + rowHeight / 2,
            fontSize * 1.1
        );

        context.save();
        context.beginPath();
        context.rect(pad, y, width - pad * 2, rowHeight);
        context.clip();
        itemsInTier(list.items, tier.id).forEach((item, column) => {
            drawTile(
                context,
                item,
                images.get(item.id),
                pad + labelWidth + gap + column * (rowHeight - 2 + gap),
                y + 1,
                rowHeight - 2
            );
        });
        context.restore();
    });

    return canvas.toDataURL("image/jpeg", 0.7);
}

const toBlob = (canvas: HTMLCanvasElement) =>
    new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
            (blob) =>
                blob ? resolve(blob) : reject(new Error("Export failed")),
            "image/png"
        )
    );

export type SaveResult = "shared" | "downloaded" | "cancelled";

/** Hands the image to the phone's share sheet when possible, otherwise downloads it. */
export async function saveListImage(list: ExportableList): Promise<SaveResult> {
    const blob = await toBlob(await renderPoster(list));
    const fileName = `${
        (list.name || "tier-list")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") || "tier-list"
    }.png`;
    const file = new File([blob], fileName, { type: "image/png" });

    if (navigator.canShare?.({ files: [file] })) {
        try {
            await navigator.share({ files: [file], title: list.name });
            return "shared";
        } catch (error) {
            if ((error as DOMException).name === "AbortError") {
                return "cancelled";
            }
        }
    }

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return "downloaded";
}

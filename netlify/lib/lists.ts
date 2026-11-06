/**
 * Validation for anything entering the public feed. Publishing is anonymous,
 * so nothing from the client is trusted: strings are capped, colors are
 * checked, and images are limited to small inline raster files or the CDNs the
 * app's own search uses. That last rule also stops a published list from
 * making every viewer's browser request an arbitrary third-party URL.
 */

export const LIMITS = {
    title: 80,
    author: 40,
    itemName: 80,
    tierName: 24,
    credit: 120,
    items: 150,
    tiers: 12,
    inlineImageBytes: 96 * 1024,
    coverBytes: 96 * 1024,
};

const IMAGE_HOSTS = new Set([
    "images.unsplash.com",
    "upload.wikimedia.org",
    "thumb.wikimedia.org",
    "s4.anilist.co",
]);

const INLINE_IMAGE = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/;
const COLOR = /^#[0-9a-f]{6}$/i;
const ID = /^[\w-]{1,64}$/;

export interface PublicTier {
    id: string;
    name: string;
    color: string;
}

export interface PublicItem {
    id: string;
    name: string;
    image: string | null;
    credit?: string;
    tierId: string | null;
}

export interface Submission {
    title: string;
    author: string;
    tiers: PublicTier[];
    items: PublicItem[];
    cover: Uint8Array | null;
    forkedFrom?: string;
}

export interface Summary {
    id: string;
    title: string;
    author: string;
    itemCount: number;
    forks: number;
    createdAt: number;
    updatedAt: number;
}

export interface Route {
    id?: string;
    action?: "cover" | "fork";
}

/**
 * Strict on purpose: list ids are always 12 hex characters, so anything else
 * is a 404 and can never reach a store lookup.
 */
export function parseRoute(pathname: string): Route | null {
    const match = /^\/api\/lists(?:\/([a-f0-9]{12})(?:\/(cover|fork))?)?$/.exec(
        pathname
    );
    if (!match) return null;
    return { id: match[1], action: match[2] as Route["action"] };
}

export type Parsed =
    | { ok: true; value: Submission }
    | { ok: false; error: string };

const clean = (value: unknown, max: number): string =>
    typeof value === "string"
        ? value
              // eslint-disable-next-line no-control-regex
              .replace(/[\u0000-\u001f\u007f]/g, " ")
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, max)
        : "";

const base64Bytes = (data: string) =>
    Math.floor((data.length * 3) / 4) - (data.match(/=+$/)?.[0].length ?? 0);

export function cleanImage(value: unknown): string | null {
    if (typeof value !== "string") return null;

    const inline = INLINE_IMAGE.exec(value);
    if (inline) {
        return base64Bytes(inline[2]) <= LIMITS.inlineImageBytes ? value : null;
    }

    try {
        const url = new URL(value);
        return url.protocol === "https:" && IMAGE_HOSTS.has(url.hostname)
            ? url.href
            : null;
    } catch {
        return null;
    }
}

export function decodeCover(value: unknown): Uint8Array | null {
    if (typeof value !== "string") return null;
    const match = /^data:image\/jpeg;base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
    if (!match || base64Bytes(match[1]) > LIMITS.coverBytes) return null;

    const bytes = Uint8Array.from(atob(match[1]), (c) => c.charCodeAt(0));
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    return isJpeg ? bytes : null;
}

export function parseSubmission(body: unknown): Parsed {
    if (typeof body !== "object" || body === null) {
        return { ok: false, error: "Invalid request" };
    }
    const input = body as Record<string, unknown>;

    const title = clean(input.title, LIMITS.title);
    if (!title) return { ok: false, error: "Give your list a title" };

    if (!Array.isArray(input.tiers) || !Array.isArray(input.items)) {
        return { ok: false, error: "Invalid list" };
    }
    if (input.tiers.length === 0 || input.tiers.length > LIMITS.tiers) {
        return { ok: false, error: `Lists can have 1 to ${LIMITS.tiers} tiers` };
    }
    if (input.items.length > LIMITS.items) {
        return {
            ok: false,
            error: `Published lists can have up to ${LIMITS.items} items`,
        };
    }

    const tiers: PublicTier[] = [];
    for (const raw of input.tiers as Record<string, unknown>[]) {
        const id = String(raw?.id ?? "");
        const name = clean(raw?.name, LIMITS.tierName);
        const color = String(raw?.color ?? "");
        if (!ID.test(id) || !name || !COLOR.test(color)) {
            return { ok: false, error: "Invalid tier" };
        }
        tiers.push({ id, name, color });
    }
    const tierIds = new Set(tiers.map((tier) => tier.id));

    const items: PublicItem[] = [];
    const seen = new Set<string>();
    for (const raw of input.items as Record<string, unknown>[]) {
        const id = String(raw?.id ?? "");
        if (!ID.test(id) || seen.has(id)) {
            return { ok: false, error: "Invalid item" };
        }
        seen.add(id);

        const tierId = raw?.tierId;
        const placed =
            typeof tierId === "string" && tierIds.has(tierId) ? tierId : null;
        const credit = clean(raw?.credit, LIMITS.credit);
        const name = clean(raw?.name, LIMITS.itemName);
        const image = cleanImage(raw?.image);
        if (!name && !image) continue;

        items.push({
            id,
            name,
            image,
            tierId: placed,
            ...(credit ? { credit } : {}),
        });
    }

    if (!items.some((item) => item.tierId !== null)) {
        return { ok: false, error: "Rank at least one item first" };
    }

    const forkedFrom =
        typeof input.forkedFrom === "string" && ID.test(input.forkedFrom)
            ? input.forkedFrom
            : undefined;

    return {
        ok: true,
        value: {
            title,
            author: clean(input.author, LIMITS.author) || "Anonymous",
            tiers,
            items,
            cover: decodeCover(input.cover),
            forkedFrom,
        },
    };
}

export function pageOfFeed(
    index: Summary[],
    { sort, query, offset, limit }: {
        sort: "new" | "top";
        query: string;
        offset: number;
        limit: number;
    }
) {
    const needle = query.trim().toLowerCase();
    const matches = needle
        ? index.filter(
              (entry) =>
                  entry.title.toLowerCase().includes(needle) ||
                  entry.author.toLowerCase().includes(needle)
          )
        : index;
    const sorted = [...matches].sort((a, b) =>
        sort === "top"
            ? b.forks - a.forks || b.createdAt - a.createdAt
            : b.createdAt - a.createdAt
    );
    return {
        lists: sorted.slice(offset, offset + limit),
        nextOffset: offset + limit < sorted.length ? offset + limit : null,
    };
}

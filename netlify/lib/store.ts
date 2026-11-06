import { getStore } from "@netlify/blobs";
import type { Summary } from "./lists";

const MAX_FEED = 1000;
const MAX_ATTEMPTS = 6;

export const lists = () =>
    getStore({ name: "lists", consistency: "strong" });
export const covers = () =>
    getStore({ name: "covers", consistency: "strong" });

const INDEX_KEY = "index";

export async function readIndex(): Promise<Summary[]> {
    const index = await lists().get(INDEX_KEY, { type: "json" });
    return (index as Summary[] | null) ?? [];
}

/** The parts of a Netlify Blobs store the feed index needs. */
export interface IndexStore {
    getWithMetadata(
        key: string,
        options: { type: "json" }
    ): Promise<{ data: unknown; etag?: string } | null>;
    setJSON(
        key: string,
        value: unknown,
        options?: { onlyIfMatch: string } | { onlyIfNew: boolean }
    ): Promise<{ modified: boolean }>;
}

/**
 * The feed is one JSON blob, so two publishes at once could otherwise overwrite
 * each other. Each write is conditional on the blob being unchanged and retries
 * from a fresh read if it lost the race.
 */
export async function updateIndex(
    change: (index: Summary[]) => Summary[],
    store: IndexStore = lists() as unknown as IndexStore
): Promise<void> {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const current = await store.getWithMetadata(INDEX_KEY, {
            type: "json",
        });
        const index = (current?.data as Summary[] | undefined) ?? [];
        const next = change(index).slice(0, MAX_FEED);

        // The local dev sandbox returns no ETag on reads, so an existing blob
        // without one has to be written unconditionally.
        const condition = !current
            ? { onlyIfNew: true }
            : current.etag
              ? { onlyIfMatch: current.etag }
              : undefined;

        const { modified } = await store.setJSON(INDEX_KEY, next, condition);
        if (modified) return;

        await new Promise((resolve) =>
            setTimeout(resolve, 40 + Math.random() * 80 * (attempt + 1))
        );
    }
    throw new Error("Feed is busy");
}

export async function hashToken(token: string): Promise<string> {
    const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(token)
    );
    return Array.from(new Uint8Array(digest), (byte) =>
        byte.toString(16).padStart(2, "0")
    ).join("");
}

export function newToken(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
        ""
    );
}

export const json = (
    body: unknown,
    status = 200,
    headers: Record<string, string> = {}
) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ...headers },
    });

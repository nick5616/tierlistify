import { describe, expect, it, vi } from "vitest";
import { updateIndex, type IndexStore } from "./store";
import type { Summary } from "./lists";

vi.mock("@netlify/blobs", () => ({ getStore: vi.fn() }));

const entry = (id: string): Summary => ({
    id,
    title: id,
    author: "a",
    itemCount: 1,
    forks: 0,
    createdAt: 0,
    updatedAt: 0,
});

/** Behaves like production Blobs: reads return an ETag, writes honor conditions. */
function fakeStore(): IndexStore & { value: () => Summary[] } {
    let value: Summary[] | null = null;
    let version = 0;

    return {
        value: () => value ?? [],
        async getWithMetadata() {
            await Promise.resolve();
            return value === null
                ? null
                : { data: structuredClone(value), etag: `"${version}"` };
        },
        async setJSON(_key, next, options) {
            await Promise.resolve();
            if (options && "onlyIfNew" in options && value !== null) {
                return { modified: false };
            }
            if (
                options &&
                "onlyIfMatch" in options &&
                options.onlyIfMatch !== `"${version}"`
            ) {
                return { modified: false };
            }
            value = next as Summary[];
            version++;
            return { modified: true };
        },
    };
}

describe("updateIndex", () => {
    it("keeps every entry when publishes race", async () => {
        const store = fakeStore();
        const ids = ["a", "b", "c", "d", "e"];

        await Promise.all(
            ids.map((id) =>
                updateIndex((index) => [entry(id), ...index], store)
            )
        );

        expect(store.value().map((e) => e.id).sort()).toEqual(ids);
    });

    it("writes over an existing blob when reads have no ETag", async () => {
        const store: IndexStore = {
            getWithMetadata: async () => ({ data: [entry("old")] }),
            setJSON: vi.fn(async () => ({ modified: true })),
        };

        await updateIndex((index) => [entry("new"), ...index], store);

        expect(store.setJSON).toHaveBeenCalledWith(
            "index",
            [entry("new"), entry("old")],
            undefined
        );
    });

    it("gives up rather than looping forever", async () => {
        const store: IndexStore = {
            getWithMetadata: async () => ({ data: [], etag: '"1"' }),
            setJSON: async () => ({ modified: false }),
        };

        await expect(updateIndex((index) => index, store)).rejects.toThrow(
            "Feed is busy"
        );
    });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Exercises the real handlers without netlify dev, whose proxy replays failed
 * requests against id.html and similar paths and hides the true response.
 */
const blobs = vi.hoisted(() => new Map<string, Map<string, unknown>>());

vi.mock("@netlify/blobs", () => ({
    getStore: ({ name }: { name: string }) => {
        const bucket = blobs.get(name) ?? new Map<string, unknown>();
        blobs.set(name, bucket);
        const read = (key: string) =>
            bucket.has(key) ? structuredClone(bucket.get(key)) : null;
        return {
            get: async (key: string) => read(key),
            getWithMetadata: async (key: string) =>
                bucket.has(key) ? { data: read(key), etag: '"e"' } : null,
            setJSON: async (key: string, value: unknown) => {
                bucket.set(key, value);
                return { modified: true };
            },
            set: async (key: string, value: unknown) => {
                bucket.set(key, value);
            },
            delete: async (key: string) => {
                bucket.delete(key);
            },
        };
    },
}));

import read from "../functions/lists-read.mts";
import write from "../functions/lists-write.mts";

const env = new Map<string, string>();
vi.stubGlobal("Netlify", { env: { get: (key: string) => env.get(key) } });

const BASE = "https://tierlistify.test/api/lists";

const body = (title = "Best") =>
    JSON.stringify({
        title,
        author: "Nicole",
        tiers: [{ id: "t1", name: "S", color: "#ff6b6b" }],
        items: [{ id: "i1", name: "Goku", image: null, tierId: "t1" }],
    });

const call = (
    handler: (req: Request) => Promise<Response>,
    path: string,
    init: RequestInit = {}
) => handler(new Request(`${BASE}${path}`, init));

const CODE = "friends only!";
const invited = { "x-publish-code": encodeURIComponent(CODE) };

async function publish() {
    const response = await call(write, "", {
        method: "POST",
        headers: invited,
        body: body(),
    });
    expect(response.status).toBe(201);
    return (await response.json()) as { id: string; token: string };
}

const titleOf = async (id: string) => {
    const response = await call(read, `/${id}`);
    return response.status === 200
        ? ((await response.json()) as { title: string }).title
        : null;
};

beforeEach(() => {
    blobs.clear();
    env.clear();
    env.set("TIERLISTIFY_PUBLISH_CODE", CODE);
});

describe("invite code", () => {
    const attempt = (headers: Record<string, string>) =>
        call(write, "", { method: "POST", headers, body: body() });

    it.each([
        ["no code", {}],
        ["a wrong code", { "x-publish-code": "guess" }],
    ])("refuses publishing with %s", async (_name, headers) => {
        expect((await attempt(headers)).status).toBe(401);
        expect((await (await call(read, "")).json()).lists).toEqual([]);
    });

    it("stays closed when no code is configured", async () => {
        env.delete("TIERLISTIFY_PUBLISH_CODE");
        expect((await attempt(invited)).status).toBe(401);
    });

    it("doesn't take the admin token as an invite", async () => {
        env.set("TIERLISTIFY_ADMIN_TOKEN", "admin-secret");
        const headers = { "x-publish-code": "admin-secret" };
        expect((await attempt(headers)).status).toBe(401);
    });

    it("lets anyone rank a published list without a code", async () => {
        const { id } = await publish();
        const fork = await call(write, `/${id}/fork`, { method: "POST" });
        expect(fork.status).toBe(200);
    });
});

describe("ownership", () => {
    it.each([
        ["a wrong token", { "x-list-token": "nope" }],
        ["no token", {}],
    ])("refuses delete and update with %s", async (_name, headers) => {
        const { id } = await publish();

        const removed = await call(write, `/${id}`, {
            method: "DELETE",
            headers,
        });
        const changed = await call(write, `/${id}`, {
            method: "PUT",
            headers,
            body: body("Hacked"),
        });

        expect(removed.status).toBe(403);
        expect(changed.status).toBe(403);
        expect(await titleOf(id)).toBe("Best");
    });

    it("lets the owner update and delete", async () => {
        const { id, token } = await publish();
        const headers = { "x-list-token": token };

        await call(write, `/${id}`, {
            method: "PUT",
            headers,
            body: body("Better"),
        });
        expect(await titleOf(id)).toBe("Better");

        await call(write, `/${id}`, { method: "DELETE", headers });
        expect(await titleOf(id)).toBeNull();
        const feed = await (await call(read, "")).json();
        expect(feed.lists).toEqual([]);
    });

    it("accepts the admin token for takedowns", async () => {
        env.set("TIERLISTIFY_ADMIN_TOKEN", "admin-secret");
        const { id } = await publish();

        const response = await call(write, `/${id}`, {
            method: "DELETE",
            headers: { "x-list-token": "admin-secret" },
        });

        expect(response.status).toBe(200);
    });

    it("never exposes the token hash", async () => {
        const { id } = await publish();
        const text = await (await call(read, `/${id}`)).text();
        expect(text).not.toContain("tokenHash");
    });
});

describe("routing", () => {
    it.each(["/abc.html", "/abc123abc123.html", "/abc123abc123/index.html"])(
        "404s on %s instead of succeeding",
        async (path) => {
            expect((await call(read, path)).status).toBe(404);
            const removed = await call(write, path, { method: "DELETE" });
            expect(removed.status).toBe(404);
        }
    );

    it("404s when deleting a list that doesn't exist", async () => {
        const response = await call(write, "/abc123abc123", {
            method: "DELETE",
            headers: { "x-list-token": "x" },
        });
        expect(response.status).toBe(404);
    });
});

describe("forks", () => {
    it("counts on the list and in the feed", async () => {
        const { id } = await publish();

        await call(write, `/${id}/fork`, { method: "POST" });

        const list = await (await call(read, `/${id}`)).json();
        const feed = await (await call(read, "?sort=top")).json();
        expect(list.forks).toBe(1);
        expect(feed.lists[0].forks).toBe(1);
    });
});

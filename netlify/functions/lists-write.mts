import type { Config } from "@netlify/functions";
import { parseRoute, parseSubmission, type Summary } from "../lib/lists";
import {
    covers,
    hashToken,
    json,
    lists,
    newToken,
    updateIndex,
} from "../lib/store";

interface StoredList extends Summary {
    tokenHash: string;
    tiers: unknown[];
    items: unknown[];
    forkedFrom?: string;
}

const MAX_BODY_BYTES = 5.5 * 1024 * 1024;

const summarize = (list: StoredList): Summary => ({
    id: list.id,
    title: list.title,
    author: list.author,
    itemCount: list.itemCount,
    forks: list.forks,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
});

const readRecord = async (id: string) =>
    (await lists().get(`list/${id}`, { type: "json" })) as StoredList | null;

async function isAuthorized(req: Request, record: StoredList) {
    const token = req.headers.get("x-list-token");
    const admin = Netlify.env.get("TIERLISTIFY_ADMIN_TOKEN");
    if (!token) return false;
    if (admin && token === admin) return true;
    return (await hashToken(token)) === record.tokenHash;
}

/**
 * Publishing is invite-only, so strangers can't post to the feed. With no code
 * configured it stays closed. Clients URI-encode the code to keep the header
 * valid for any characters.
 */
async function canPublish(req: Request) {
    const expected = Netlify.env.get("TIERLISTIFY_PUBLISH_CODE");
    const code = req.headers.get("x-publish-code");
    if (!expected || !code) return false;
    return (
        (await hashToken(code)) ===
        (await hashToken(encodeURIComponent(expected)))
    );
}

async function readBody(req: Request) {
    const length = Number(req.headers.get("content-length") ?? 0);
    if (length > MAX_BODY_BYTES) return null;
    return req.json().catch(() => undefined);
}

export default async (req: Request) => {
    const route = parseRoute(new URL(req.url).pathname);
    if (!route || route.action === "cover") {
        return json({ error: "List not found" }, 404);
    }
    const { id, action } = route;

    if (req.method === "POST" && id && action === "fork") {
        const record = await readRecord(id);
        if (!record) return json({ error: "List not found" }, 404);

        const forks = record.forks + 1;
        await lists().setJSON(`list/${id}`, { ...record, forks });
        await updateIndex((index) =>
            index.map((entry) =>
                entry.id === id ? { ...entry, forks } : entry
            )
        );
        return json({ forks });
    }

    if (req.method === "POST" && !id) {
        // 401 rather than 403: netlify dev replays 403s against other paths.
        if (!(await canPublish(req))) {
            return json({ error: "That invite code isn't right" }, 401);
        }

        const body = await readBody(req);
        if (body === null) return json({ error: "That list is too large" }, 413);

        const parsed = parseSubmission(body);
        if (!parsed.ok) return json({ error: parsed.error }, 400);
        const { cover, ...submission } = parsed.value;

        const token = newToken();
        const now = Date.now();
        const record: StoredList = {
            ...submission,
            id: crypto.randomUUID().replace(/-/g, "").slice(0, 12),
            itemCount: submission.items.length,
            forks: 0,
            createdAt: now,
            updatedAt: now,
            tokenHash: await hashToken(token),
        };

        await lists().setJSON(`list/${record.id}`, record);
        if (cover) await covers().set(record.id, cover.slice().buffer);
        await updateIndex((index) => [summarize(record), ...index]);

        return json({ id: record.id, token, updatedAt: now }, 201);
    }

    if (req.method === "PUT" && id) {
        const record = await readRecord(id);
        if (!record) return json({ error: "List not found" }, 404);
        if (!(await isAuthorized(req, record))) {
            return json({ error: "Not allowed" }, 403);
        }

        const body = await readBody(req);
        if (body === null) return json({ error: "That list is too large" }, 413);

        const parsed = parseSubmission(body);
        if (!parsed.ok) return json({ error: parsed.error }, 400);
        const { cover, ...submission } = parsed.value;

        const next: StoredList = {
            ...record,
            ...submission,
            forkedFrom: record.forkedFrom,
            itemCount: submission.items.length,
            updatedAt: Date.now(),
        };
        await lists().setJSON(`list/${id}`, next);
        if (cover) await covers().set(id, cover.slice().buffer);
        await updateIndex((index) =>
            index.map((entry) =>
                entry.id === id
                    ? { ...summarize(next), forks: entry.forks }
                    : entry
            )
        );
        return json({ id, updatedAt: next.updatedAt });
    }

    if (req.method === "DELETE" && id) {
        const record = await readRecord(id);
        if (!record) return json({ error: "List not found" }, 404);
        if (!(await isAuthorized(req, record))) {
            return json({ error: "Not allowed" }, 403);
        }

        await updateIndex((index) =>
            index.filter((entry) => entry.id !== id)
        );
        await lists().delete(`list/${id}`);
        await covers().delete(id);
        return json({ ok: true });
    }

    return json({ error: "Not found" }, 404);
};

export const config: Config = {
    path: ["/api/lists", "/api/lists/:id", "/api/lists/:id/fork"],
    method: ["POST", "PUT", "DELETE"],
    rateLimit: {
        action: "rate_limit",
        aggregateBy: ["ip", "domain"],
        windowLimit: 20,
        windowSize: 60,
    },
};

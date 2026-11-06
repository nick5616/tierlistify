import type { Config } from "@netlify/functions";
import { pageOfFeed, parseRoute } from "../lib/lists";
import { covers, json, lists, readIndex } from "../lib/store";

const PAGE_SIZE = 24;

export default async (req: Request) => {
    const route = parseRoute(new URL(req.url).pathname);
    if (!route || route.action === "fork") {
        return json({ error: "List not found" }, 404);
    }
    const { id, action } = route;

    if (id && action === "cover") {
        const cover = await covers().get(id, { type: "arrayBuffer" });
        if (!cover) return new Response("Not found", { status: 404 });
        return new Response(cover, {
            headers: {
                "Content-Type": "image/jpeg",
                // Clients add ?v=<updatedAt>, so an update gets a new URL.
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    }

    if (id) {
        const record = (await lists().get(`list/${id}`, {
            type: "json",
        })) as { tokenHash?: string } | null;
        if (!record) return json({ error: "List not found" }, 404);

        const { tokenHash: _private, ...list } = record;
        return json(list, 200, { "Cache-Control": "no-cache" });
    }

    const params = new URL(req.url).searchParams;
    const page = pageOfFeed(await readIndex(), {
        sort: params.get("sort") === "top" ? "top" : "new",
        query: (params.get("q") ?? "").slice(0, 80),
        offset: Math.max(0, Number(params.get("offset")) || 0),
        limit: PAGE_SIZE,
    });
    return json(page, 200, { "Cache-Control": "no-cache" });
};

export const config: Config = {
    path: ["/api/lists", "/api/lists/:id", "/api/lists/:id/cover"],
    method: ["GET"],
};

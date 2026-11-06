import type {
    CommunityList,
    CommunitySummary,
    TierItem,
    TierList,
} from "../types";
import { newId } from "./board";
import { renderCover } from "./exportImage";

const AUTHOR_KEY = "tierlistify-author";
const CODE_KEY = "tierlistify-invite-code";

const recall = (key: string) => {
    try {
        return localStorage.getItem(key) ?? "";
    } catch {
        return "";
    }
};

const remember = (key: string, value: string) => {
    try {
        localStorage.setItem(key, value);
    } catch {
        /* Only a convenience. */
    }
};

export const rememberedAuthor = () => recall(AUTHOR_KEY);
export const rememberedInviteCode = () => recall(CODE_KEY);

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`/api/lists${path}`, init);
    const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
    const data = isJson ? await response.json() : null;

    if (!response.ok || !isJson) {
        if (response.status === 429) {
            throw new Error("Slow down a little, then try again.");
        }
        throw new Error(data?.error ?? "Couldn't reach the community feed");
    }
    return data as T;
}

export interface FeedPage {
    lists: CommunitySummary[];
    nextOffset: number | null;
}

export const fetchFeed = (
    options: { sort: "new" | "top"; query: string; offset: number },
    signal?: AbortSignal
) => {
    const params = new URLSearchParams({
        sort: options.sort,
        offset: String(options.offset),
    });
    if (options.query) params.set("q", options.query);
    return request<FeedPage>(`?${params}`, { signal });
};

export const fetchPublished = (id: string, signal?: AbortSignal) =>
    request<CommunityList>(`/${encodeURIComponent(id)}`, { signal });

export const coverUrl = (entry: Pick<CommunitySummary, "id" | "updatedAt">) =>
    `/api/lists/${encodeURIComponent(entry.id)}/cover?v=${entry.updatedAt}`;

const payload = async (list: TierList, title: string, author: string) =>
    JSON.stringify({
        title,
        author,
        tiers: list.tiers,
        items: list.items,
        forkedFrom: list.forkedFrom,
        cover: await renderCover({ ...list, name: title }).catch(() => null),
    });

const JSON_HEADERS = { "Content-Type": "application/json" };

export async function publishList(
    list: TierList,
    title: string,
    author: string,
    inviteCode: string
) {
    remember(AUTHOR_KEY, author);
    const body = await payload(list, title, author);

    if (list.published) {
        const { id, token } = list.published;
        await request(`/${id}`, {
            method: "PUT",
            headers: { ...JSON_HEADERS, "x-list-token": token },
            body,
        });
        return { id, token };
    }

    const created = await request<{ id: string; token: string }>("", {
        method: "POST",
        headers: {
            ...JSON_HEADERS,
            "x-publish-code": encodeURIComponent(inviteCode),
        },
        body,
    });
    remember(CODE_KEY, inviteCode);
    return created;
}

export const unpublishList = (id: string, token: string) =>
    request(`/${id}`, {
        method: "DELETE",
        headers: { "x-list-token": token },
    }).catch((error: Error) => {
        // Already gone is what the caller wanted.
        if (error.message !== "List not found") throw error;
    });

/** Counts toward the list's popularity. Never blocks starting a list. */
export const countFork = (id: string) => {
    request(`/${id}/fork`, { method: "POST" }).catch(() => undefined);
};

/** Turns any list into fresh items for someone else to rank. */
export const freshItems = (items: TierItem[]): TierItem[] =>
    items.map((item) => ({ ...item, id: newId(), tierId: null }));

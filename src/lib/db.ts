import type { Tier, TierItem, TierList } from "../types";
import { newId } from "./board";

/**
 * Lists live in IndexedDB because uploaded images are stored inline and
 * localStorage's roughly 5MB quota runs out after a few photo-heavy lists.
 */
const DB_NAME = "tierlistify";
const STORE = "lists";
const LEGACY_LISTS_KEY = "tierlistify-tier-lists";
const LEGACY_DRAFT_KEY = "tierlistify-current-tier-list";
const LEGACY_TEMPLATES_KEY = "tierlistify-tier-list-templates";

let opening: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
    opening ??= new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () =>
            request.result.createObjectStore(STORE, { keyPath: "id" });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
    return opening;
}

const run = async <T>(
    mode: IDBTransactionMode,
    action: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> => {
    const db = await open();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const request = action(tx.objectStore(STORE));
        tx.oncomplete = () => resolve(request.result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });
};

export const readLists = () =>
    run<TierList[]>("readonly", (store) => store.getAll());
export const writeList = (list: TierList) =>
    run("readwrite", (store) => store.put(list));
export const deleteList = (id: string) =>
    run("readwrite", (store) => store.delete(id));

interface LegacyTier {
    name: string;
    color: string;
}

interface LegacyItem {
    id: string;
    name: string;
    image: string;
    tier?: string | null;
}

interface LegacyList {
    id?: string;
    name?: string;
    tiers?: LegacyTier[];
    items?: LegacyItem[];
    createdAt?: string;
}

/** Old lists keyed items to tiers by display name. */
export function migrateLegacyList(
    legacy: LegacyList,
    status: TierList["status"]
): TierList {
    const tiers: Tier[] = (legacy.tiers ?? []).map((tier) => ({
        id: newId(),
        name: tier.name,
        color: tier.color,
    }));
    const items: TierItem[] = (legacy.items ?? []).map((item) => ({
        id: item.id || newId(),
        name: item.name,
        image: item.image || null,
        tierId: tiers.find((tier) => tier.name === item.tier)?.id ?? null,
    }));
    const createdAt = legacy.createdAt
        ? new Date(legacy.createdAt).getTime()
        : Date.now();

    return {
        id: legacy.id ?? newId(),
        name: legacy.name ?? "",
        tiers,
        items,
        status,
        showLabels: true,
        createdAt,
        updatedAt: createdAt,
    };
}

function readLegacy<T>(key: string): T | null {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
    } catch {
        return null;
    }
}

/** One-time import from the old localStorage format. */
export async function importLegacyLists(existing: TierList[]) {
    const saved = readLegacy<LegacyList[]>(LEGACY_LISTS_KEY) ?? [];
    const draft = readLegacy<LegacyList>(LEGACY_DRAFT_KEY);

    const known = new Set(existing.map((list) => list.id));
    const migrated = saved
        .map((list) => migrateLegacyList(list, "done"))
        .filter((list) => !known.has(list.id));

    const draftIsNew =
        draft?.items?.length &&
        !saved.some((list) => list.id === draft.id) &&
        !(draft.id && known.has(draft.id));
    if (draftIsNew) migrated.push(migrateLegacyList(draft, "draft"));

    await Promise.all(migrated.map(writeList));

    localStorage.removeItem(LEGACY_LISTS_KEY);
    localStorage.removeItem(LEGACY_DRAFT_KEY);
    localStorage.removeItem(LEGACY_TEMPLATES_KEY);
    return migrated;
}

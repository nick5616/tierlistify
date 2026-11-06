import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import type { TierList } from "../types";
import { deleteList, importLegacyLists, readLists, writeList } from "../lib/db";
import { newId } from "../lib/board";
import { defaultTiers } from "../lib/presets";

type Patch = Partial<TierList> | ((list: TierList) => Partial<TierList>);

interface ListsContextValue {
    lists: TierList[];
    ready: boolean;
    /** Set when a save failed, usually because device storage is full. */
    saveFailed: boolean;
    get: (id: string) => TierList | undefined;
    create: (partial?: Partial<TierList>) => TierList;
    update: (id: string, patch: Patch) => void;
    remove: (id: string) => void;
    restore: (list: TierList) => void;
}

const ListsContext = createContext<ListsContextValue | null>(null);

export function ListsProvider({ children }: { children: ReactNode }) {
    const [lists, setLists] = useState<TierList[]>([]);
    const [ready, setReady] = useState(false);
    const [saveFailed, setSaveFailed] = useState(false);

    const latest = useRef(lists);
    latest.current = lists;

    const dirty = useRef(new Set<string>());
    const writing = useRef(false);

    /**
     * Saves start right away instead of after a debounce: a phone app can be
     * killed moments after a tap, and WebKit won't finish a write begun in
     * pagehide. Changes made during a write are picked up straight after it, so
     * typing coalesces rather than queueing one write per keystroke.
     */
    const flush = useCallback(async () => {
        if (writing.current || dirty.current.size === 0) return;
        writing.current = true;

        const ids = [...dirty.current];
        dirty.current.clear();

        const saves = ids.map((id) => {
            const list = latest.current.find((l) => l.id === id);
            return list ? writeList(list) : undefined;
        });
        const results = await Promise.allSettled(saves);
        setSaveFailed(results.some((r) => r.status === "rejected"));

        writing.current = false;
        void flush();
    }, []);

    const markDirty = useCallback(
        (id: string) => {
            dirty.current.add(id);
            // Next tick, so several updates from one event are a single write.
            window.setTimeout(flush, 0);
        },
        [flush]
    );

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const stored = await readLists();
                const imported = await importLegacyLists(stored);
                if (!cancelled) setLists([...stored, ...imported]);
            } catch {
                if (!cancelled) setSaveFailed(true);
            } finally {
                if (!cancelled) setReady(true);
            }
        })();

        // Mobile browsers can evict storage; ask to keep it. Best effort.
        navigator.storage?.persist?.().catch(() => undefined);

        return () => {
            cancelled = true;
        };
    }, []);

    // Backgrounding is often the last chance a mobile page gets to run.
    useEffect(() => {
        const onHide = () => {
            if (document.visibilityState === "hidden") flush();
        };
        document.addEventListener("visibilitychange", onHide);
        window.addEventListener("pagehide", onHide);
        return () => {
            document.removeEventListener("visibilitychange", onHide);
            window.removeEventListener("pagehide", onHide);
        };
    }, [flush]);

    const get = useCallback(
        (id: string) => lists.find((list) => list.id === id),
        [lists]
    );

    const create = useCallback(
        (partial: Partial<TierList> = {}) => {
            const now = Date.now();
            const list: TierList = {
                id: newId(),
                name: "",
                tiers: defaultTiers(),
                items: [],
                status: "draft",
                showLabels: true,
                createdAt: now,
                updatedAt: now,
                ...partial,
            };
            latest.current = [...latest.current, list];
            setLists(latest.current);
            markDirty(list.id);
            return list;
        },
        [markDirty]
    );

    const update = useCallback(
        (id: string, patch: Patch) => {
            // Applied through the ref so that several updates in one tick
            // compose instead of each starting from the same stale state.
            latest.current = latest.current.map((list) =>
                list.id === id
                    ? {
                          ...list,
                          ...(typeof patch === "function"
                              ? patch(list)
                              : patch),
                          updatedAt: Date.now(),
                      }
                    : list
            );
            setLists(latest.current);
            markDirty(id);
        },
        [markDirty]
    );

    const remove = useCallback((id: string) => {
        latest.current = latest.current.filter((list) => list.id !== id);
        setLists(latest.current);
        dirty.current.delete(id);
        deleteList(id).catch(() => setSaveFailed(true));
    }, []);

    const restore = useCallback(
        (list: TierList) => {
            latest.current = [...latest.current, list];
            setLists(latest.current);
            markDirty(list.id);
        },
        [markDirty]
    );

    const value = useMemo(
        () => ({
            lists,
            ready,
            saveFailed,
            get,
            create,
            update,
            remove,
            restore,
        }),
        [lists, ready, saveFailed, get, create, update, remove, restore]
    );

    return (
        <ListsContext.Provider value={value}>{children}</ListsContext.Provider>
    );
}

export function useLists() {
    const value = useContext(ListsContext);
    if (!value) throw new Error("useLists needs a ListsProvider");
    return value;
}

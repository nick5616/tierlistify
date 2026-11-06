import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, Search, Users } from "lucide-react";
import type { ImageResult, TierItem, TierList } from "../types";
import {
    SOURCES,
    fetchCast,
    searchAnime,
    searchPhotos,
    searchWikipedia,
    type AnimeResults,
    type SourceId,
} from "../lib/sources";
import { newId } from "../lib/board";
import { useLists } from "../state/lists";
import { Button, Spinner } from "../components/ui";
import Sheet from "../components/Sheet";

const DEBOUNCE_MS = 350;
const SOURCE_KEY = "tierlistify-search-source";

const initialSource = (): SourceId => {
    try {
        const stored = localStorage.getItem(SOURCE_KEY);
        return SOURCES.some((source) => source.id === stored)
            ? (stored as SourceId)
            : SOURCES[0].id;
    } catch {
        return SOURCES[0].id;
    }
};

interface Results {
    photos: ImageResult[];
    anime: AnimeResults | null;
}

const EMPTY: Results = { photos: [], anime: null };

function ResultTile({
    result,
    added,
    tag,
    onPress,
}: {
    result: ImageResult;
    added: boolean;
    tag?: string;
    onPress: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onPress}
            aria-pressed={added}
            aria-label={result.name}
            className="pressable relative aspect-square overflow-hidden rounded-xl bg-raised text-left"
            style={{
                boxShadow: added ? "inset 0 0 0 3px var(--accent)" : undefined,
            }}
        >
            <img
                src={result.image}
                alt=""
                loading="lazy"
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: "50% 20%" }}
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-1.5 pb-1 pt-5">
                {tag && (
                    <span className="block text-[10px] font-semibold uppercase tracking-wide text-accent">
                        {tag}
                    </span>
                )}
                <span className="line-clamp-2 text-[11px] font-medium leading-tight text-white">
                    {result.name}
                </span>
            </span>
            {added && (
                <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-on-accent">
                    <Check size={15} strokeWidth={3} />
                </span>
            )}
        </button>
    );
}

interface SearchSheetProps {
    list: TierList;
    /** When set, a pick replaces this item's image instead of adding an item. */
    replaceId: string | null;
    onClose: () => void;
}

export default function SearchSheet({
    list,
    replaceId,
    onClose,
}: SearchSheetProps) {
    const { update } = useLists();
    const replacing = replaceId
        ? list.items.find((item) => item.id === replaceId)
        : undefined;

    const [query, setQuery] = useState(replacing?.name ?? "");
    const [source, setSource] = useState<SourceId>(initialSource);
    const [results, setResults] = useState<Results>(EMPTY);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);
    const [cast, setCast] = useState<{
        title: string;
        results: ImageResult[];
    } | null>(null);
    const [castLoading, setCastLoading] = useState<number | null>(null);
    /** Result id to the item it created, so a second tap removes it. */
    const [added, setAdded] = useState<Map<string, string>>(new Map());
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const trimmed = query.trim();
        setCast(null);
        setError(null);

        if (!trimmed) {
            setResults(EMPTY);
            setSearched(false);
            setLoading(false);
            return;
        }

        setLoading(true);
        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            try {
                const { signal } = controller;
                const next: Results =
                    source === "anime"
                        ? {
                              photos: [],
                              anime: await searchAnime(trimmed, signal),
                          }
                        : {
                              photos: await (source === "wikipedia"
                                  ? searchWikipedia
                                  : searchPhotos)(trimmed, signal),
                              anime: null,
                          };
                setResults(next);
                setSearched(true);
                setLoading(false);
            } catch (caught) {
                if (controller.signal.aborted) return;
                setResults(EMPTY);
                setError(
                    caught instanceof Error
                        ? caught.message
                        : "Search failed"
                );
                setLoading(false);
            }
        }, DEBOUNCE_MS);

        return () => {
            controller.abort();
            window.clearTimeout(timer);
        };
    }, [query, source]);

    const pickSource = (id: SourceId) => {
        setSource(id);
        try {
            localStorage.setItem(SOURCE_KEY, id);
        } catch {
            /* Only a convenience. */
        }
    };

    const addItems = (picks: ImageResult[]) => {
        const created = picks.map((pick): [string, TierItem] => [
            pick.id,
            {
                id: newId(),
                name: pick.name,
                image: pick.image,
                credit: pick.credit,
                tierId: null,
            },
        ]);
        picks.forEach((pick) => pick.onUse?.());
        update(list.id, (current) => ({
            items: [...current.items, ...created.map(([, item]) => item)],
        }));
        setAdded((previous) => {
            const next = new Map(previous);
            created.forEach(([resultId, item]) => next.set(resultId, item.id));
            return next;
        });
    };

    const toggle = (result: ImageResult) => {
        if (replaceId) {
            result.onUse?.();
            update(list.id, (current) => ({
                items: current.items.map((item) =>
                    item.id === replaceId
                        ? {
                              ...item,
                              image: result.image,
                              credit: result.credit,
                              name: item.name || result.name,
                          }
                        : item
                ),
            }));
            onClose();
            return;
        }

        const itemId = added.get(result.id);
        if (itemId) {
            update(list.id, (current) => ({
                items: current.items.filter((item) => item.id !== itemId),
            }));
            setAdded((previous) => {
                const next = new Map(previous);
                next.delete(result.id);
                return next;
            });
        } else {
            addItems([result]);
        }
    };

    const openCast = async (mediaId: number, title: string) => {
        setCastLoading(mediaId);
        setError(null);
        try {
            setCast({ title, results: await fetchCast(mediaId) });
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Couldn't load the cast"
            );
        } finally {
            setCastLoading(null);
        }
    };

    const remainingCast = useMemo(
        () => cast?.results.filter((result) => !added.has(result.id)) ?? [],
        [cast, added]
    );

    const hint = SOURCES.find((option) => option.id === source)?.hint;
    const anime = results.anime;
    const nothingFound =
        searched &&
        !loading &&
        !error &&
        results.photos.length === 0 &&
        !anime?.media.length &&
        !anime?.characters.length;

    return (
        <Sheet
            tall
            title={
                replacing
                    ? `Picture for ${replacing.name || "item"}`
                    : "Search images"
            }
            onClose={onClose}
            subheader={
                <div className="pb-3">
                    <label className="flex items-center gap-2 rounded-xl border border-line bg-canvas px-3">
                        <Search size={18} className="shrink-0 text-muted" />
                        <input
                            ref={inputRef}
                            autoFocus
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Try Naruto, Pixar, Mario Kart…"
                            aria-label="Search images"
                            enterKeyHint="search"
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    inputRef.current?.blur();
                                }
                            }}
                            className="min-w-0 flex-1 bg-transparent py-3 outline-none placeholder:text-faint"
                        />
                    </label>
                    <div
                        role="tablist"
                        aria-label="Image source"
                        className="mt-2 flex gap-1.5"
                    >
                        {SOURCES.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                role="tab"
                                aria-selected={source === option.id}
                                onClick={() => pickSource(option.id)}
                                className={`pressable h-9 rounded-full px-3.5 text-sm font-semibold ${
                                    source === option.id
                                        ? "bg-ink text-canvas"
                                        : "bg-raised text-muted"
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            }
            footer={
                !replaceId ? (
                    <Button className="w-full" onClick={onClose}>
                        {added.size > 0
                            ? `Done · ${added.size} added`
                            : "Done"}
                    </Button>
                ) : undefined
            }
        >
            {cast ? (
                <div>
                    <div className="sticky top-0 z-10 -mx-1 flex items-center gap-2 bg-surface px-1 pb-2.5">
                        <button
                            type="button"
                            aria-label="Back to results"
                            onClick={() => setCast(null)}
                            className="pressable -ml-2 flex h-10 w-10 items-center justify-center rounded-full"
                        >
                            <ChevronLeft size={22} />
                        </button>
                        <p className="min-w-0 flex-1 truncate font-semibold">
                            {cast.title} cast
                        </p>
                        {!replaceId && remainingCast.length > 0 && (
                            <button
                                type="button"
                                onClick={() => addItems(remainingCast)}
                                className="pressable h-9 shrink-0 rounded-full bg-accent px-3.5 text-sm font-bold text-on-accent"
                            >
                                Add all {remainingCast.length}
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                        {cast.results.map((result) => (
                            <ResultTile
                                key={result.id}
                                result={result}
                                added={added.has(result.id)}
                                onPress={() => toggle(result)}
                            />
                        ))}
                    </div>
                </div>
            ) : loading ? (
                <Spinner />
            ) : error ? (
                <p className="py-10 text-center text-danger">{error}</p>
            ) : nothingFound ? (
                <p className="py-10 text-center text-muted">
                    Nothing found for “{query.trim()}”. Try another source, or
                    add it as text and pick a picture later.
                </p>
            ) : !searched ? (
                <p className="py-10 text-center text-sm text-muted">{hint}</p>
            ) : anime ? (
                <div className="space-y-5">
                    {anime.media.length > 0 && (
                        <div>
                            <h3 className="mb-2 text-sm font-semibold text-muted">
                                Shows and manga
                            </h3>
                            <div className="grid grid-cols-3 gap-x-1.5 gap-y-2">
                                {anime.media.map((media) => (
                                    <div key={media.id} className="flex flex-col gap-1">
                                        <ResultTile
                                            result={media}
                                            tag={media.kind}
                                            added={added.has(media.id)}
                                            onPress={() => toggle(media)}
                                        />
                                        <button
                                            type="button"
                                            disabled={castLoading !== null}
                                            onClick={() =>
                                                openCast(
                                                    media.mediaId,
                                                    media.name
                                                )
                                            }
                                            className="pressable flex h-9 items-center justify-center gap-1 rounded-lg bg-raised text-xs font-semibold"
                                        >
                                            <Users size={13} />
                                            {castLoading === media.mediaId
                                                ? "Loading…"
                                                : "Cast"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {anime.characters.length > 0 && (
                        <div>
                            <h3 className="mb-2 text-sm font-semibold text-muted">
                                Characters
                            </h3>
                            <div className="grid grid-cols-3 gap-1.5">
                                {anime.characters.map((result) => (
                                    <ResultTile
                                        key={result.id}
                                        result={result}
                                        added={added.has(result.id)}
                                        onPress={() => toggle(result)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-1.5">
                    {results.photos.map((result) => (
                        <ResultTile
                            key={result.id}
                            result={result}
                            added={added.has(result.id)}
                            onPress={() => toggle(result)}
                        />
                    ))}
                </div>
            )}
        </Sheet>
    );
}

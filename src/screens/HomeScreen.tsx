import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Globe, Plus, Search } from "lucide-react";
import type { CommunitySummary, TierItem, TierList } from "../types";
import { TEMPLATES, type Template } from "../data/templates";
import { countRanked, newId } from "../lib/board";
import { coverUrl, fetchFeed } from "../lib/community";
import { useLists } from "../state/lists";
import { Button, SectionLabel, Spinner } from "../components/ui";
import { TileFace } from "../components/Tile";
import MiniBoard from "../components/MiniBoard";

type Sort = "new" | "top";

function Logo() {
    return (
        <div className="flex items-center gap-2.5">
            <span aria-hidden className="flex flex-col gap-[2px]">
                <span className="h-[5px] w-6 rounded-[2px] bg-[#ff6b6b]" />
                <span className="h-[5px] w-[18px] rounded-[2px] bg-[#ffe066]" />
                <span className="h-[5px] w-3 rounded-[2px] bg-[#51cf66]" />
            </span>
            <span className="font-display text-[22px] font-extrabold tracking-tight">
                Tierlistify
            </span>
        </div>
    );
}

function Tabs({
    tab,
    mineCount,
    onChange,
}: {
    tab: string;
    mineCount: number;
    onChange: (tab: string) => void;
}) {
    const options = [
        { id: "discover", label: "Discover" },
        {
            id: "mine",
            label: mineCount > 0 ? `My lists · ${mineCount}` : "My lists",
        },
    ];
    return (
        <div role="tablist" className="flex gap-1 rounded-2xl bg-surface p-1">
            {options.map((option) => (
                <button
                    key={option.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === option.id}
                    onClick={() => onChange(option.id)}
                    className={`pressable h-10 flex-1 rounded-xl text-sm font-semibold ${
                        tab === option.id ? "bg-raised text-ink" : "text-muted"
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}

function ListCard({ list }: { list: TierList }) {
    const ranked = countRanked(list);
    const total = list.items.length;
    const isDraft = list.status === "draft";
    const to =
        total === 0
            ? `/edit/${list.id}`
            : isDraft
              ? `/rank/${list.id}`
              : `/list/${list.id}`;

    return (
        <Link to={to} className="pressable block min-w-0">
            <MiniBoard tiers={list.tiers} items={list.items} />
            <p className="mt-1.5 truncate text-[15px] font-semibold">
                {list.name || "Untitled tier list"}
            </p>
            {isDraft ? (
                <div className="mt-1 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-raised">
                        <div
                            className="h-full rounded-full bg-accent"
                            style={{
                                width: `${total ? (ranked / total) * 100 : 0}%`,
                            }}
                        />
                    </div>
                    <span className="text-xs tabular-nums text-muted">
                        {ranked}/{total}
                    </span>
                </div>
            ) : (
                <p className="flex items-center gap-1 text-xs text-muted">
                    {list.published && (
                        <Globe size={12} className="text-accent" />
                    )}
                    {total} items
                </p>
            )}
        </Link>
    );
}

function TemplateCard({
    template,
    onPress,
}: {
    template: Template;
    onPress: () => void;
}) {
    const preview = template.items.filter((item) => item.image).slice(0, 4);

    return (
        <button
            type="button"
            onClick={onPress}
            className="pressable w-[132px] shrink-0 text-left"
        >
            <span className="grid aspect-square grid-cols-2 grid-rows-2 gap-px overflow-hidden rounded-xl bg-canvas">
                {preview.map((item) => (
                    <span
                        key={item.name}
                        className="relative block overflow-hidden"
                    >
                        <TileFace item={item} size={66} />
                    </span>
                ))}
            </span>
            <span className="mt-1.5 block truncate text-sm font-semibold">
                {template.name}
            </span>
            <span className="block truncate text-xs text-muted">
                {template.items.length} items
            </span>
        </button>
    );
}

function CommunityCard({ entry }: { entry: CommunitySummary }) {
    const [broken, setBroken] = useState(false);

    return (
        <Link to={`/p/${entry.id}`} className="pressable block min-w-0">
            <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-surface">
                {broken ? (
                    <span aria-hidden className="flex flex-col gap-1 opacity-40">
                        <span className="h-2 w-12 rounded-sm bg-[#ff6b6b]" />
                        <span className="h-2 w-9 rounded-sm bg-[#ffe066]" />
                        <span className="h-2 w-6 rounded-sm bg-[#51cf66]" />
                    </span>
                ) : (
                    <img
                        src={coverUrl(entry)}
                        alt=""
                        loading="lazy"
                        onError={() => setBroken(true)}
                        className="h-full w-full object-cover"
                    />
                )}
            </div>
            <p className="mt-1.5 truncate text-[15px] font-semibold">
                {entry.title}
            </p>
            <p className="truncate text-xs text-muted">
                by {entry.author}
                {entry.forks > 0 && ` · ${entry.forks} ranked`}
            </p>
        </Link>
    );
}

function CommunityFeed() {
    const [sort, setSort] = useState<Sort>("new");
    const [query, setQuery] = useState("");
    const [entries, setEntries] = useState<CommunitySummary[]>([]);
    const [nextOffset, setNextOffset] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        const timer = window.setTimeout(
            () =>
                fetchFeed(
                    { sort, query: query.trim(), offset: 0 },
                    controller.signal
                )
                    .then((page) => {
                        setEntries(page.lists);
                        setNextOffset(page.nextOffset);
                        setLoading(false);
                    })
                    .catch((caught: Error) => {
                        if (controller.signal.aborted) return;
                        setError(caught.message);
                        setLoading(false);
                    }),
            query ? 300 : 0
        );

        return () => {
            controller.abort();
            window.clearTimeout(timer);
        };
    }, [sort, query, attempt]);

    const loadMore = async () => {
        if (nextOffset === null) return;
        setLoadingMore(true);
        try {
            const page = await fetchFeed({
                sort,
                query: query.trim(),
                offset: nextOffset,
            });
            setEntries((current) => [...current, ...page.lists]);
            setNextOffset(page.nextOffset);
        } catch (caught) {
            setError((caught as Error).message);
        } finally {
            setLoadingMore(false);
        }
    };

    return (
        <section className="mt-6">
            <SectionLabel
                action={
                    <div className="flex gap-1 text-sm">
                        {(
                            [
                                ["new", "Newest"],
                                ["top", "Most ranked"],
                            ] as [Sort, string][]
                        ).map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                aria-pressed={sort === value}
                                onClick={() => setSort(value)}
                                className={`h-8 rounded-full px-2.5 font-medium ${
                                    sort === value
                                        ? "bg-raised text-ink"
                                        : "text-muted"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                }
            >
                Community
            </SectionLabel>

            <label className="mb-3 flex items-center gap-2 rounded-xl bg-surface px-3">
                <Search size={17} className="shrink-0 text-muted" />
                <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    aria-label="Search community lists"
                    placeholder="Search lists and authors"
                    className="min-w-0 flex-1 bg-transparent py-2.5 outline-none placeholder:text-faint"
                />
            </label>

            {loading ? (
                <Spinner />
            ) : error ? (
                <div className="rounded-2xl border border-dashed border-line p-5 text-center">
                    <p className="text-sm text-muted">{error}</p>
                    <Button
                        variant="secondary"
                        className="mx-auto mt-3"
                        onClick={() => setAttempt((count) => count + 1)}
                    >
                        Try again
                    </Button>
                </div>
            ) : entries.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm leading-relaxed text-muted">
                    {query.trim()
                        ? `No lists match “${query.trim()}”.`
                        : "Nothing published yet. Finish a list and publish it to be the first."}
                </p>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-x-2.5 gap-y-4 sm:grid-cols-3">
                        {entries.map((entry) => (
                            <CommunityCard key={entry.id} entry={entry} />
                        ))}
                    </div>
                    {nextOffset !== null && (
                        <Button
                            variant="secondary"
                            busy={loadingMore}
                            className="mt-4 w-full"
                            onClick={loadMore}
                        >
                            Load more
                        </Button>
                    )}
                </>
            )}
        </section>
    );
}

export default function HomeScreen() {
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const { lists, ready, create, remove } = useLists();
    const tab = params.get("tab") === "mine" ? "mine" : "discover";
    const swept = useRef(false);

    // A draft abandoned before anything was entered isn't worth keeping. Done
    // here rather than on leaving setup, where StrictMode's double effects
    // would delete a list that was just created.
    useEffect(() => {
        if (!ready || swept.current) return;
        swept.current = true;
        lists
            .filter(
                (list) =>
                    list.status === "draft" &&
                    list.items.length === 0 &&
                    !list.name.trim()
            )
            .forEach((list) => remove(list.id));
    }, [ready, lists, remove]);

    const sorted = useMemo(
        () => [...lists].sort((a, b) => b.updatedAt - a.updatedAt),
        [lists]
    );
    const visible = sorted.filter(
        (list) => list.items.length > 0 || list.name.trim()
    );
    const resume = sorted.find(
        (list) =>
            list.status === "draft" &&
            list.items.length > 0 &&
            countRanked(list) < list.items.length
    );

    const startNew = () => {
        const list = create();
        navigate(`/edit/${list.id}`);
    };

    const startTemplate = (template: Template) => {
        const items: TierItem[] = template.items.map((item) => ({
            ...item,
            id: newId(),
            tierId: null,
        }));
        const list = create({ name: template.name, items });
        navigate(`/rank/${list.id}`);
    };

    return (
        <div className="relative flex h-full flex-col">
            <div
                className="scroll-area min-h-0 flex-1 px-4 pb-28"
                style={{ paddingTop: "calc(var(--safe-top) + 14px)" }}
            >
                <div className="mx-auto max-w-2xl">
                    <div className="mb-4">
                        <Logo />
                    </div>
                    <Tabs
                        tab={tab}
                        mineCount={visible.length}
                        onChange={(next) =>
                            setParams(next === "mine" ? { tab: "mine" } : {}, {
                                replace: true,
                            })
                        }
                    />

                    {tab === "discover" ? (
                        <div className="anim-rise">
                            {resume && (
                                <Link
                                    to={`/rank/${resume.id}`}
                                    className="pressable mt-4 flex items-center gap-3 rounded-2xl bg-surface p-2.5"
                                >
                                    <div className="w-[72px] shrink-0">
                                        <MiniBoard
                                            tiers={resume.tiers}
                                            items={resume.items}
                                            limit={4}
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold text-accent">
                                            Keep ranking
                                        </p>
                                        <p className="truncate font-semibold">
                                            {resume.name ||
                                                "Untitled tier list"}
                                        </p>
                                        <p className="text-xs tabular-nums text-muted">
                                            {resume.items.length -
                                                countRanked(resume)}{" "}
                                            left
                                        </p>
                                    </div>
                                </Link>
                            )}

                            <section className="mt-6">
                                <SectionLabel>Start from a template</SectionLabel>
                                <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4">
                                    {TEMPLATES.map((template) => (
                                        <TemplateCard
                                            key={template.id}
                                            template={template}
                                            onPress={() =>
                                                startTemplate(template)
                                            }
                                        />
                                    ))}
                                </div>
                            </section>

                            <CommunityFeed />
                        </div>
                    ) : (
                        <div className="anim-rise mt-4">
                            {visible.length > 0 ? (
                                <div className="grid grid-cols-2 gap-x-2.5 gap-y-4 sm:grid-cols-3">
                                    {visible.map((list) => (
                                        <ListCard key={list.id} list={list} />
                                    ))}
                                </div>
                            ) : (
                                <p className="rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
                                    Your tier lists will show up here.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div
                className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-canvas via-canvas/80 to-transparent px-4 pt-8"
                style={{ paddingBottom: "calc(14px + var(--safe-bottom))" }}
            >
                <Button
                    icon={<Plus size={20} strokeWidth={2.75} />}
                    className="pointer-events-auto w-full max-w-sm shadow-lg"
                    onClick={startNew}
                >
                    New tier list
                </Button>
            </div>
        </div>
    );
}

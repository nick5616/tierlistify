import {
    memo,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    ChevronLeft,
    MoreHorizontal,
    Pencil,
    Redo2,
    RotateCcw,
    Tag,
    Undo2,
    X,
    ListChecks,
    Trash2,
} from "lucide-react";
import type { Tier, TierItem, TierList } from "../types";
import {
    boardHeight,
    fitTileSize,
    itemsInTier,
    moveItem,
    nudgeItem,
    resetRanking,
    type FitInput,
} from "../lib/board";
import {
    useDragEngine,
    type DragZone,
    type DropTarget,
} from "../hooks/useDragEngine";
import { useSheetRoute } from "../hooks/useSheetRoute";
import { useLists } from "../state/lists";
import { useToast } from "../components/Toast";
import { Tile, TileFace } from "../components/Tile";
import { Button, IconButton, Splash, TopBar } from "../components/ui";
import Sheet from "../components/Sheet";
import ItemSheet from "../sheets/ItemSheet";
import SearchSheet from "../sheets/SearchSheet";
import CropSheet from "../sheets/CropSheet";

const LABEL_WIDTH = 52;
const TILE_GAP = 3;
const ROW_GAP = 3;
const ROW_PADDING = 3;
const BOARD_SIDE_PADDING = 6;
const FOCUS_SIZE = 76;
const QUEUE_SIZE = 46;
const GHOST_SIZE = 88;
const HISTORY_LIMIT = 100;

const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Clone-based because the board clips, and the flight starts outside it. */
function flyTile(element: HTMLElement, from: DOMRect) {
    if (prefersReducedMotion()) return;

    const to = element.getBoundingClientRect();
    const clone = element.cloneNode(true) as HTMLElement;
    clone.removeAttribute("data-drag-id");
    clone.removeAttribute("data-tile-id");
    Object.assign(clone.style, {
        position: "fixed",
        left: `${to.left}px`,
        top: `${to.top}px`,
        margin: "0",
        opacity: "1",
        zIndex: "30",
        pointerEvents: "none",
        boxShadow: "0 10px 24px rgba(0,0,0,.45)",
        transition: "none",
    });
    document.body.appendChild(clone);
    element.style.opacity = "0";

    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    const animation = clone.animate(
        [
            {
                transform: `translate(${dx}px, ${dy}px) scale(${
                    from.width / to.width
                })`,
            },
            { transform: "none" },
        ],
        { duration: 230, easing: "cubic-bezier(.2,.85,.25,1)" }
    );
    animation.onfinish = animation.oncancel = () => {
        clone.remove();
        element.style.opacity = "";
    };
}

/** Sized by the longest word, so names wrap between words rather than inside them. */
const labelFontSize = (name: string) => {
    if (name.length <= 2) return 24;
    if (name.length <= 4) return 15;
    const longestWord = Math.max(...name.split(/\s+/).map((w) => w.length));
    return longestWord <= 7 ? 11 : longestWord <= 9 ? 9.5 : 8;
};

interface RowProps {
    tier: Tier;
    items: TierItem[];
    size: number;
    showLabels: boolean;
    selectedId: string | null;
    dragId: string | null;
    active: boolean;
    caretIndex: number | null;
    onTileTap: (id: string) => void;
}

const TierRow = memo(function TierRow({
    tier,
    items,
    size,
    showLabels,
    selectedId,
    dragId,
    active,
    caretIndex,
    onTileTap,
}: RowProps) {
    const others = items.filter((item) => item.id !== dragId);
    const caretBefore =
        caretIndex !== null && caretIndex < others.length
            ? others[caretIndex].id
            : null;
    const caretAfter =
        caretIndex !== null && caretIndex >= others.length
            ? others[others.length - 1]?.id
            : null;

    return (
        <section
            data-tier-id={tier.id}
            data-active={active}
            aria-label={`${tier.name} tier`}
            className="tier-row flex rounded-lg bg-surface"
            style={
                {
                    "--tier": tier.color,
                    // Equal shares, so rows hold still as items land. The
                    // implicit min-height still lets a wrapped row grow, which
                    // is why this element can't set overflow: hidden.
                    flex: "1 1 0",
                } as React.CSSProperties
            }
        >
            <div
                className="flex shrink-0 items-center justify-center rounded-l-lg px-0.5 text-center font-display font-extrabold leading-none text-[#121214]"
                style={{
                    width: LABEL_WIDTH,
                    background: tier.color,
                    fontSize: labelFontSize(tier.name),
                    overflowWrap: "break-word",
                }}
            >
                <span className="line-clamp-3 min-w-0">{tier.name}</span>
            </div>
            <div
                className="flex min-w-0 flex-1 flex-wrap content-center items-center"
                style={{ gap: TILE_GAP, padding: ROW_PADDING }}
            >
                {items.map((item) => (
                    <div key={item.id} className="relative">
                        {caretBefore === item.id && (
                            <span
                                className="drop-caret absolute -left-[3px] bottom-0 top-0 z-10 w-[3px]"
                            />
                        )}
                        <Tile
                            item={item}
                            size={size}
                            zone="board"
                            showLabel={showLabels}
                            selected={selectedId === item.id}
                            dimmed={dragId === item.id}
                            onTap={onTileTap}
                            tierName={tier.name}
                        />
                        {caretAfter === item.id && (
                            <span
                                className="drop-caret absolute -right-[3px] bottom-0 top-0 z-10 w-[3px]"
                            />
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
});

function useBoardMetrics(
    boardRef: React.RefObject<HTMLElement>,
    counts: number[]
) {
    const [box, setBox] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        const element = boardRef.current;
        if (!element) return;

        const read = () =>
            setBox({
                width: element.clientWidth - BOARD_SIDE_PADDING * 2,
                height: element.clientHeight - 4,
            });
        read();
        const observer = new ResizeObserver(read);
        observer.observe(element);
        return () => observer.disconnect();
    }, [boardRef]);

    const key = counts.join(",");
    return useMemo(() => {
        const input: FitInput = {
            ...box,
            counts,
            labelWidth: LABEL_WIDTH,
            gap: TILE_GAP,
            rowGap: ROW_GAP,
            rowPadding: ROW_PADDING,
        };
        const size = box.width ? fitTileSize(input) : 60;
        return {
            size,
            scrolls: box.width > 0 && boardHeight(size, input) > box.height,
        };
        // counts is compared by value through key.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [box, key]);
}

export default function BoardScreen() {
    const { id } = useParams();
    const { get, ready } = useLists();
    const list = id ? get(id) : undefined;

    if (!ready) return <Splash />;
    if (!list) return <Navigate to="/" replace />;
    if (list.items.length === 0) {
        return <Navigate to={`/edit/${list.id}`} replace />;
    }
    return <Board list={list} />;
}

function Board({ list }: { list: TierList }) {
    const navigate = useNavigate();
    const toast = useToast();
    const { update, remove, restore } = useLists();
    const { sheet, param, open, close } = useSheetRoute();

    const boardRef = useRef<HTMLDivElement>(null);
    const dockRef = useRef<HTMLDivElement>(null);
    const queueRef = useRef<HTMLDivElement>(null);
    const flight = useRef<{ id: string; from: DOMRect } | null>(null);

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [past, setPast] = useState<TierItem[][]>([]);
    const [future, setFuture] = useState<TierItem[][]>([]);
    const [queueScrolls, setQueueScrolls] = useState(false);

    const { items, tiers } = list;

    const byTier = useMemo(
        () => new Map(tiers.map((tier) => [tier.id, itemsInTier(items, tier.id)])),
        [items, tiers]
    );
    const counts = tiers.map((tier) => byTier.get(tier.id)?.length ?? 0);
    const unranked = useMemo(() => itemsInTier(items, null), [items]);

    const { size, scrolls } = useBoardMetrics(boardRef, counts);

    const selected = selectedId
        ? items.find((item) => item.id === selectedId)
        : undefined;
    /** The item in hand: whatever was tapped, otherwise the next one up. */
    const focus = selected ?? unranked[0] ?? null;
    const focusIsPlaced = !!focus?.tierId;
    const queue = useMemo(
        () => unranked.filter((item) => item.id !== focus?.id),
        [unranked, focus?.id]
    );
    const allRanked = unranked.length === 0;

    useLayoutEffect(() => {
        const element = queueRef.current;
        setQueueScrolls(!!element && element.scrollWidth > element.clientWidth);
    }, [queue.length, focusIsPlaced]);

    const commit = useCallback(
        (next: TierItem[]) => {
            if (next === items) return;
            setPast((stack) => [...stack.slice(-HISTORY_LIMIT + 1), items]);
            setFuture([]);
            update(list.id, { items: next });
        },
        [items, list.id, update]
    );

    useLayoutEffect(() => {
        const pending = flight.current;
        if (!pending) return;
        flight.current = null;

        const selector = `[data-tile-id="${CSS.escape(pending.id)}"]`;
        const element =
            boardRef.current?.querySelector<HTMLElement>(selector) ??
            dockRef.current?.querySelector<HTMLElement>(selector);
        if (!element) return;

        element.scrollIntoView({ block: "nearest" });
        flyTile(element, pending.from);
    }, [items]);

    const place = (
        item: TierItem,
        tierId: string | null,
        index?: number,
        from?: DOMRect | null
    ) => {
        const origin =
            from ??
            dockRef.current
                ?.querySelector<HTMLElement>(`[data-focus-tile]`)
                ?.getBoundingClientRect();
        if (origin) flight.current = { id: item.id, from: origin };
        setSelectedId(null);
        commit(moveItem(items, item.id, tierId, index));
    };

    const placeRef = useRef(place);
    placeRef.current = place;
    const itemsRef = useRef(items);
    itemsRef.current = items;

    const onDrop = useCallback(
        (id: string, target: DropTarget, ghost: DOMRect | null) => {
            const item = itemsRef.current.find((i) => i.id === id);
            if (!item) return;
            // Dropping an unranked tile back on the tray is a no-op, not a reorder.
            if (target.tierId === null && item.tierId === null) return;
            placeRef.current(item, target.tierId, target.index, ghost);
        },
        []
    );

    const isScrollable = useCallback(
        (zone: DragZone) =>
            zone === "board" ? scrolls : zone === "tray" ? queueScrolls : false,
        [scrolls, queueScrolls]
    );

    const { dragId, target, ghostRef, onPointerDown, suppressClick } =
        useDragEngine({ boardRef, dockRef, isScrollable, onDrop });

    const dragged = dragId ? items.find((item) => item.id === dragId) : null;

    const onTileTap = useCallback(
        (id: string) => {
            if (suppressClick.current) return;
            navigator.vibrate?.(4);
            setSelectedId((current) => (current === id ? null : id));
        },
        [suppressClick]
    );

    const onBoardClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (suppressClick.current || !focus) return;
        const element = event.target as Element;
        if (element.closest("[data-tile-id]")) return;
        const row = element.closest<HTMLElement>("[data-tier-id]");
        if (row) placeInTier(row.dataset.tierId!);
    };

    const placeInTier = (tierId: string) => {
        if (!focus) return;
        navigator.vibrate?.(6);
        if (focus.tierId === tierId) {
            setSelectedId(null);
            return;
        }
        place(focus, tierId);
    };

    const undo = () => {
        const previous = past[past.length - 1];
        if (!previous) return;
        setPast((stack) => stack.slice(0, -1));
        setFuture((stack) => [items, ...stack]);
        setSelectedId(null);
        update(list.id, { items: previous });
    };

    const redo = () => {
        const [next, ...rest] = future;
        if (!next) return;
        setFuture(rest);
        setPast((stack) => [...stack, items]);
        setSelectedId(null);
        update(list.id, { items: next });
    };

    const finish = () => {
        update(list.id, { status: "done" });
        navigate(`/list/${list.id}`);
    };

    // Items can vanish underneath the selection from the edit sheet.
    useEffect(() => {
        if (selectedId && !selected) setSelectedId(null);
    }, [selectedId, selected]);

    const focusTier = focus?.tierId
        ? tiers.find((tier) => tier.id === focus.tierId)
        : undefined;

    return (
        <div className="flex h-full flex-col" onPointerDown={onPointerDown}>
            <TopBar>
                <IconButton label="Back to home" onClick={() => navigate("/")}>
                    <ChevronLeft size={26} />
                </IconButton>
                <button
                    type="button"
                    onClick={() => navigate(`/edit/${list.id}`)}
                    className="min-w-0 flex-1 truncate py-2 text-left font-display text-[17px] font-bold"
                >
                    {list.name || "Untitled tier list"}
                </button>
                <IconButton
                    label="Undo"
                    disabled={past.length === 0}
                    onClick={undo}
                >
                    <Undo2 size={21} />
                </IconButton>
                <IconButton
                    label="Redo"
                    disabled={future.length === 0}
                    onClick={redo}
                >
                    <Redo2 size={21} />
                </IconButton>
                <IconButton label="More" onClick={() => open("menu")}>
                    <MoreHorizontal size={22} />
                </IconButton>
            </TopBar>

            <div
                ref={boardRef}
                data-scrolls={scrolls}
                onClick={onBoardClick}
                className={`mt-1 flex min-h-0 flex-1 flex-col ${
                    scrolls ? "scroll-area" : "overflow-hidden"
                }`}
                style={{
                    gap: ROW_GAP,
                    paddingLeft: BOARD_SIDE_PADDING,
                    paddingRight: BOARD_SIDE_PADDING,
                }}
            >
                {tiers.map((tier) => (
                    <TierRow
                        key={tier.id}
                        tier={tier}
                        items={byTier.get(tier.id) ?? []}
                        size={size}
                        showLabels={list.showLabels}
                        selectedId={selected?.id ?? null}
                        dragId={dragId}
                        active={target?.tierId === tier.id}
                        caretIndex={
                            target?.tierId === tier.id ? target.index : null
                        }
                        onTileTap={onTileTap}
                    />
                ))}
            </div>

            <div
                ref={dockRef}
                className="relative mt-1.5 shrink-0 rounded-t-[20px] border-t border-line bg-surface px-2.5 pt-2.5 transition-colors"
                data-active={target?.tierId === null}
                style={{
                    paddingBottom: "calc(8px + var(--safe-bottom))",
                    background:
                        target?.tierId === null ? "var(--raised)" : undefined,
                }}
            >
                {focus ? (
                    <>
                        <div className="flex gap-2.5">
                            <div data-focus-tile className="shrink-0">
                                <Tile
                                    key={focus.id}
                                    item={focus}
                                    size={FOCUS_SIZE}
                                    zone="focus"
                                    dimmed={dragId === focus.id}
                                    onTap={() => open("item", { item: focus.id })}
                                    tierName={focusTier?.name}
                                />
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col justify-between">
                                <div className="flex min-h-[26px] items-center gap-2">
                                    <p className="min-w-0 flex-1 truncate font-display text-[16px] font-bold leading-tight">
                                        {focus.name || "Untitled"}
                                    </p>
                                    {focusIsPlaced ? (
                                        <span className="shrink-0 text-xs text-muted">
                                            in {focusTier?.name}
                                        </span>
                                    ) : (
                                        <span className="shrink-0 text-xs tabular-nums text-muted">
                                            {unranked.length} left
                                        </span>
                                    )}
                                </div>

                                {focusIsPlaced ? (
                                    <div className="flex items-center justify-between gap-1">
                                        <IconButton
                                            label="Move left"
                                            className="bg-raised"
                                            onClick={() =>
                                                commit(
                                                    nudgeItem(items, focus.id, -1)
                                                )
                                            }
                                        >
                                            <ArrowLeft size={19} />
                                        </IconButton>
                                        <IconButton
                                            label="Move right"
                                            className="bg-raised"
                                            onClick={() =>
                                                commit(
                                                    nudgeItem(items, focus.id, 1)
                                                )
                                            }
                                        >
                                            <ArrowRight size={19} />
                                        </IconButton>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                place(focus, null, 0)
                                            }
                                            className="pressable flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-raised px-3 text-sm font-semibold"
                                        >
                                            <RotateCcw size={15} />
                                            Unrank
                                        </button>
                                        <IconButton
                                            label="Clear selection"
                                            onClick={() => setSelectedId(null)}
                                        >
                                            <X size={21} />
                                        </IconButton>
                                    </div>
                                ) : queue.length > 0 ? (
                                    <div
                                        ref={queueRef}
                                        data-scrolls={queueScrolls}
                                        aria-label="Up next"
                                        className="no-scrollbar -mr-2.5 flex gap-1 overflow-x-auto pr-2.5"
                                    >
                                        {queue.map((item) => (
                                            <Tile
                                                key={item.id}
                                                item={item}
                                                size={QUEUE_SIZE}
                                                zone="tray"
                                                selected={false}
                                                dimmed={dragId === item.id}
                                                onTap={onTileTap}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="pb-2 text-sm text-muted">
                                        Last one
                                    </p>
                                )}
                            </div>
                        </div>

                        <div
                            role="group"
                            aria-label={`Place ${focus.name || "item"} in a tier`}
                            className="no-scrollbar mt-2.5 flex gap-1.5 overflow-x-auto"
                        >
                            {tiers.map((tier) => (
                                <button
                                    key={tier.id}
                                    type="button"
                                    aria-label={`Place in ${tier.name}`}
                                    aria-current={
                                        focus.tierId === tier.id
                                            ? "true"
                                            : undefined
                                    }
                                    onClick={() => placeInTier(tier.id)}
                                    className="pressable flex h-[52px] min-w-[42px] flex-1 items-center justify-center rounded-xl px-1 font-display font-extrabold leading-none text-[#121214]"
                                    style={{
                                        background: tier.color,
                                        fontSize:
                                            tier.name.length <= 2
                                                ? 21
                                                : Math.min(
                                                      12,
                                                      labelFontSize(tier.name)
                                                  ),
                                        opacity:
                                            focus.tierId === tier.id ? 0.4 : 1,
                                        overflowWrap: "break-word",
                                    }}
                                >
                                    <span className="line-clamp-3 min-w-0">
                                        {tier.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="anim-rise flex items-center gap-3 pb-1">
                        <div className="min-w-0 flex-1">
                            <p className="font-display text-[17px] font-bold">
                                All ranked
                            </p>
                            <p className="text-sm text-muted">
                                Tap or drag any item to adjust
                            </p>
                        </div>
                        <Button icon={<Check size={18} />} onClick={finish}>
                            Finish
                        </Button>
                    </div>
                )}
                {focus && focusIsPlaced && allRanked && (
                    <p className="mt-2 text-center text-xs text-muted">
                        Everything is ranked.{" "}
                        <button
                            type="button"
                            className="font-semibold text-accent"
                            onClick={finish}
                        >
                            Finish
                        </button>
                    </p>
                )}
            </div>

            {dragged && (
                <div
                    ref={ghostRef}
                    aria-hidden
                    className="pointer-events-none fixed left-0 top-0 z-30 overflow-hidden rounded-xl"
                    style={{
                        width: GHOST_SIZE,
                        height: GHOST_SIZE,
                        boxShadow:
                            "0 16px 32px rgba(0,0,0,.55), 0 0 0 2px var(--accent)",
                    }}
                >
                    <div className="relative h-full w-full">
                        <TileFace item={dragged} size={GHOST_SIZE} />
                    </div>
                </div>
            )}

            {sheet === "menu" && (
                <Sheet title="List options" onClose={close}>
                    <div className="space-y-1 pb-2">
                        <MenuRow
                            icon={<Pencil size={20} />}
                            label="Edit items and tiers"
                            onPress={() => navigate(`/edit/${list.id}`)}
                        />
                        <MenuRow
                            icon={<Tag size={20} />}
                            label={
                                list.showLabels
                                    ? "Hide name labels"
                                    : "Show name labels"
                            }
                            onPress={() => {
                                update(list.id, {
                                    showLabels: !list.showLabels,
                                });
                                close();
                            }}
                        />
                        <MenuRow
                            icon={<ListChecks size={20} />}
                            label="Finish now"
                            onPress={finish}
                        />
                        <MenuRow
                            icon={<RotateCcw size={20} />}
                            label="Start ranking over"
                            onPress={() => {
                                commit(resetRanking(items));
                                close();
                            }}
                        />
                        <MenuRow
                            icon={<Trash2 size={20} />}
                            label="Delete list"
                            danger
                            onPress={() => {
                                remove(list.id);
                                navigate("/", { replace: true });
                                toast("List deleted", {
                                    action: {
                                        label: "Undo",
                                        onPress: () => restore(list),
                                    },
                                });
                            }}
                        />
                    </div>
                </Sheet>
            )}

            {sheet === "item" && param("item") && (
                <ItemSheet
                    list={list}
                    itemId={param("item")!}
                    onClose={close}
                    onOpenSearch={(id) => open("search", { replace: id })}
                    onOpenCrop={(id) => open("crop", { item: id })}
                />
            )}
            {sheet === "search" && (
                <SearchSheet
                    list={list}
                    replaceId={param("replace")}
                    onClose={close}
                />
            )}
            {sheet === "crop" && param("item") && (
                <CropSheet list={list} itemId={param("item")!} onClose={close} />
            )}
        </div>
    );
}

function MenuRow({
    icon,
    label,
    onPress,
    danger = false,
}: {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    danger?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onPress}
            className={`pressable flex min-h-[52px] w-full items-center gap-3.5 rounded-xl px-3 text-left text-[15px] font-medium ${
                danger ? "text-danger" : "text-ink"
            }`}
        >
            {icon}
            {label}
        </button>
    );
}

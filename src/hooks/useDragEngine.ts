import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
    type RefObject,
} from "react";
import { insertionIndex, type Box } from "../lib/board";

/**
 * Custom gesture layer, because the hard part of mobile tier lists isn't moving
 * a tile, it's telling a drag from a scroll. That conflict is why TierMaker has
 * a "Touch here to swipe" bar. The rules:
 *
 * - Tray tiles: vertical movement drags, horizontal scrolls the tray. Dragging
 *   begins instantly, because every tier is above the tray.
 * - Board tiles when the board fits on screen: any movement drags, since
 *   there's nothing to scroll.
 * - Board tiles when the board scrolls: vertical swipes scroll; a short hold or
 *   horizontal movement drags.
 *
 * The CSS touch-action on each tile must agree with these rules. See the
 * [data-scrolls] rules in index.css.
 */

const TOUCH_SLOP = 7;
const MOUSE_SLOP = 5;
const HOLD_MS = 170;
/** Keeps the tile visible above the finger. Hit-testing uses the tile, not the finger. */
const TOUCH_LIFT = 58;
const SCROLL_EDGE = 64;
const SCROLL_SPEED = 13;

export type DragZone = "tray" | "board" | "focus";

export interface DropTarget {
    /** null = back to the tray. */
    tierId: string | null;
    index: number;
}

interface RowLayout {
    tierId: string;
    rect: DOMRect;
    boxes: { id: string; box: Box }[];
}

interface Session {
    pointerId: number;
    id: string;
    zone: DragZone;
    isTouch: boolean;
    startX: number;
    startY: number;
    x: number;
    y: number;
    active: boolean;
    holdTimer?: number;
    rows: RowLayout[];
    boardRect: DOMRect | null;
    dockRect: DOMRect | null;
    target: DropTarget | null;
    rafId?: number;
}

interface Options {
    boardRef: RefObject<HTMLElement>;
    dockRef: RefObject<HTMLElement>;
    isScrollable: (zone: DragZone) => boolean;
    onDrop: (id: string, target: DropTarget, ghost: DOMRect | null) => void;
}

const sameTarget = (a: DropTarget | null, b: DropTarget | null) =>
    a?.tierId === b?.tierId && a?.index === b?.index;

export function useDragEngine({
    boardRef,
    dockRef,
    isScrollable,
    onDrop,
}: Options) {
    const [dragId, setDragId] = useState<string | null>(null);
    const [target, setTarget] = useState<DropTarget | null>(null);
    const ghostRef = useRef<HTMLDivElement>(null);
    const session = useRef<Session | null>(null);
    const suppressClick = useRef(false);

    const latest = useRef({ isScrollable, onDrop });
    latest.current = { isScrollable, onDrop };

    const ghostPoint = (s: Session) => ({
        x: s.x,
        y: s.y - (s.isTouch ? TOUCH_LIFT : 0),
    });

    const paintGhost = () => {
        const s = session.current;
        const ghost = ghostRef.current;
        if (!s || !ghost) return;
        const { x, y } = ghostPoint(s);
        ghost.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(1.08) rotate(-2deg)`;
    };

    const measure = (s: Session) => {
        const board = boardRef.current;
        s.boardRect = board?.getBoundingClientRect() ?? null;
        s.dockRect = dockRef.current?.getBoundingClientRect() ?? null;

        const rows = board?.querySelectorAll<HTMLElement>("[data-tier-id]");
        s.rows = Array.from(rows ?? [], (row) => ({
            tierId: row.dataset.tierId!,
            rect: row.getBoundingClientRect(),
            boxes: Array.from(
                row.querySelectorAll<HTMLElement>("[data-drag-id]"),
                (tile) => ({
                    id: tile.dataset.dragId!,
                    box: tile.getBoundingClientRect(),
                })
            ).filter((tile) => tile.id !== s.id),
        }));
    };

    const updateTarget = (s: Session) => {
        const { x, y } = ghostPoint(s);
        let next: DropTarget | null = null;

        if (s.dockRect && y >= s.dockRect.top) {
            next = { tierId: null, index: 0 };
        } else if (s.boardRect && y >= s.boardRect.top - 12) {
            // Rows match on height alone, so a tile dropped anywhere in the
            // band counts, including over the label.
            const row =
                s.rows.find((r) => y <= r.rect.bottom) ??
                s.rows[s.rows.length - 1];
            if (row) {
                next = {
                    tierId: row.tierId,
                    index: insertionIndex(
                        row.boxes.map((tile) => tile.box),
                        x,
                        y
                    ),
                };
            }
        }

        if (!sameTarget(next, s.target)) {
            s.target = next;
            setTarget(next);
        }
    };

    const autoScroll = () => {
        const s = session.current;
        const board = boardRef.current;
        if (!s?.active) return;

        const rect = s.boardRect;
        if (board && rect && board.scrollHeight > board.clientHeight) {
            const { y } = ghostPoint(s);
            const fromTop = y - rect.top;
            const fromBottom = rect.bottom - y;
            let delta = 0;
            if (fromTop < SCROLL_EDGE) {
                delta = -SCROLL_SPEED * (1 - Math.max(fromTop, 0) / SCROLL_EDGE);
            } else if (fromBottom < SCROLL_EDGE) {
                delta =
                    SCROLL_SPEED * (1 - Math.max(fromBottom, 0) / SCROLL_EDGE);
            }
            if (delta) {
                const before = board.scrollTop;
                board.scrollTop = before + delta;
                if (board.scrollTop !== before) {
                    measure(s);
                    updateTarget(s);
                }
            }
        }
        s.rafId = requestAnimationFrame(autoScroll);
    };

    const teardown = () => {
        const s = session.current;
        if (s) {
            window.clearTimeout(s.holdTimer);
            if (s.rafId) cancelAnimationFrame(s.rafId);
        }
        session.current = null;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onCancel);
        window.removeEventListener("keydown", onKey);
        document.documentElement.classList.remove("is-dragging");
        setDragId(null);
        setTarget(null);
    };

    const activate = () => {
        const s = session.current;
        if (!s || s.active) return;

        window.clearTimeout(s.holdTimer);
        s.active = true;
        suppressClick.current = true;
        navigator.vibrate?.(8);
        document.documentElement.classList.add("is-dragging");
        measure(s);
        setDragId(s.id);
        updateTarget(s);
        s.rafId = requestAnimationFrame(autoScroll);
    };

    const onMove = (event: PointerEvent) => {
        const s = session.current;
        if (!s || event.pointerId !== s.pointerId) return;
        s.x = event.clientX;
        s.y = event.clientY;

        if (s.active) {
            paintGhost();
            updateTarget(s);
            return;
        }

        const dx = Math.abs(s.x - s.startX);
        const dy = Math.abs(s.y - s.startY);
        const distance = Math.hypot(dx, dy);

        if (!s.isTouch) {
            if (distance > MOUSE_SLOP) activate();
            return;
        }
        if (distance < TOUCH_SLOP) return;

        const scrolls = latest.current.isScrollable(s.zone);
        const startsDrag = !scrolls
            ? true
            : s.zone === "tray"
              ? dy > dx
              : dx > dy;

        if (startsDrag) activate();
        else teardown(); // The browser owns this gesture now.
    };

    const finish = (commit: boolean) => {
        const s = session.current;
        if (!s) return;

        if (s.active) {
            const ghost = ghostRef.current;
            const rect = ghost?.getBoundingClientRect() ?? null;
            if (commit && s.target) {
                latest.current.onDrop(s.id, s.target, rect);
            }
            // Clear after the click that may follow this pointerup.
            window.setTimeout(() => (suppressClick.current = false), 0);
        }
        teardown();
    };

    const onUp = (event: PointerEvent) => {
        if (event.pointerId === session.current?.pointerId) finish(true);
    };

    const onCancel = (event: PointerEvent) => {
        if (event.pointerId === session.current?.pointerId) finish(false);
    };

    const onKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") finish(false);
    };

    const onPointerDown = useCallback(
        (event: ReactPointerEvent<HTMLElement>) => {
            if (session.current || event.button !== 0) return;
            const tile = (event.target as Element).closest<HTMLElement>(
                "[data-drag-id]"
            );
            if (!tile) return;

            const zone = tile.dataset.dragZone as DragZone;
            const isTouch = event.pointerType !== "mouse";
            const s: Session = {
                pointerId: event.pointerId,
                id: tile.dataset.dragId!,
                zone,
                isTouch,
                startX: event.clientX,
                startY: event.clientY,
                x: event.clientX,
                y: event.clientY,
                active: false,
                rows: [],
                boardRect: null,
                dockRect: null,
                target: null,
            };
            session.current = s;

            if (isTouch && zone === "board" && latest.current.isScrollable(zone)) {
                s.holdTimer = window.setTimeout(activate, HOLD_MS);
            }

            window.addEventListener("pointermove", onMove);
            window.addEventListener("pointerup", onUp);
            window.addEventListener("pointercancel", onCancel);
            window.addEventListener("keydown", onKey);
        },
        // The handlers only read refs, so one instance is safe for the session.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    // Must exist before the touch starts: Safari ignores preventDefault from
    // listeners added mid-gesture. This is what stops a held tile from also
    // scrolling the board once the drag activates.
    useEffect(() => {
        const block = (event: TouchEvent) => {
            if (session.current?.active && event.cancelable) {
                event.preventDefault();
            }
        };
        window.addEventListener("touchmove", block, { passive: false });
        return () => window.removeEventListener("touchmove", block);
    }, []);

    useEffect(
        () => () => teardown(),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    useLayoutEffect(() => {
        if (dragId) paintGhost();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dragId]);

    return { dragId, target, ghostRef, onPointerDown, suppressClick };
}

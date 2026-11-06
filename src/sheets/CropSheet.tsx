import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
} from "react";
import type { TierList } from "../types";
import { loadImage, originalFor, renderSquare } from "../lib/image";
import { useLists } from "../state/lists";
import { useToast } from "../components/Toast";
import { Button, Spinner } from "../components/ui";
import Sheet from "../components/Sheet";

const MAX_ZOOM = 5;

interface View {
    zoom: number;
    x: number;
    y: number;
}

const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

interface CropSheetProps {
    list: TierList;
    itemId: string;
    onClose: () => void;
}

export default function CropSheet({ list, itemId, onClose }: CropSheetProps) {
    const { update } = useLists();
    const toast = useToast();
    const item = list.items.find((candidate) => candidate.id === itemId);
    const source = originalFor(itemId) ?? item?.image ?? null;

    const frameRef = useRef<HTMLDivElement>(null);
    const [frame, setFrame] = useState(0);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [failed, setFailed] = useState(false);
    const [view, setView] = useState<View>({ zoom: 1, x: 0, y: 0 });

    const pointers = useRef(new Map<number, { x: number; y: number }>());
    const pinch = useRef<{ distance: number; zoom: number } | null>(null);

    useLayoutEffect(() => {
        setFrame(frameRef.current?.clientWidth ?? 0);
    }, [image]);

    useEffect(() => {
        if (!source) return;
        let cancelled = false;
        loadImage(source, source.startsWith("http"))
            .then((loaded) => !cancelled && setImage(loaded))
            .catch(() => !cancelled && setFailed(true));
        return () => {
            cancelled = true;
        };
    }, [source]);

    const baseScale = image
        ? frame / Math.min(image.naturalWidth, image.naturalHeight)
        : 1;
    const scale = baseScale * view.zoom;
    const width = (image?.naturalWidth ?? 0) * scale;
    const height = (image?.naturalHeight ?? 0) * scale;

    /** Keeps the image covering the square at any zoom. */
    const settle = (next: View): View => {
        if (!image) return next;
        const nextScale = baseScale * next.zoom;
        return {
            zoom: next.zoom,
            x: clamp(next.x, frame - image.naturalWidth * nextScale, 0),
            y: clamp(next.y, frame - image.naturalHeight * nextScale, 0),
        };
    };

    useLayoutEffect(() => {
        if (!image || !frame) return;
        setView(
            settle({
                zoom: 1,
                x:
                    -(image.naturalWidth * baseScale - frame) / 2,
                y: -(image.naturalHeight * baseScale - frame) * 0.2,
            })
        );
        // Runs once per loaded image.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [image, frame]);

    const zoomTo = (zoom: number) =>
        setView((current) => {
            // Zoom around the center of the frame.
            const ratio = zoom / current.zoom;
            const center = frame / 2;
            return settle({
                zoom,
                x: center - (center - current.x) * ratio,
                y: center - (center - current.y) * ratio,
            });
        });

    const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        pointers.current.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
        });
        if (pointers.current.size === 2) {
            const [a, b] = [...pointers.current.values()];
            pinch.current = {
                distance: Math.hypot(a.x - b.x, a.y - b.y),
                zoom: view.zoom,
            };
        }
    };

    const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
        const previous = pointers.current.get(event.pointerId);
        if (!previous) return;
        const point = { x: event.clientX, y: event.clientY };
        pointers.current.set(event.pointerId, point);

        if (pointers.current.size === 2 && pinch.current) {
            const [a, b] = [...pointers.current.values()];
            const distance = Math.hypot(a.x - b.x, a.y - b.y);
            zoomTo(
                clamp(
                    pinch.current.zoom * (distance / pinch.current.distance),
                    1,
                    MAX_ZOOM
                )
            );
        } else if (pointers.current.size === 1) {
            const dx = point.x - previous.x;
            const dy = point.y - previous.y;
            setView((current) =>
                settle({ ...current, x: current.x + dx, y: current.y + dy })
            );
        }
    };

    const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
        pointers.current.delete(event.pointerId);
        if (pointers.current.size < 2) pinch.current = null;
    };

    const apply = () => {
        if (!image) return;
        try {
            const dataUrl = renderSquare(image, {
                x: -view.x / scale,
                y: -view.y / scale,
                size: frame / scale,
            });
            update(list.id, (current) => ({
                items: current.items.map((candidate) =>
                    candidate.id === itemId
                        ? { ...candidate, image: dataUrl }
                        : candidate
                ),
            }));
            onClose();
        } catch {
            toast("That image can't be cropped");
        }
    };

    return (
        <Sheet
            title="Adjust crop"
            onClose={onClose}
            footer={
                <Button className="w-full" disabled={!image} onClick={apply}>
                    Save crop
                </Button>
            }
        >
            {failed ? (
                <p className="py-10 text-center text-muted">
                    That image can't be cropped.
                </p>
            ) : (
                <div className="mx-auto max-w-[340px] pb-2">
                    <div
                        ref={frameRef}
                        data-testid="crop-frame"
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={onPointerUp}
                        className="relative aspect-square w-full cursor-move touch-none overflow-hidden rounded-2xl bg-canvas"
                    >
                        {image ? (
                            <img
                                src={image.src}
                                alt=""
                                draggable={false}
                                className="pointer-events-none absolute left-0 top-0 max-w-none select-none"
                                style={{
                                    width,
                                    height,
                                    transform: `translate(${view.x}px, ${view.y}px)`,
                                }}
                            />
                        ) : (
                            <Spinner />
                        )}
                    </div>
                    <label className="mt-4 flex items-center gap-3 text-sm text-muted">
                        Zoom
                        <input
                            type="range"
                            min={1}
                            max={MAX_ZOOM}
                            step={0.01}
                            value={view.zoom}
                            onChange={(event) =>
                                zoomTo(Number(event.target.value))
                            }
                            className="min-w-0 flex-1 accent-[var(--accent)]"
                        />
                    </label>
                </div>
            )}
        </Sheet>
    );
}

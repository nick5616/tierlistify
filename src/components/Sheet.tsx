import {
    useEffect,
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
    type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const DISMISS_DISTANCE = 96;
const CLOSE_MS = 170;

interface SheetProps {
    title: string;
    onClose: () => void;
    children: ReactNode;
    /** Pinned below the scrolling content, for actions in thumb reach. */
    footer?: ReactNode;
    /** Tall sheets hold results that need room; short ones hug their content. */
    tall?: boolean;
    /** Fixed header content below the title, such as a search box. */
    subheader?: ReactNode;
}

/** Bottom sheet. Dismiss with the handle, the backdrop, Esc, or browser back. */
export default function Sheet({
    title,
    onClose,
    children,
    footer,
    tall = false,
    subheader,
}: SheetProps) {
    const panel = useRef<HTMLDivElement>(null);
    const drag = useRef<{ y: number; pointerId: number } | null>(null);
    const [closing, setClosing] = useState(false);

    const close = () => {
        if (closing) return;
        setClosing(true);
        window.setTimeout(onClose, CLOSE_MS);
    };

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") close();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    });

    const onHandleDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        drag.current = { y: event.clientY, pointerId: event.pointerId };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const onHandleMove = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (!drag.current || !panel.current) return;
        const distance = Math.max(0, event.clientY - drag.current.y);
        panel.current.style.transition = "none";
        panel.current.style.transform = `translateY(${distance}px)`;
    };

    const onHandleUp = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (!drag.current || !panel.current) return;
        const distance = event.clientY - drag.current.y;
        drag.current = null;
        panel.current.style.transition = "";
        if (distance > DISMISS_DISTANCE) close();
        else panel.current.style.transform = "";
    };

    return createPortal(
        <div
            className="fixed inset-0 z-40 flex flex-col justify-end"
            style={{ paddingBottom: "var(--keyboard)" }}
        >
            <div
                aria-hidden
                onClick={close}
                className="anim-fade absolute inset-0 bg-black/60 transition-opacity duration-150"
                style={{ opacity: closing ? 0 : undefined }}
            />
            <div
                ref={panel}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="anim-sheet relative mx-auto flex w-full max-w-lg flex-col rounded-t-3xl border-t border-line bg-surface transition-transform duration-150"
                style={{
                    maxHeight: "calc(100dvh - var(--keyboard) - var(--safe-top) - 24px)",
                    height: tall ? "92dvh" : undefined,
                    transform: closing ? "translateY(100%)" : undefined,
                }}
            >
                <div
                    onPointerDown={onHandleDown}
                    onPointerMove={onHandleMove}
                    onPointerUp={onHandleUp}
                    onPointerCancel={onHandleUp}
                    className="shrink-0 cursor-grab touch-none px-5 pb-2 pt-2.5"
                >
                    <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-line" />
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="truncate font-display text-xl font-bold">
                            {title}
                        </h2>
                        <button
                            type="button"
                            aria-label="Close"
                            onClick={close}
                            onPointerDown={(event) => event.stopPropagation()}
                            className="pressable -mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted"
                        >
                            <X size={22} />
                        </button>
                    </div>
                </div>
                {subheader && <div className="shrink-0 px-5">{subheader}</div>}
                <div className="scroll-area min-h-0 flex-1 px-5 pb-4">
                    {children}
                </div>
                {footer && (
                    <div
                        className="shrink-0 border-t border-line px-5 pt-3"
                        style={{
                            paddingBottom:
                                "calc(12px + var(--safe-bottom))",
                        }}
                    >
                        {footer}
                    </div>
                )}
                {!footer && (
                    <div style={{ height: "var(--safe-bottom)" }} />
                )}
            </div>
        </div>,
        document.body
    );
}

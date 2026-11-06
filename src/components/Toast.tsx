import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";

interface ToastOptions {
    action?: { label: string; onPress: () => void };
    duration?: number;
}

interface ToastState extends ToastOptions {
    key: number;
    message: string;
}

const ToastContext = createContext<
    ((message: string, options?: ToastOptions) => void) | null
>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState<ToastState | null>(null);
    const timer = useRef<number>();
    const counter = useRef(0);

    const show = useCallback((message: string, options: ToastOptions = {}) => {
        window.clearTimeout(timer.current);
        setToast({ ...options, message, key: ++counter.current });
        timer.current = window.setTimeout(
            () => setToast(null),
            options.duration ?? (options.action ? 6000 : 3200)
        );
    }, []);

    const value = useMemo(() => show, [show]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div
                aria-live="polite"
                className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4"
                style={{ paddingTop: "calc(var(--safe-top) + 10px)" }}
            >
                {toast && (
                    <div
                        key={toast.key}
                        className="anim-rise pointer-events-auto flex min-h-[44px] max-w-md items-center gap-3 rounded-2xl bg-ink py-2 pl-4 pr-2 text-sm font-medium text-canvas shadow-xl"
                    >
                        <span className="py-1 pr-2">{toast.message}</span>
                        {toast.action && (
                            <button
                                type="button"
                                onClick={() => {
                                    toast.action?.onPress();
                                    setToast(null);
                                }}
                                className="pressable shrink-0 rounded-xl bg-canvas/10 px-3 py-1.5 font-bold"
                            >
                                {toast.action.label}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const value = useContext(ToastContext);
    if (!value) throw new Error("useToast needs a ToastProvider");
    return value;
}

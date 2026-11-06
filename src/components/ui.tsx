import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    busy?: boolean;
    icon?: ReactNode;
}

const VARIANTS = {
    primary: "bg-accent text-on-accent font-bold",
    secondary: "bg-raised text-ink font-semibold",
    ghost: "text-ink font-semibold",
    danger: "bg-danger/15 text-danger font-semibold",
};

export function Button({
    variant = "primary",
    busy = false,
    icon,
    className = "",
    children,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            type="button"
            disabled={disabled || busy}
            className={`pressable flex min-h-[48px] items-center justify-center gap-2 rounded-2xl px-4 text-[15px] disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
            {...props}
        >
            {busy ? <Loader2 size={18} className="animate-spin" /> : icon}
            {children}
        </button>
    );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
}

export function IconButton({
    label,
    className = "",
    children,
    ...props
}: IconButtonProps) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className={`pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink disabled:opacity-30 ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export function Spinner({ label }: { label?: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted">
            <Loader2 size={26} className="animate-spin" />
            {label && <p className="text-sm">{label}</p>}
        </div>
    );
}

export function Splash() {
    return (
        <div className="flex h-full items-center justify-center text-muted">
            <Loader2 size={28} className="animate-spin" />
        </div>
    );
}

/** Top bar with safe-area padding. */
export function TopBar({ children }: { children: ReactNode }) {
    return (
        <header
            className="flex shrink-0 items-center gap-1 px-1.5"
            style={{ paddingTop: "calc(var(--safe-top) + 4px)" }}
        >
            {children}
        </header>
    );
}

export function NotFound({ message }: { message: string }) {
    const navigate = useNavigate();
    return (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="font-display text-xl font-bold">{message}</p>
            <Button variant="secondary" onClick={() => navigate("/")}>
                Back to home
            </Button>
        </div>
    );
}

export function SectionLabel({
    children,
    action,
}: {
    children: ReactNode;
    action?: ReactNode;
}) {
    return (
        <div className="mb-2.5 flex min-h-[28px] items-center justify-between gap-3">
            <h2 className="font-display text-[17px] font-bold">{children}</h2>
            {action}
        </div>
    );
}

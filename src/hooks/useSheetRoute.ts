import { useCallback } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

/**
 * Sheets are history entries, so the Android back button and the iOS edge swipe
 * close a sheet rather than leaving the screen.
 */
export function useSheetRoute() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    const open = useCallback(
        (sheet: string, extra: Record<string, string> = {}) => {
            const next = new URLSearchParams(location.search);
            next.set("sheet", sheet);
            Object.entries(extra).forEach(([key, value]) =>
                next.set(key, value)
            );
            navigate({ search: next.toString() }, { state: { sheet: true } });
        },
        [location.search, navigate]
    );

    const close = useCallback(() => {
        if (location.state?.sheet) {
            navigate(-1);
        } else {
            // Opened from a reloaded or pasted URL: there's nothing to go back to.
            navigate({ search: "" }, { replace: true });
        }
    }, [location.state, navigate]);

    return { sheet: params.get("sheet"), param: params.get.bind(params), open, close };
}

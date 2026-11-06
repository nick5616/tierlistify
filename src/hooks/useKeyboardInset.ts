import { useEffect } from "react";

/**
 * iOS doesn't resize the layout for the keyboard, so sheets with inputs would
 * sit behind it. This tracks the covered height in --keyboard.
 */
export function useKeyboardInset() {
    useEffect(() => {
        const viewport = window.visualViewport;
        if (!viewport) return;

        const update = () => {
            const covered = Math.max(
                0,
                window.innerHeight - viewport.height - viewport.offsetTop
            );
            document.documentElement.style.setProperty(
                "--keyboard",
                `${Math.round(covered)}px`
            );
        };

        update();
        viewport.addEventListener("resize", update);
        viewport.addEventListener("scroll", update);
        return () => {
            viewport.removeEventListener("resize", update);
            viewport.removeEventListener("scroll", update);
        };
    }, []);
}

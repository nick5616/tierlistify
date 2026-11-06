import { useMemo, useState } from "react";
import { Button } from "../components/ui";
import Sheet from "../components/Sheet";

/** One per line, or comma separated, so a list pasted from anywhere works. */
export function parseNames(text: string, existing: string[]): string[] {
    const seen = new Set(existing.map((name) => name.toLowerCase()));
    const names: string[] = [];

    const parts = text.includes("\n") ? text.split("\n") : text.split(",");
    for (const part of parts) {
        const name = part
            .replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "")
            .trim()
            .slice(0, 80);
        if (name && !seen.has(name.toLowerCase())) {
            seen.add(name.toLowerCase());
            names.push(name);
        }
    }
    return names;
}

interface NamesSheetProps {
    existing: string[];
    onAdd: (names: string[]) => void;
    onClose: () => void;
}

export default function NamesSheet({
    existing,
    onAdd,
    onClose,
}: NamesSheetProps) {
    const [text, setText] = useState("");
    const names = useMemo(() => parseNames(text, existing), [text, existing]);

    return (
        <Sheet
            title="Type names"
            onClose={onClose}
            footer={
                <Button
                    className="w-full"
                    disabled={names.length === 0}
                    onClick={() => onAdd(names)}
                >
                    {names.length > 0
                        ? `Add ${names.length} ${
                              names.length === 1 ? "item" : "items"
                          }`
                        : "Add items"}
                </Button>
            }
        >
            <p className="mb-2.5 text-sm text-muted">
                One per line or separated by commas. Pictures are optional, and
                you can find them afterwards.
            </p>
            <textarea
                autoFocus
                rows={7}
                value={text}
                onChange={(event) => setText(event.target.value)}
                aria-label="Item names"
                placeholder={"Naruto\nSasuke\nSakura"}
                className="block w-full resize-none rounded-xl border border-line bg-canvas p-3 placeholder:text-faint"
            />
        </Sheet>
    );
}

import { useRef, useState } from "react";
import { Crop, ImagePlus, Search, Trash2 } from "lucide-react";
import type { TierItem, TierList } from "../types";
import {
    fileToTileImage,
    isImageUrl,
    rememberOriginal,
} from "../lib/image";
import { useLists } from "../state/lists";
import { useToast } from "../components/Toast";
import { Button } from "../components/ui";
import { TileFace } from "../components/Tile";
import Sheet from "../components/Sheet";

interface ItemSheetProps {
    list: TierList;
    itemId: string;
    onClose: () => void;
    onOpenSearch: (itemId: string) => void;
    onOpenCrop: (itemId: string) => void;
}

export default function ItemSheet({
    list,
    itemId,
    onClose,
    onOpenSearch,
    onOpenCrop,
}: ItemSheetProps) {
    const { update } = useLists();
    const toast = useToast();
    const fileInput = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);

    const item = list.items.find((candidate) => candidate.id === itemId);
    if (!item) return null;

    const patch = (changes: Partial<TierItem>) =>
        update(list.id, (current) => ({
            items: current.items.map((candidate) =>
                candidate.id === itemId
                    ? { ...candidate, ...changes }
                    : candidate
            ),
        }));

    const onFile = async (file: File | undefined) => {
        if (!file) return;
        setBusy(true);
        try {
            rememberOriginal(itemId, file);
            patch({ image: await fileToTileImage(file), credit: undefined });
        } catch {
            toast("Couldn't read that image");
        } finally {
            setBusy(false);
        }
    };

    const removeItem = () => {
        const before = list.items;
        update(list.id, (current) => ({
            items: current.items.filter((c) => c.id !== itemId),
        }));
        onClose();
        toast(`Removed ${item.name || "item"}`, {
            action: {
                label: "Undo",
                onPress: () => update(list.id, { items: before }),
            },
        });
    };

    return (
        <Sheet title="Edit item" onClose={onClose}>
            <div className="space-y-4 pb-2">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        aria-label="Adjust crop"
                        disabled={!isImageUrl(item.image)}
                        onClick={() => onOpenCrop(itemId)}
                        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-raised"
                    >
                        <TileFace item={item} size={96} />
                    </button>
                    <div className="min-w-0 flex-1">
                        <label
                            htmlFor="item-name"
                            className="mb-1.5 block text-sm text-muted"
                        >
                            Name
                        </label>
                        <input
                            id="item-name"
                            value={item.name}
                            maxLength={80}
                            placeholder="Add a name"
                            enterKeyHint="done"
                            onChange={(event) =>
                                patch({ name: event.target.value })
                            }
                            onKeyDown={(event) => {
                                if (event.key === "Enter") onClose();
                            }}
                            className="w-full rounded-xl border border-line bg-canvas px-3 py-2.5 placeholder:text-faint"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Button
                        variant="secondary"
                        icon={<Search size={18} />}
                        onClick={() => onOpenSearch(itemId)}
                    >
                        Search
                    </Button>
                    <Button
                        variant="secondary"
                        busy={busy}
                        icon={<ImagePlus size={18} />}
                        onClick={() => fileInput.current?.click()}
                    >
                        Photo
                    </Button>
                    {isImageUrl(item.image) && (
                        <Button
                            variant="secondary"
                            icon={<Crop size={18} />}
                            onClick={() => onOpenCrop(itemId)}
                        >
                            Adjust crop
                        </Button>
                    )}
                    <Button
                        variant="danger"
                        icon={<Trash2 size={18} />}
                        onClick={removeItem}
                    >
                        Remove
                    </Button>
                </div>

                {item.credit && (
                    <p className="text-center text-xs text-muted">
                        {item.credit}
                    </p>
                )}

                <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(event) => {
                        onFile(event.target.files?.[0]);
                        event.target.value = "";
                    }}
                />
            </div>
        </Sheet>
    );
}

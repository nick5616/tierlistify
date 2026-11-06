import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
    ChevronLeft,
    ImagePlus,
    Search,
    Sparkles,
    Trash2,
    Type,
} from "lucide-react";
import type { TierItem, TierList } from "../types";
import { countRanked, newId } from "../lib/board";
import {
    fileToTileImage,
    nameFromFile,
    rememberOriginal,
} from "../lib/image";
import { findPicture } from "../lib/sources";
import { useLists } from "../state/lists";
import { useSheetRoute } from "../hooks/useSheetRoute";
import { useToast } from "../components/Toast";
import { Button, IconButton, SectionLabel, Splash, TopBar } from "../components/ui";
import { TileFace } from "../components/Tile";
import TierEditor from "../components/TierEditor";
import ItemSheet from "../sheets/ItemSheet";
import NamesSheet from "../sheets/NamesSheet";
import SearchSheet from "../sheets/SearchSheet";
import CropSheet from "../sheets/CropSheet";

const FIND_CONCURRENCY = 3;

export default function SetupScreen() {
    const { id } = useParams();
    const { get, ready } = useLists();
    const list = id ? get(id) : undefined;

    if (!ready) return <Splash />;
    if (!list) return <Navigate to="/" replace />;
    return <Setup list={list} />;
}

function AddButton({
    icon,
    label,
    onPress,
    busy,
}: {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    busy?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onPress}
            disabled={busy}
            className="pressable flex h-[72px] flex-col items-center justify-center gap-1.5 rounded-2xl bg-raised text-sm font-semibold disabled:opacity-50"
        >
            {icon}
            {label}
        </button>
    );
}

function Setup({ list }: { list: TierList }) {
    const navigate = useNavigate();
    const toast = useToast();
    const { update, remove, restore } = useLists();
    const { sheet, param, open, close } = useSheetRoute();

    const fileInput = useRef<HTMLInputElement>(null);
    const [importing, setImporting] = useState<{
        done: number;
        total: number;
    } | null>(null);
    const [finding, setFinding] = useState<{
        done: number;
        total: number;
    } | null>(null);
    const findAbort = useRef<AbortController | null>(null);

    useEffect(() => () => findAbort.current?.abort(), []);

    const textOnly = list.items.filter((item) => !item.image && item.name);
    const ranked = countRanked(list);
    const hasItems = list.items.length > 0;

    const addFiles = async (files: File[]) => {
        const images = files.filter((file) => file.type.startsWith("image/"));
        if (images.length === 0) return;

        setImporting({ done: 0, total: images.length });
        let failed = 0;

        // One at a time: decoding many camera photos at once can crash a phone tab.
        for (const [i, file] of images.entries()) {
            try {
                const item: TierItem = {
                    id: newId(),
                    name: nameFromFile(file.name),
                    image: await fileToTileImage(file),
                    tierId: null,
                };
                rememberOriginal(item.id, file);
                update(list.id, (current) => ({
                    items: [...current.items, item],
                }));
            } catch {
                failed++;
            }
            setImporting({ done: i + 1, total: images.length });
        }

        setImporting(null);
        if (failed > 0) {
            toast(
                `${failed} ${failed === 1 ? "image" : "images"} couldn't be read`
            );
        }
    };

    const addFilesRef = useRef(addFiles);
    addFilesRef.current = addFiles;

    useEffect(() => {
        const onPaste = (event: ClipboardEvent) => {
            const files = Array.from(event.clipboardData?.files ?? []);
            if (files.some((file) => file.type.startsWith("image/"))) {
                event.preventDefault();
                addFilesRef.current(files);
            }
        };
        window.addEventListener("paste", onPaste);
        return () => window.removeEventListener("paste", onPaste);
    }, []);

    const addNames = (names: string[]) => {
        const created = names.map(
            (name): TierItem => ({
                id: newId(),
                name,
                image: null,
                tierId: null,
            })
        );
        update(list.id, (current) => ({
            items: [...current.items, ...created],
        }));
        close();
    };

    const findPictures = async () => {
        const queue = [...textOnly];
        const total = queue.length;
        const controller = new AbortController();
        findAbort.current = controller;
        setFinding({ done: 0, total });

        let done = 0;
        let found = 0;

        const worker = async () => {
            for (let item = queue.shift(); item; item = queue.shift()) {
                try {
                    const image = await findPicture(
                        item.name,
                        controller.signal
                    );
                    if (image) {
                        found++;
                        const itemId = item.id;
                        update(list.id, (current) => ({
                            items: current.items.map((candidate) =>
                                candidate.id === itemId
                                    ? { ...candidate, image }
                                    : candidate
                            ),
                        }));
                    }
                } catch {
                    if (controller.signal.aborted) return;
                }
                setFinding({ done: ++done, total });
            }
        };

        await Promise.all(Array.from({ length: FIND_CONCURRENCY }, worker));
        if (controller.signal.aborted) return;

        setFinding(null);
        toast(
            found === 0
                ? "No pictures found. Tap an item to add one."
                : `Found ${found} of ${total}. Tap any item to change it.`
        );
    };

    const deleteList = () => {
        remove(list.id);
        navigate("/", { replace: true });
        if (list.items.length > 0 || list.name) {
            toast("List deleted", {
                action: { label: "Undo", onPress: () => restore(list) },
            });
        }
    };

    const start = () => {
        update(list.id, { status: "draft" });
        navigate(`/rank/${list.id}`);
    };

    return (
        <div className="flex h-full flex-col">
            <TopBar>
                <IconButton label="Back to home" onClick={() => navigate("/")}>
                    <ChevronLeft size={26} />
                </IconButton>
                <p className="min-w-0 flex-1 truncate font-display text-[17px] font-bold">
                    {hasItems || list.name ? "Set up list" : "New tier list"}
                </p>
                <IconButton label="Delete list" onClick={deleteList}>
                    <Trash2 size={19} className="text-muted" />
                </IconButton>
            </TopBar>

            <div className="scroll-area min-h-0 flex-1 px-4 pb-6 pt-1">
                <input
                    value={list.name}
                    maxLength={80}
                    aria-label="List title"
                    placeholder="What are you ranking?"
                    enterKeyHint="done"
                    onChange={(event) =>
                        update(list.id, { name: event.target.value })
                    }
                    onKeyDown={(event) => {
                        if (event.key === "Enter") event.currentTarget.blur();
                    }}
                    className="w-full border-b border-line bg-transparent pb-2.5 pt-1 font-display !text-[24px] font-bold outline-none placeholder:text-faint focus:border-accent"
                />

                <section className="mt-6">
                    <SectionLabel
                        action={
                            hasItems ? (
                                <span className="text-sm tabular-nums text-muted">
                                    {list.items.length}
                                </span>
                            ) : undefined
                        }
                    >
                        Items
                    </SectionLabel>

                    <div className="grid grid-cols-3 gap-2">
                        <AddButton
                            icon={<Search size={21} />}
                            label="Search"
                            onPress={() => open("search")}
                        />
                        <AddButton
                            icon={<ImagePlus size={21} />}
                            label={
                                importing
                                    ? `${importing.done}/${importing.total}`
                                    : "Photos"
                            }
                            busy={!!importing}
                            onPress={() => fileInput.current?.click()}
                        />
                        <AddButton
                            icon={<Type size={21} />}
                            label="Names"
                            onPress={() => open("names")}
                        />
                    </div>
                    <input
                        ref={fileInput}
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        data-testid="photo-input"
                        onChange={(event) => {
                            addFiles(Array.from(event.target.files ?? []));
                            event.target.value = "";
                        }}
                    />

                    {textOnly.length > 0 && (
                        <button
                            type="button"
                            disabled={!!finding}
                            onClick={findPictures}
                            className="pressable mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-accent/40 px-3 text-sm font-semibold text-accent disabled:opacity-70"
                        >
                            <Sparkles size={16} />
                            {finding
                                ? `Finding pictures ${finding.done}/${finding.total}`
                                : `Find pictures for ${textOnly.length} ${
                                      textOnly.length === 1 ? "item" : "items"
                                  }`}
                        </button>
                    )}

                    {hasItems ? (
                        <ul className="mt-3 grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                            {list.items.map((item) => (
                                <li key={item.id}>
                                    <button
                                        type="button"
                                        aria-label={`Edit ${item.name || "item"}`}
                                        onClick={() =>
                                            open("item", { item: item.id })
                                        }
                                        className="pressable relative block aspect-square w-full overflow-hidden rounded-lg bg-raised"
                                    >
                                        <TileFace
                                            item={item}
                                            size={84}
                                            showLabel
                                        />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-3 rounded-2xl border border-dashed border-line px-4 py-5 text-center text-sm leading-relaxed text-muted">
                            Search for pictures, pick several photos at once, or
                            paste a list of names. You can mix all three.
                        </p>
                    )}
                </section>

                <section className="mt-7">
                    <SectionLabel>Tiers</SectionLabel>
                    <TierEditor list={list} />
                </section>
            </div>

            <div
                className="shrink-0 border-t border-line bg-canvas px-4 pt-2.5"
                style={{ paddingBottom: "calc(10px + var(--safe-bottom))" }}
            >
                <Button className="w-full" disabled={!hasItems} onClick={start}>
                    {!hasItems
                        ? "Add items to start"
                        : ranked > 0
                          ? "Back to ranking"
                          : `Start ranking ${list.items.length} ${
                                list.items.length === 1 ? "item" : "items"
                            }`}
                </Button>
            </div>

            {sheet === "search" && (
                <SearchSheet
                    list={list}
                    replaceId={param("replace")}
                    onClose={close}
                />
            )}
            {sheet === "names" && (
                <NamesSheet
                    existing={list.items.map((item) => item.name)}
                    onAdd={addNames}
                    onClose={close}
                />
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
            {sheet === "crop" && param("item") && (
                <CropSheet list={list} itemId={param("item")!} onClose={close} />
            )}
        </div>
    );
}

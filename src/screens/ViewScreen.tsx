import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
    ChevronLeft,
    Download,
    Globe,
    ListOrdered,
    Trash2,
} from "lucide-react";
import type { TierList } from "../types";
import { saveListImage } from "../lib/exportImage";
import { useLists } from "../state/lists";
import { useSheetRoute } from "../hooks/useSheetRoute";
import { useToast } from "../components/Toast";
import { Button, IconButton, Splash, TopBar } from "../components/ui";
import TierTable from "../components/TierTable";
import PublishSheet from "../sheets/PublishSheet";

export default function ViewScreen() {
    const { id } = useParams();
    const { get, ready } = useLists();
    const list = id ? get(id) : undefined;

    if (!ready) return <Splash />;
    if (!list) return <Navigate to="/" replace />;
    return <View list={list} />;
}

function View({ list }: { list: TierList }) {
    const navigate = useNavigate();
    const toast = useToast();
    const { remove, restore } = useLists();
    const { sheet, open, close } = useSheetRoute();
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            const result = await saveListImage(list);
            if (result === "downloaded") toast("Image saved");
        } catch {
            toast("Couldn't create the image");
        } finally {
            setSaving(false);
        }
    };

    const deleteList = () => {
        remove(list.id);
        navigate("/", { replace: true });
        toast("List deleted", {
            action: { label: "Undo", onPress: () => restore(list) },
        });
    };

    return (
        <div className="flex h-full flex-col">
            <TopBar>
                <IconButton
                    label="Back to home"
                    onClick={() => navigate("/?tab=mine")}
                >
                    <ChevronLeft size={26} />
                </IconButton>
                <h1 className="min-w-0 flex-1 truncate font-display text-[17px] font-bold">
                    {list.name || "Untitled tier list"}
                </h1>
                <IconButton label="Delete list" onClick={deleteList}>
                    <Trash2 size={19} className="text-muted" />
                </IconButton>
            </TopBar>

            <div className="scroll-area min-h-0 flex-1 px-1.5 pb-4 pt-1.5">
                {list.published && (
                    <Link
                        to={`/p/${list.published.id}`}
                        className="mb-2 flex items-center gap-2 rounded-xl bg-surface px-3 py-2.5 text-sm"
                    >
                        <Globe size={16} className="shrink-0 text-accent" />
                        <span className="min-w-0 truncate text-muted">
                            Published as{" "}
                            <span className="font-semibold text-ink">
                                {list.published.author}
                            </span>
                        </span>
                    </Link>
                )}
                <TierTable
                    tiers={list.tiers}
                    items={list.items}
                    showLabels={list.showLabels}
                />
            </div>

            <div
                className="grid shrink-0 grid-cols-[1fr_1fr_1.4fr] gap-2 border-t border-line px-3 pt-2.5"
                style={{ paddingBottom: "calc(10px + var(--safe-bottom))" }}
            >
                <Button
                    variant="secondary"
                    icon={<ListOrdered size={18} />}
                    className="px-2"
                    onClick={() => {
                        navigate(`/rank/${list.id}`);
                    }}
                >
                    Edit
                </Button>
                <Button
                    variant="secondary"
                    busy={saving}
                    icon={<Download size={18} />}
                    className="px-2"
                    onClick={save}
                >
                    Save
                </Button>
                <Button
                    icon={<Globe size={18} />}
                    className="px-2"
                    onClick={() => open("publish")}
                >
                    {list.published ? "Published" : "Publish"}
                </Button>
            </div>

            {sheet === "publish" && (
                <PublishSheet list={list} onClose={close} />
            )}
        </div>
    );
}

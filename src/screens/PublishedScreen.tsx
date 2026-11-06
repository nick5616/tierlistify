import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Download, ListOrdered } from "lucide-react";
import type { CommunityList } from "../types";
import { countFork, fetchPublished, freshItems } from "../lib/community";
import { saveListImage } from "../lib/exportImage";
import { useLists } from "../state/lists";
import { useToast } from "../components/Toast";
import {
    Button,
    IconButton,
    NotFound,
    Spinner,
    TopBar,
} from "../components/ui";
import TierTable from "../components/TierTable";

const dateFormat = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
});

export default function PublishedScreen() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { create, lists } = useLists();

    const [list, setList] = useState<CommunityList | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!id) return;
        const controller = new AbortController();
        fetchPublished(id, controller.signal)
            .then(setList)
            .catch((caught: Error) => {
                if (!controller.signal.aborted) setError(caught.message);
            });
        return () => controller.abort();
    }, [id]);

    if (error) return <NotFound message={error} />;

    const isMine = lists.some((local) => local.published?.id === id);

    const rankIt = () => {
        if (!list) return;
        const fork = create({
            name: list.title,
            tiers: list.tiers,
            items: freshItems(list.items),
            forkedFrom: list.id,
        });
        countFork(list.id);
        navigate(`/rank/${fork.id}`);
    };

    const save = async () => {
        if (!list) return;
        setSaving(true);
        try {
            const result = await saveListImage({ ...list, name: list.title });
            if (result === "downloaded") toast("Image saved");
        } catch {
            toast("Couldn't create the image");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex h-full flex-col">
            <TopBar>
                <IconButton label="Back to home" onClick={() => navigate("/")}>
                    <ChevronLeft size={26} />
                </IconButton>
                <p className="min-w-0 flex-1 truncate text-sm text-muted">
                    Community list
                </p>
            </TopBar>

            {!list ? (
                <Spinner />
            ) : (
                <>
                    <div className="scroll-area min-h-0 flex-1 px-1.5 pb-4">
                        <div className="px-2.5 pb-3 pt-1">
                            <h1 className="font-display text-2xl font-bold leading-tight">
                                {list.title}
                            </h1>
                            <p className="mt-1 text-sm text-muted">
                                by{" "}
                                <span className="font-semibold text-ink">
                                    {list.author}
                                </span>{" "}
                                · {dateFormat.format(list.createdAt)}
                                {list.forks > 0 &&
                                    ` · ranked by ${list.forks} ${
                                        list.forks === 1 ? "other" : "others"
                                    }`}
                            </p>
                        </div>
                        <TierTable tiers={list.tiers} items={list.items} />
                    </div>

                    <div
                        className="grid shrink-0 grid-cols-[auto_1fr] gap-2 border-t border-line px-3 pt-2.5"
                        style={{
                            paddingBottom: "calc(10px + var(--safe-bottom))",
                        }}
                    >
                        <Button
                            variant="secondary"
                            busy={saving}
                            icon={<Download size={18} />}
                            onClick={save}
                        >
                            Save
                        </Button>
                        <Button
                            icon={<ListOrdered size={18} />}
                            onClick={rankIt}
                        >
                            {isMine ? "Rank it again" : "Rank this yourself"}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}

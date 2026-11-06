import { useState } from "react";
import { Link as LinkIcon } from "lucide-react";
import type { TierList } from "../types";
import {
    publishList,
    rememberedAuthor,
    rememberedInviteCode,
    unpublishList,
} from "../lib/community";
import { countRanked } from "../lib/board";
import { useLists } from "../state/lists";
import { useToast } from "../components/Toast";
import { Button } from "../components/ui";
import Sheet from "../components/Sheet";

interface PublishSheetProps {
    list: TierList;
    onClose: () => void;
}

export default function PublishSheet({ list, onClose }: PublishSheetProps) {
    const { update } = useLists();
    const toast = useToast();
    const [title, setTitle] = useState(list.name);
    const [author, setAuthor] = useState(
        list.published?.author ?? rememberedAuthor()
    );
    const [inviteCode, setInviteCode] = useState(rememberedInviteCode);
    const [busy, setBusy] = useState<"publish" | "remove" | null>(null);
    const [error, setError] = useState<string | null>(null);

    const published = list.published;
    const ranked = countRanked(list);

    const publish = async () => {
        setBusy("publish");
        setError(null);
        try {
            const finalAuthor = author.trim();
            const { id, token } = await publishList(
                list,
                title.trim(),
                finalAuthor,
                inviteCode.trim()
            );
            update(list.id, {
                name: title.trim(),
                published: {
                    id,
                    token,
                    author: finalAuthor || "Anonymous",
                    at: Date.now(),
                },
            });
            toast(published ? "Published list updated" : "Published");
            onClose();
        } catch (caught) {
            setError(
                caught instanceof Error ? caught.message : "Couldn't publish"
            );
            setBusy(null);
        }
    };

    const unpublish = async () => {
        if (!published) return;
        setBusy("remove");
        setError(null);
        try {
            await unpublishList(published.id, published.token);
            update(list.id, { published: undefined });
            toast("Removed from the community");
            onClose();
        } catch (caught) {
            setError(
                caught instanceof Error ? caught.message : "Couldn't remove it"
            );
            setBusy(null);
        }
    };

    const copyLink = async () => {
        if (!published) return;
        const url = `${window.location.origin}/p/${published.id}`;
        try {
            await navigator.clipboard.writeText(url);
            toast("Link copied");
        } catch {
            toast(url, { duration: 8000 });
        }
    };

    return (
        <Sheet
            title={published ? "Published list" : "Publish to the community"}
            onClose={onClose}
            footer={
                <div className="space-y-2">
                    {error && (
                        <p role="alert" className="text-center text-sm text-danger">
                            {error}
                        </p>
                    )}
                    <Button
                        className="w-full"
                        busy={busy === "publish"}
                        disabled={
                            !title.trim() ||
                            ranked === 0 ||
                            busy !== null ||
                            (!published && !inviteCode.trim())
                        }
                        onClick={publish}
                    >
                        {published ? "Update published list" : "Publish"}
                    </Button>
                </div>
            }
        >
            <div className="space-y-4 pb-2">
                <div>
                    <label
                        htmlFor="publish-title"
                        className="mb-1.5 block text-sm text-muted"
                    >
                        Title
                    </label>
                    <input
                        id="publish-title"
                        value={title}
                        maxLength={80}
                        onChange={(event) => setTitle(event.target.value)}
                        className="w-full rounded-xl border border-line bg-canvas px-3 py-3 placeholder:text-faint"
                    />
                </div>
                <div>
                    <label
                        htmlFor="publish-author"
                        className="mb-1.5 block text-sm text-muted"
                    >
                        Your name
                    </label>
                    <input
                        id="publish-author"
                        value={author}
                        maxLength={40}
                        autoComplete="nickname"
                        placeholder="Anonymous"
                        onChange={(event) => setAuthor(event.target.value)}
                        className="w-full rounded-xl border border-line bg-canvas px-3 py-3 placeholder:text-faint"
                    />
                </div>
                {!published && (
                    <div>
                        <label
                            htmlFor="publish-code"
                            className="mb-1.5 block text-sm text-muted"
                        >
                            Invite code
                        </label>
                        <input
                            id="publish-code"
                            value={inviteCode}
                            maxLength={80}
                            autoComplete="off"
                            autoCapitalize="none"
                            spellCheck={false}
                            onChange={(event) =>
                                setInviteCode(event.target.value)
                            }
                            className="w-full rounded-xl border border-line bg-canvas px-3 py-3 placeholder:text-faint"
                        />
                    </div>
                )}
                {ranked === 0 ? (
                    <p className="text-sm text-danger">
                        Rank at least one item before publishing.
                    </p>
                ) : (
                    <p className="text-sm text-muted">
                        Publishing is invite-only. Anyone can see a published
                        list and rank its items themselves.
                    </p>
                )}
                {published && (
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant="secondary"
                            icon={<LinkIcon size={17} />}
                            onClick={copyLink}
                        >
                            Copy link
                        </Button>
                        <Button
                            variant="danger"
                            busy={busy === "remove"}
                            disabled={busy !== null}
                            onClick={unpublish}
                        >
                            Unpublish
                        </Button>
                    </div>
                )}
            </div>
        </Sheet>
    );
}

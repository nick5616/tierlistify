import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { GripVertical, Plus, X } from "lucide-react";
import type { Tier, TierList } from "../types";
import { newId, remapTiers } from "../lib/board";
import { PALETTE, TIER_PRESETS } from "../lib/presets";
import { useLists } from "../state/lists";
import { useToast } from "./Toast";

const MAX_TIERS = 12;

export default function TierEditor({ list }: { list: TierList }) {
    const { update } = useLists();
    const toast = useToast();
    const [colorFor, setColorFor] = useState<string | null>(null);
    const rowsRef = useRef<HTMLUListElement>(null);
    const grip = useRef<{ id: string; lastY: number; rowHeight: number } | null>(
        null
    );

    const { tiers, items } = list;

    const setTiers = (next: Tier[]) => update(list.id, { tiers: next });

    const patchTier = (id: string, changes: Partial<Tier>) =>
        setTiers(
            tiers.map((tier) =>
                tier.id === id ? { ...tier, ...changes } : tier
            )
        );

    const addTier = () => {
        const used = new Set(tiers.map((tier) => tier.color));
        const color =
            PALETTE.find((candidate) => !used.has(candidate)) ?? PALETTE[0];
        setTiers([...tiers, { id: newId(), name: "New", color }]);
    };

    const removeTier = (tier: Tier) => {
        const before = { tiers, items };
        const affected = items.filter((item) => item.tierId === tier.id).length;
        update(list.id, {
            tiers: tiers.filter((candidate) => candidate.id !== tier.id),
            items: items.map((item) =>
                item.tierId === tier.id ? { ...item, tierId: null } : item
            ),
        });
        toast(
            affected > 0
                ? `${tier.name} removed. ${affected} back in the tray.`
                : `${tier.name} removed`,
            {
                action: {
                    label: "Undo",
                    onPress: () => update(list.id, before),
                },
            }
        );
    };

    const applyPreset = (presetId: string) => {
        const preset = TIER_PRESETS.find((p) => p.id === presetId);
        if (preset) update(list.id, remapTiers(list, preset.tiers));
    };

    const moveTier = (id: string, direction: -1 | 1) => {
        const from = tiers.findIndex((tier) => tier.id === id);
        const to = from + direction;
        if (from < 0 || to < 0 || to >= tiers.length) return false;
        const next = [...tiers];
        [next[from], next[to]] = [next[to], next[from]];
        setTiers(next);
        return true;
    };

    const onGripDown = (
        event: ReactPointerEvent<HTMLButtonElement>,
        id: string
    ) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        grip.current = {
            id,
            lastY: event.clientY,
            rowHeight:
                event.currentTarget.closest("li")?.getBoundingClientRect()
                    .height ?? 56,
        };
    };

    const onGripMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
        const state = grip.current;
        if (!state) return;
        const delta = event.clientY - state.lastY;
        if (Math.abs(delta) < state.rowHeight * 0.6) return;

        const direction = delta > 0 ? 1 : -1;
        if (moveTier(state.id, direction)) {
            state.lastY += direction * state.rowHeight;
            navigator.vibrate?.(5);
        }
    };

    const activePreset = TIER_PRESETS.find(
        (preset) =>
            preset.tiers.length === tiers.length &&
            preset.tiers.every((tier, i) => tier.name === tiers[i].name)
    )?.id;

    return (
        <div>
            <div className="no-scrollbar -mx-4 mb-3 flex gap-1.5 overflow-x-auto px-4">
                {TIER_PRESETS.map((preset) => (
                    <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyPreset(preset.id)}
                        aria-pressed={activePreset === preset.id}
                        className={`pressable h-9 shrink-0 rounded-full px-3.5 text-sm font-semibold ${
                            activePreset === preset.id
                                ? "bg-ink text-canvas"
                                : "bg-raised text-muted"
                        }`}
                    >
                        {preset.label}
                    </button>
                ))}
            </div>

            <ul ref={rowsRef} className="space-y-1.5">
                {tiers.map((tier, position) => (
                    <li key={tier.id} className="rounded-xl bg-surface">
                        <div className="flex items-center">
                            <button
                                type="button"
                                aria-label={`Reorder ${tier.name}. Use arrow keys.`}
                                onPointerDown={(event) =>
                                    onGripDown(event, tier.id)
                                }
                                onPointerMove={onGripMove}
                                onPointerUp={() => (grip.current = null)}
                                onPointerCancel={() => (grip.current = null)}
                                onKeyDown={(event) => {
                                    if (event.key === "ArrowUp") {
                                        event.preventDefault();
                                        moveTier(tier.id, -1);
                                    } else if (event.key === "ArrowDown") {
                                        event.preventDefault();
                                        moveTier(tier.id, 1);
                                    }
                                }}
                                className="flex h-12 w-9 shrink-0 cursor-grab touch-none items-center justify-center text-faint"
                            >
                                <GripVertical size={18} />
                            </button>
                            <button
                                type="button"
                                aria-label={`Color for ${tier.name}`}
                                aria-expanded={colorFor === tier.id}
                                onClick={() =>
                                    setColorFor((current) =>
                                        current === tier.id ? null : tier.id
                                    )
                                }
                                className="pressable mr-2 h-9 w-9 shrink-0 rounded-lg"
                                style={{ background: tier.color }}
                            />
                            <input
                                value={tier.name}
                                maxLength={24}
                                aria-label={`Tier ${position + 1} name`}
                                onChange={(event) =>
                                    patchTier(tier.id, {
                                        name: event.target.value,
                                    })
                                }
                                onBlur={(event) => {
                                    if (!event.target.value.trim()) {
                                        patchTier(tier.id, {
                                            name: String(position + 1),
                                        });
                                    }
                                }}
                                className="min-w-0 flex-1 bg-transparent py-3 font-semibold outline-none"
                            />
                            <button
                                type="button"
                                aria-label={`Remove ${tier.name}`}
                                disabled={tiers.length === 1}
                                onClick={() => removeTier(tier)}
                                className="pressable flex h-12 w-11 shrink-0 items-center justify-center text-muted disabled:opacity-30"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        {colorFor === tier.id && (
                            <div className="anim-rise flex flex-wrap gap-2 px-3 pb-3">
                                {PALETTE.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        aria-label={`Use color ${color}`}
                                        onClick={() => {
                                            patchTier(tier.id, { color });
                                            setColorFor(null);
                                        }}
                                        className="pressable h-9 w-9 rounded-full"
                                        style={{
                                            background: color,
                                            boxShadow:
                                                tier.color === color
                                                    ? "0 0 0 2px var(--surface), 0 0 0 4px var(--ink)"
                                                    : undefined,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            {tiers.length < MAX_TIERS && (
                <button
                    type="button"
                    onClick={addTier}
                    className="pressable mt-1.5 flex h-12 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-line text-sm font-semibold text-muted"
                >
                    <Plus size={17} />
                    Add tier
                </button>
            )}
        </div>
    );
}

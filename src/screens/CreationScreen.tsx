import React from "react";
import { ChevronLeft } from "lucide-react";
import { TierList } from "../types";
import AnimatedScreen from "../components/AnimatedScreen";
import Button from "../components/Button";
import TierBox from "../components/TierBox";
import DraggableItem from "../components/DraggableItem";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    useDroppable,
    closestCenter,
} from "@dnd-kit/core";

interface CreationScreenProps {
    currentTierList: Partial<TierList>;
    onBack: () => void;
    onComplete: () => void;
    onItemMove?: (
        itemId: string,
        fromTier: string | null,
        toTier: string | null
    ) => void;
}

// Component for unranked items section with droppable area
const UnrankedItemsSection: React.FC<{
    items: any[];
    activeId: string | null;
}> = ({ items, activeId }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: "unranked",
    });

    return (
        <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
                Unranked Items ({items.length})
            </h3>
            <div
                ref={setNodeRef}
                className={`flex flex-wrap gap-2 min-h-[60px] p-2 rounded transition-colors ${
                    isOver ? "bg-blue-100" : ""
                }`}
            >
                {items.map((item) => (
                    <DraggableItem
                        key={item.id}
                        item={item}
                        isDragging={activeId === item.id}
                    />
                ))}
            </div>
        </div>
    );
};

const CreationScreen: React.FC<CreationScreenProps> = ({
    currentTierList,
    onBack,
    onComplete: _onComplete,
    onItemMove,
}) => {
    const [activeId, setActiveId] = React.useState<string | null>(null);
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200, // 200ms touch delay to prevent scroll conflicts
                tolerance: 8, // Allow 8px movement during delay
            },
        }),
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px movement to distinguish from scroll
                delay: 150, // 150ms delay reduces conflict with scroll gestures
            },
        })
    );

    // Get unranked items (items without a tier)
    const unrankedItems =
        currentTierList.items?.filter((item) => !item.tier) || [];

    const handleDragStart = (event: DragStartEvent) => {
        console.log("handleDragStart", event);
        setActiveId(event.active.id as string);
    };

    const handleDragCancel = (event: any) => {
        console.log("handleDragCancel", event);
        console.log("Cancel reason:", event.reason);
        console.log("Event details:", {
            activatorEvent: event.activatorEvent,
            active: event.active,
            collisions: event.collisions,
            delta: event.delta,
            over: event.over,
        });
        setActiveId(null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        console.log("handleDragEnd", event);
        console.log("onItemMove exists:", !!onItemMove);
        const { active, over } = event;
        setActiveId(null);

        console.log("over:", over);
        if (!over || !onItemMove) {
            console.log(
                "Early return - over:",
                !!over,
                "onItemMove:",
                !!onItemMove
            );
            return;
        }

        const itemId = active.id as string;
        const targetTier = over.id as string;

        // Find the current tier of the item
        const item = currentTierList.items?.find((i) => i.id === itemId);
        const currentTier = item?.tier || null;

        console.log("Drag end details:", {
            itemId,
            targetTier,
            currentTier,
            item,
        });

        // Handle dropping to unranked section
        if (targetTier === "unranked") {
            if (currentTier !== null) {
                console.log(
                    "Moving to unranked:",
                    itemId,
                    currentTier,
                    "→",
                    null
                );
                onItemMove(itemId, currentTier, null);
            } else {
                console.log("Item already unranked, no move needed");
            }
            return;
        }

        // Only move if it's a different tier
        if (currentTier !== targetTier) {
            console.log(
                "Moving between tiers:",
                itemId,
                currentTier,
                "→",
                targetTier
            );
            onItemMove(itemId, currentTier, targetTier);
        } else {
            console.log("Item already in target tier, no move needed");
        }
    };

    return (
        <AnimatedScreen animation="slide">
            <div className="max-w-md mx-auto min-h-screen flex flex-col pb-safe">
                <div className="flex items-center mb-6 pt-4">
                    <Button variant="icon" onClick={onBack} className="mr-3">
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </Button>
                    <h1 className="text-xl font-semibold text-gray-900">
                        {currentTierList.name}
                    </h1>
                </div>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                >
                    <div className="flex-1 space-y-4 overflow-y-auto pb-6">
                        <div className="space-y-2">
                            {currentTierList.tiers?.map((tier) => {
                                const tieredItems =
                                    currentTierList.items?.filter(
                                        (item) => item.tier === tier.name
                                    ) || [];
                                return (
                                    <TierBox
                                        key={tier.name}
                                        tier={tier.name}
                                        color={tier.color}
                                        items={tieredItems}
                                        isDroppable={true}
                                        droppableId={tier.name}
                                        activeId={activeId}
                                    />
                                );
                            })}
                        </div>

                        {/* Unranked items section - now inside scrollable content */}
                        <UnrankedItemsSection
                            items={unrankedItems}
                            activeId={activeId}
                        />

                        {/* Optional bottom section inside scrollable area */}
                        {/* <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-600">
                                    {remainingItems} remaining
                                </p>
                                <Button variant="primary" onClick={onComplete}>
                                    Share
                                </Button>
                            </div> */}
                    </div>

                    <DragOverlay>
                        {activeId ? (
                            <div className="w-12 h-12 bg-white rounded flex items-center justify-center overflow-hidden shadow-lg border-2 border-blue-500">
                                {(() => {
                                    const item = currentTierList.items?.find(
                                        (i) => i.id === activeId
                                    );
                                    return item?.image.startsWith("http") ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-xl">
                                            {item?.image}
                                        </div>
                                    );
                                })()}
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </AnimatedScreen>
    );
};

export default CreationScreen;

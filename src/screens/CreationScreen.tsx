import React from "react";
import { ChevronLeft } from "lucide-react";
import { TierList, CreationTab } from "../types";
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
    useSensor,
    useSensors,
    useDroppable,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface CreationScreenProps {
    currentTierList: Partial<TierList>;
    currentItemIndex: number;
    creationTab: CreationTab;
    onBack: () => void;
    onTabChange: (tab: CreationTab) => void;
    onItemTierSelect: (tier: string) => void;
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
                <SortableContext
                    items={items.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {items.map((item) => (
                        <DraggableItem
                            key={item.id}
                            item={item}
                            isDragging={activeId === item.id}
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
};

const CreationScreen: React.FC<CreationScreenProps> = ({
    currentTierList,
    currentItemIndex,
    creationTab,
    onBack,
    onTabChange,
    onItemTierSelect,
    onComplete: _onComplete,
    onItemMove,
}) => {
    const [activeId, setActiveId] = React.useState<string | null>(null);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const currentItem = currentTierList.items?.[currentItemIndex];

    // Get unranked items (items without a tier)
    const unrankedItems =
        currentTierList.items?.filter((item) => !item.tier) || [];

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over || !onItemMove) return;

        const itemId = active.id as string;
        const targetTier = over.id as string;

        // Find the current tier of the item
        const item = currentTierList.items?.find((i) => i.id === itemId);
        const currentTier = item?.tier || null;

        // Handle dropping to unranked section
        if (targetTier === "unranked") {
            if (currentTier !== null) {
                onItemMove(itemId, currentTier, null);
            }
            return;
        }

        // Only move if it's a different tier
        if (currentTier !== targetTier) {
            onItemMove(itemId, currentTier, targetTier);
        }
    };

    return (
        <AnimatedScreen animation="slide">
            <div className="max-w-md mx-auto h-full flex flex-col">
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
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                        <div className="flex-1 overflow-y-auto space-y-2">
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
                                    />
                                );
                            })}
                        </div>

                        {/* Unranked items section */}
                        <UnrankedItemsSection
                            items={unrankedItems}
                            activeId={activeId}
                        />

                        {/* Fixed bottom section */}
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
                            <div className="w-12 h-12 bg-white rounded flex items-center justify-center overflow-hidden shadow-lg">
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

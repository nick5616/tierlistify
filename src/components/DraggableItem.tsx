import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { TierItem } from "../types";

interface DraggableItemProps {
    item: TierItem;
    isDragging?: boolean;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ item }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: item.id,
    });

    // Reduce console noise during testing
    if (isDragging) {
        console.log(`DraggableItem ${item.id} isDragging:`, isDragging);
    }

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`w-12 h-12 bg-white rounded flex items-center justify-center overflow-hidden cursor-grab border-2 ${
                isDragging ? "border-blue-500" : "border-gray-200"
            }`}
        >
            {item.image.startsWith("http") ? (
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="text-xl">{item.image}</div>
            )}
        </div>
    );
};

export default DraggableItem;

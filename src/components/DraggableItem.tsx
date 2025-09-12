import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { TierItem } from "../types";

interface DraggableItemProps {
    item: TierItem;
    isDragging?: boolean;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ item, isDragging }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging: isDndDragging,
    } = useDraggable({
        id: item.id,
    });

    const style = transform
        ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          }
        : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`w-12 h-12 bg-white rounded flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing border-2 transition-all ${
                isDragging || isDndDragging
                    ? "border-blue-500 shadow-lg scale-105"
                    : "border-gray-200 hover:border-gray-300"
            }`}
        >
            {item.image.startsWith("http") ? (
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                            parent.innerHTML = '<div class="text-xl">🖼️</div>';
                        }
                    }}
                />
            ) : (
                <div className="text-xl">{item.image}</div>
            )}
        </div>
    );
};

export default DraggableItem;

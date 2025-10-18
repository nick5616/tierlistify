import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { TierItem } from "../types";
import { getSizedImageUrl } from "../hooks/useUnsplashSearch";

// Function to get appropriately sized image for tier list items
const getTierItemImageUrl = (imageUrl: string): string => {
    if (!imageUrl.startsWith("http")) {
        return imageUrl; // Return as-is for emoji or other non-HTTP images
    }

    // If it's already a sized URL, extract the raw URL and resize it
    if (imageUrl.includes("&w=") && imageUrl.includes("&h=")) {
        // Extract the raw URL (everything before the first &w= parameter)
        const rawUrl = imageUrl.split("&w=")[0];
        return getSizedImageUrl(rawUrl, 48); // 48px for tier list items
    }

    // If it's a raw URL, add sizing parameters
    return getSizedImageUrl(imageUrl, 48);
};

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
            data-testid={`draggable-${item.id}`}
            className={`w-12 h-12 bg-white rounded flex items-center justify-center overflow-hidden cursor-grab border-2 draggable-item ${
                isDragging ? "border-blue-500" : "border-gray-200"
            }`}
            style={{
                touchAction: "none", // Prevent scrolling on this element
            }}
        >
            {item.image.startsWith("http") ? (
                <img
                    src={getTierItemImageUrl(item.image)}
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

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { TierItem } from "../types";
import DraggableItem from "./DraggableItem";
import { getSizedImageUrl } from "../hooks/useUnsplashSearch";

// Function to get appropriately sized image for tier list items
const getTierItemImageUrl = (imageUrl: string): string => {
    if (!imageUrl.startsWith("http")) {
        return imageUrl; // Return as-is for emoji or other non-HTTP images
    }

    // Only apply Unsplash sizing to Unsplash URLs
    const isUnsplashUrl = imageUrl.includes("unsplash.com") || 
                         imageUrl.includes("images.unsplash.com");
    
    if (!isUnsplashUrl) {
        // For non-Unsplash URLs (like Wikimedia Commons), return as-is
        return imageUrl;
    }

    // If it's already a sized URL, extract the raw URL and resize it
    if (imageUrl.includes("&w=") && imageUrl.includes("&h=")) {
        // Extract the raw URL (everything before the first &w= parameter)
        const rawUrl = imageUrl.split("&w=")[0];
        return getSizedImageUrl(rawUrl, 48); // 48px for tier list items
    }

    // If it's a raw Unsplash URL, add sizing parameters
    return getSizedImageUrl(imageUrl, 48);
};

interface TierBoxProps {
    tier: string;
    color: string;
    items: TierItem[];
    isPreview?: boolean;
    isDroppable?: boolean;
    droppableId?: string;
    activeId?: string | null;
}

const TierBox: React.FC<TierBoxProps> = ({
    tier,
    color,
    items,
    isPreview = false,
    isDroppable = false,
    droppableId,
    activeId,
}) => {
    const { isOver, setNodeRef } = useDroppable({
        id: droppableId || tier,
        disabled: !isDroppable,
    });
    return (
        <div
            ref={isDroppable ? setNodeRef : undefined}
            className={`bg-white rounded-lg overflow-hidden shadow-sm transition-all ${
                isOver ? "ring-2 ring-blue-500 ring-opacity-50" : ""
            }`}
        >
            <div className="flex">
                <div
                    className="w-16 flex items-center justify-center text-lg font-bold text-gray-800"
                    style={{ backgroundColor: color }}
                >
                    {tier}
                </div>
                <div
                    className={`flex-1 bg-gray-900 p-2 min-h-[60px] flex items-center gap-2 ${
                        isPreview ? "flex-wrap" : ""
                    } ${isOver ? "bg-blue-900" : ""}`}
                >
                    {isDroppable
                        ? items.map((item) => (
                              <DraggableItem
                                  key={item.id}
                                  item={item}
                                  isDragging={activeId === item.id}
                              />
                          ))
                        : items.map((item) => (
                              <div
                                  key={item.id}
                                  className="w-12 h-12 bg-white rounded flex items-center justify-center overflow-hidden"
                              >
                                  {item.image.startsWith("http") ? (
                                      <img
                                          src={getTierItemImageUrl(item.image)}
                                          alt={item.name}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                              const target =
                                                  e.target as HTMLImageElement;
                                              target.style.display = "none";
                                              const parent =
                                                  target.parentElement;
                                              if (parent) {
                                                  parent.innerHTML =
                                                      '<div class="text-xl">🖼️</div>';
                                              }
                                          }}
                                      />
                                  ) : (
                                      <div className="text-xl">
                                          {item.image}
                                      </div>
                                  )}
                              </div>
                          ))}
                </div>
            </div>
        </div>
    );
};

export default TierBox;

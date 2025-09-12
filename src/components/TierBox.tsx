import React from "react";
import { TierItem } from "../types";

interface TierBoxProps {
    tier: string;
    color: string;
    items?: TierItem[];
    onClick?: () => void;
    interactive?: boolean;
    className?: string;
}

const TierBox: React.FC<TierBoxProps> = ({
    tier,
    color,
    items = [],
    onClick,
    interactive = false,
    className = "",
}) => {
    const baseStyles = "rounded-lg overflow-hidden shadow-sm";
    const interactiveStyles = interactive
        ? "cursor-pointer border-2 border-transparent hover:border-gray-300 transition-colors"
        : "";

    return (
        <div
            className={`${baseStyles} ${interactiveStyles} ${className}`}
            onClick={onClick}
        >
            <div className="flex">
                <div
                    className="w-16 flex items-center justify-center text-lg font-bold text-gray-800"
                    style={{ backgroundColor: color }}
                >
                    {tier}
                </div>
                <div className="flex-1 bg-gray-900 p-2 min-h-[60px] flex items-center gap-2 flex-wrap">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="w-12 h-12 bg-white rounded flex items-center justify-center overflow-hidden"
                        >
                            {item.image.startsWith("http") ? (
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target =
                                            e.target as HTMLImageElement;
                                        target.style.display = "none";
                                        const parent = target.parentElement;
                                        if (parent) {
                                            parent.innerHTML =
                                                '<div class="text-xl">🖼️</div>';
                                        }
                                    }}
                                />
                            ) : (
                                <div className="text-xl">{item.image}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TierBox;

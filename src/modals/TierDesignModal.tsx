import React, { useState } from "react";
import { X } from "lucide-react";
import { Tier } from "../types";
import Button from "../components/Button";

interface TierDesignModalProps {
    onClose: () => void;
    onSave: (tier: Tier) => void;
    existingTier?: Tier;
}

const TierDesignModal: React.FC<TierDesignModalProps> = ({
    onClose,
    onSave,
    existingTier,
}) => {
    const [tierName, setTierName] = useState(existingTier?.name || "");
    const [selectedColor, setSelectedColor] = useState(
        existingTier?.color || "#ffb3ba"
    );

    const predefinedColors = [
        "#ffb3ba", // Light pink
        "#ffdfba", // Light orange
        "#ffffba", // Light yellow
        "#baffc9", // Light green
        "#bae1ff", // Light blue
        "#c9c9ff", // Light purple
        "#ffb3d1", // Pink
        "#ffcccb", // Light red
        "#d3d3d3", // Light gray
        "#98fb98", // Pale green
    ];

    const handleSave = () => {
        if (tierName.trim()) {
            onSave({
                name: tierName.trim(),
                color: selectedColor,
            });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {existingTier ? "Edit Tier" : "Design Tier"}
                    </h2>
                    <Button variant="icon" onClick={onClose}>
                        <X className="w-5 h-5 text-gray-500" />
                    </Button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tier Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Amazing, Good, Okay"
                            value={tierName}
                            onChange={(e) => setTierName(e.target.value)}
                            maxLength={20}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Tier Color
                        </label>
                        <div className="grid grid-cols-5 gap-3">
                            {predefinedColors.map((color) => (
                                <button
                                    key={color}
                                    className={`w-12 h-12 rounded-lg border-2 transition-all ${
                                        selectedColor === color
                                            ? "border-gray-800 scale-110"
                                            : "border-gray-200 hover:border-gray-400"
                                    }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setSelectedColor(color)}
                                />
                            ))}
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                            <input
                                type="color"
                                value={selectedColor}
                                onChange={(e) =>
                                    setSelectedColor(e.target.value)
                                }
                                className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                            />
                            <span className="text-sm text-gray-600">
                                Custom color
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="secondary" fullWidth onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={handleSave}
                            disabled={!tierName.trim()}
                        >
                            {existingTier ? "Update" : "Create"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TierDesignModal;

import React, { useState } from "react";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { TierList, Tier } from "../types";
import { defaultTierColors } from "../constants";
import AnimatedScreen from "../components/AnimatedScreen";
import Button from "../components/Button";
import TierDesignModal from "../modals/TierDesignModal";

interface InitScreenProps {
    currentTierList: Partial<TierList>;
    onUpdateTierList: (list: Partial<TierList>) => void;
    onBack: () => void;
    onAddItem: () => void;
    onBegin: () => void;
}

const InitScreen: React.FC<InitScreenProps> = ({
    currentTierList,
    onUpdateTierList,
    onBack,
    onAddItem,
    onBegin,
}) => {
    const [showTierModal, setShowTierModal] = useState(false);
    const [editingTier, setEditingTier] = useState<Tier | undefined>(undefined);
    const [hoveredTier, setHoveredTier] = useState<string | null>(null);

    // Initialize default tiers if none exist
    const defaultTiers: Tier[] = Object.entries(defaultTierColors)
        .filter(([tier]) => tier !== "F") // Remove F tier
        .map(([tier, color]) => ({ name: tier, color }));

    const currentTiers = currentTierList.tiers || defaultTiers;
    const canBegin =
        currentTierList.name && (currentTierList.items?.length || 0) > 0;

    const handleAddTier = () => {
        setEditingTier(undefined);
        setShowTierModal(true);
    };

    const handleEditTier = (tier: Tier) => {
        setEditingTier(tier);
        setShowTierModal(true);
    };

    const handleSaveTier = (tier: Tier) => {
        let updatedTiers: Tier[];

        if (editingTier) {
            // Update existing tier
            updatedTiers = currentTiers.map((t) =>
                t.name === editingTier.name ? tier : t
            );
        } else {
            // Add new tier
            updatedTiers = [...currentTiers, tier];
        }

        onUpdateTierList({
            ...currentTierList,
            tiers: updatedTiers,
        });
    };

    const handleDeleteTier = (tierName: string) => {
        const updatedTiers = currentTiers.filter((t) => t.name !== tierName);
        onUpdateTierList({
            ...currentTierList,
            tiers: updatedTiers,
        });
    };

    return (
        <AnimatedScreen animation="slide">
            <div className="max-w-md mx-auto">
                <div className="flex items-center mb-6 pt-4">
                    <Button variant="icon" onClick={onBack} className="mr-3">
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </Button>
                    <h1 className="text-xl font-semibold text-gray-900">
                        Create Tier List
                    </h1>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            What are you ranking?
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Favorite Fruits"
                            value={currentTierList.name || ""}
                            onChange={(e) =>
                                onUpdateTierList({
                                    ...currentTierList,
                                    name: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            What are the tiers?
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {currentTiers.map((tier) => (
                                <div
                                    key={tier.name}
                                    className="aspect-square rounded-lg flex items-center justify-center text-lg font-bold text-gray-800 cursor-pointer border-2 border-transparent hover:border-gray-300 transition-all relative group"
                                    style={{
                                        backgroundColor: tier.color,
                                    }}
                                    onMouseEnter={() =>
                                        setHoveredTier(tier.name)
                                    }
                                    onMouseLeave={() => setHoveredTier(null)}
                                    onClick={() => handleEditTier(tier)}
                                >
                                    {tier.name}
                                    {hoveredTier === tier.name && (
                                        <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
                                            <button
                                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteTier(tier.name);
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button
                                className="aspect-square rounded-lg flex items-center justify-center text-2xl font-bold text-gray-400 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:text-gray-600 transition-colors"
                                onClick={handleAddTier}
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            What are the items?
                        </label>
                        <div className="grid grid-cols-4 gap-3 mb-4">
                            {(currentTierList.items || []).map((item) => (
                                <div
                                    key={item.id}
                                    className="aspect-square bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center text-2xl"
                                >
                                    {item.image}
                                </div>
                            ))}
                            <button
                                className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
                                onClick={onAddItem}
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {canBegin && (
                        <Button variant="primary" fullWidth onClick={onBegin}>
                            Begin!
                        </Button>
                    )}
                </div>
            </div>

            {showTierModal && (
                <TierDesignModal
                    onClose={() => setShowTierModal(false)}
                    onSave={handleSaveTier}
                    existingTier={editingTier}
                />
            )}
        </AnimatedScreen>
    );
};

export default InitScreen;

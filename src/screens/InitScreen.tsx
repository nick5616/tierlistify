import React from "react";
import { ChevronLeft, Plus } from "lucide-react";
import { TierList } from "../types";
import { defaultTierColors } from "../constants";
import AnimatedScreen from "../components/AnimatedScreen";
import Button from "../components/Button";

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
    const canBegin =
        currentTierList.name && (currentTierList.items?.length || 0) > 0;

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
                            {Object.entries(defaultTierColors).map(
                                ([tier, color]) => (
                                    <div
                                        key={tier}
                                        className="aspect-square rounded-lg flex items-center justify-center text-lg font-bold text-gray-800 cursor-pointer border-2 border-transparent hover:border-gray-300 transition-colors"
                                        style={{
                                            backgroundColor: color as string,
                                        }}
                                    >
                                        {tier}
                                    </div>
                                )
                            )}
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
        </AnimatedScreen>
    );
};

export default InitScreen;

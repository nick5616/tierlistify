import React from "react";
import { ChevronLeft } from "lucide-react";
import { TierList, CreationTab } from "../types";
import { defaultTierColors } from "../constants";
import AnimatedScreen from "../components/AnimatedScreen";
import Button from "../components/Button";
import TierBox from "../components/TierBox";

interface CreationScreenProps {
    currentTierList: Partial<TierList>;
    currentItemIndex: number;
    creationTab: CreationTab;
    onBack: () => void;
    onTabChange: (tab: CreationTab) => void;
    onItemTierSelect: (tier: string) => void;
    onComplete: () => void;
}

const CreationScreen: React.FC<CreationScreenProps> = ({
    currentTierList,
    currentItemIndex,
    creationTab,
    onBack,
    onTabChange,
    onItemTierSelect,
    onComplete,
}) => {
    const currentItem = currentTierList.items?.[currentItemIndex];
    const remainingItems =
        (currentTierList.items?.length || 0) - currentItemIndex;

    return (
        <AnimatedScreen animation="slide">
            <div className="max-w-md mx-auto">
                <div className="flex items-center mb-6 pt-4">
                    <Button variant="icon" onClick={onBack} className="mr-3">
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </Button>
                    <h1 className="text-xl font-semibold text-gray-900">
                        {currentTierList.name}
                    </h1>
                </div>

                <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                    <button
                        className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                            creationTab === "build"
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-gray-600"
                        }`}
                        onClick={() => onTabChange("build")}
                    >
                        Build
                    </button>
                    <button
                        className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                            creationTab === "preview"
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-gray-600"
                        }`}
                        onClick={() => onTabChange("preview")}
                    >
                        Preview
                    </button>
                </div>

                {creationTab === "build" ? (
                    <div className="space-y-6">
                        {currentItem ? (
                            <>
                                <div className="text-center">
                                    <div className="w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center text-6xl mx-auto mb-4">
                                        {currentItem.image}
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {currentItem.name}
                                    </h3>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    {currentTierList.tiers?.map((tier) => (
                                        <button
                                            key={tier.name}
                                            className="aspect-square rounded-lg flex items-center justify-center text-xl font-bold text-gray-800 hover:scale-105 transition-transform shadow-sm"
                                            style={{
                                                backgroundColor: tier.color,
                                            }}
                                            onClick={() =>
                                                onItemTierSelect(tier.name)
                                            }
                                        >
                                            {tier.name}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-16">
                                <div className="text-4xl mb-4">🎉</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    All items ranked!
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Switch to preview to see your tier list
                                </p>
                                <Button
                                    variant="primary"
                                    onClick={() => onTabChange("preview")}
                                >
                                    View Preview
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
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
                                />
                            );
                        })}

                        <div className="flex justify-between items-center pt-4">
                            <p className="text-sm text-gray-600">
                                {remainingItems} remaining
                            </p>
                            <Button variant="primary" onClick={onComplete}>
                                Share
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AnimatedScreen>
    );
};

export default CreationScreen;

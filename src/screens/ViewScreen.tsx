import React from "react";
import { ChevronLeft, Share2 } from "lucide-react";
import { TierList } from "../types";
import { defaultTierColors } from "../constants";
import AnimatedScreen from "../components/AnimatedScreen";
import Button from "../components/Button";
import TierBox from "../components/TierBox";

interface ViewScreenProps {
    tierList: Partial<TierList>;
    onBack: () => void;
    onShare?: () => void;
}

const ViewScreen: React.FC<ViewScreenProps> = ({
    tierList,
    onBack,
    onShare,
}) => {
    return (
        <AnimatedScreen animation="fade">
            <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-6 pt-4">
                    <Button variant="icon" onClick={onBack}>
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </Button>
                    <h1 className="text-xl font-semibold text-gray-900">
                        {tierList.name}
                    </h1>
                    <Button variant="icon" onClick={onShare}>
                        <Share2 className="w-5 h-5" />
                    </Button>
                </div>

                <div className="space-y-4">
                    {tierList.tiers?.map((tier) => {
                        const tieredItems =
                            tierList.items?.filter(
                                (item) => item.tier === tier
                            ) || [];
                        return (
                            <TierBox
                                key={tier}
                                tier={tier}
                                color={defaultTierColors[tier]}
                                items={tieredItems}
                                isPreview
                            />
                        );
                    })}
                </div>
            </div>
        </AnimatedScreen>
    );
};

export default ViewScreen;

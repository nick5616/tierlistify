import React from "react";
import { ChevronLeft, Share2, Home } from "lucide-react";
import { TierList } from "../types";
import AnimatedScreen from "../components/AnimatedScreen";
import Button from "../components/Button";
import TierBox from "../components/TierBox";

interface ViewScreenProps {
    tierList: Partial<TierList>;
    onBack: () => void;
    onShare?: () => void;
    onGoHome?: () => void;
}

const ViewScreen: React.FC<ViewScreenProps> = ({
    tierList,
    onBack,
    onShare,
    onGoHome,
}) => {
    return (
        <AnimatedScreen animation="fade">
            <div className="max-w-md mx-auto min-h-screen flex flex-col pb-safe">
                <div className="flex items-center justify-between mb-6 pt-4">
                    <div className="flex items-center space-x-2">
                        <Button variant="icon" onClick={onBack}>
                            <ChevronLeft className="w-6 h-6 text-gray-600" />
                        </Button>
                        <Button variant="icon" onClick={onGoHome}>
                            <Home className="w-5 h-5 text-gray-600" />
                        </Button>
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900">
                        {tierList.name}
                    </h1>
                    <Button variant="icon" onClick={onShare}>
                        <Share2 className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto pb-6">
                    {tierList.tiers?.map((tier) => {
                        const tieredItems =
                            tierList.items?.filter(
                                (item) => item.tier === tier.name
                            ) || [];
                        return (
                            <TierBox
                                key={tier.name}
                                tier={tier.name}
                                color={tier.color}
                                items={tieredItems}
                                isPreview
                            />
                        );
                    })}

                    {/* Share section at bottom */}
                    <div className="pt-6 border-t border-gray-200">
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Share Your Tier List
                            </h3>
                            <p className="text-sm text-gray-600">
                                Let others see your rankings
                            </p>
                        </div>
                        <div className="flex gap-3 mb-8">
                            <Button
                                variant="secondary"
                                onClick={onGoHome}
                                className="w-24"
                            >
                                <Home className="w-4 h-4 mr-1" />
                                Home
                            </Button>
                            <Button
                                variant="primary"
                                onClick={onShare}
                                className="flex-1"
                            >
                                <Share2 className="w-5 h-5 mr-2" />
                                Copy Link to Share
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedScreen>
    );
};

export default ViewScreen;

import React from "react";
import AdSenseBanner from "./AdSenseBanner";

interface LayoutWithAdsProps {
    children: React.ReactNode;
    showBottomAd?: boolean;
    adSlot?: string;
}

const LayoutWithAds: React.FC<LayoutWithAdsProps> = ({
    children,
    showBottomAd = true,
    adSlot = "YOUR_AD_SLOT_ID", // Replace with your actual ad slot ID
}) => {
    return (
        <div className="layout-with-ads h-full flex flex-col">
            {/* Main content area */}
            <div className="flex-1 overflow-auto">{children}</div>

            {/* Bottom banner ad */}
            {showBottomAd && (
                <div className="bottom-ad-container bg-gray-50 border-t border-gray-200 p-2 flex-shrink-0">
                    <AdSenseBanner
                        adSlot={adSlot}
                        adFormat="horizontal"
                        className="w-full max-w-md mx-auto"
                    />
                </div>
            )}
        </div>
    );
};

export default LayoutWithAds;

import React, { useEffect, useRef } from "react";

interface AdSenseBannerProps {
    adSlot: string;
    adFormat?: "auto" | "rectangle" | "vertical" | "horizontal";
    fullWidthResponsive?: boolean;
    className?: string;
}

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
    adSlot,
    adFormat = "auto",
    fullWidthResponsive = true,
    className = "",
}) => {
    const adRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            // Initialize adsbygoogle array if it doesn't exist
            if (typeof window !== "undefined") {
                window.adsbygoogle = window.adsbygoogle || [];
                window.adsbygoogle.push({});
            }
        } catch (error) {
            console.error("AdSense error:", error);
        }
    }, []);

    return (
        <div className={`adsense-container ${className}`} ref={adRef}>
            <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-3447471415025415"
                data-ad-slot={adSlot}
                data-ad-format={adFormat}
                data-full-width-responsive={fullWidthResponsive.toString()}
            />
        </div>
    );
};

export default AdSenseBanner;

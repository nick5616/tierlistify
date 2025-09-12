import React from "react";

interface AnimatedScreenProps {
    children: React.ReactNode;
    animation: "fade" | "slide";
}

const AnimatedScreen: React.FC<AnimatedScreenProps> = ({
    children,
    animation,
}) => {
    return (
        <div
            className={`h-screen w-screen bg-gray-50 overflow-y-auto ${
                animation === "fade" ? "animate-fade-in" : "animate-slide-in"
            }`}
        >
            <div className="p-4 h-full">{children}</div>
        </div>
    );
};

export default AnimatedScreen;

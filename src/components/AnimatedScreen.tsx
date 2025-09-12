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
            className={`min-h-screen bg-gray-50 p-4 ${
                animation === "fade" ? "animate-fade-in" : "animate-slide-in"
            }`}
        >
            {children}
        </div>
    );
};

export default AnimatedScreen;

import React from "react";

interface AnimatedModalProps {
    children: React.ReactNode;
}

const AnimatedModal: React.FC<AnimatedModalProps> = ({ children }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50 animate-fade-in">
            {children}
        </div>
    );
};

export default AnimatedModal;

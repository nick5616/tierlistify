import React from "react";

interface AnimatedModalProps {
    children: React.ReactNode;
    onClose?: () => void;
}

const AnimatedModal: React.FC<AnimatedModalProps> = ({ children, onClose }) => {
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && onClose) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50 animate-fade-in"
            onClick={handleBackdropClick}
        >
            {children}
        </div>
    );
};

export default AnimatedModal;

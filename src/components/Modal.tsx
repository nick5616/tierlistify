import React from "react";
import AnimatedModal from "./AnimatedModal";

interface ModalProps {
    children: React.ReactNode;
    maxHeight?: boolean;
    onClose?: () => void;
}

const Modal: React.FC<ModalProps> = ({
    children,
    maxHeight = false,
    onClose,
}) => {
    return (
        <AnimatedModal onClose={onClose}>
            <div
                className={`bg-white rounded-t-3xl w-full p-6 pb-8 ${
                    maxHeight ? "max-h-[80vh] overflow-y-auto" : ""
                }`}
            >
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
                <div className="max-w-md mx-auto space-y-6">{children}</div>
            </div>
        </AnimatedModal>
    );
};

export default Modal;

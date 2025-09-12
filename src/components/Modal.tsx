import React from "react";
import { animations } from "../constants";

interface ModalProps {
    children: React.ReactNode;
    maxHeight?: boolean;
}

const Modal: React.FC<ModalProps> = ({ children, maxHeight = false }) => {
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50"
            style={animations.fadeIn}
        >
            <div
                className={`bg-white rounded-t-3xl w-full p-6 pb-8 ${
                    maxHeight ? "max-h-[80vh] overflow-y-auto" : ""
                }`}
            >
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
                <div className="max-w-md mx-auto space-y-6">{children}</div>
            </div>
        </div>
    );
};

export default Modal;

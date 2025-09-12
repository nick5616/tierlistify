import React from "react";
import { mockSearchResults } from "../constants";
import Modal from "../components/Modal";

interface ImageSearchModalProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onImageSelect: (image: string) => void;
}

const ImageSearchModal: React.FC<ImageSearchModalProps> = ({
    searchQuery,
    onSearchChange,
    onImageSelect,
}) => {
    return (
        <Modal maxHeight>
            <div>
                <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Search for images..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-4 gap-3">
                {mockSearchResults.map((emoji, index) => (
                    <button
                        key={index}
                        className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center text-3xl hover:bg-blue-50 transition-colors border-2 border-transparent hover:border-blue-200"
                        onClick={() => onImageSelect(emoji)}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </Modal>
    );
};

export default ImageSearchModal;

import React, { useRef, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Modal from "../components/Modal";
import {
    useUnsplashSearch,
    getSizedImageUrl,
} from "../hooks/useUnsplashSearch";

interface ImageSearchModalProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onImageSelect: (image: string) => void;
    onClose?: () => void;
}

const ImageSearchModal: React.FC<ImageSearchModalProps> = ({
    searchQuery,
    onSearchChange,
    onImageSelect,
    onClose,
}) => {
    const { images, loading, error } = useUnsplashSearch(searchQuery, 1000);
    const gridRef = useRef<HTMLDivElement>(null);
    const [imageSize, setImageSize] = useState(100); // Default size for grid items

    // Calculate image size based on grid container width
    useEffect(() => {
        const updateImageSize = () => {
            if (gridRef.current) {
                const containerWidth = gridRef.current.offsetWidth;
                // For 4-column grid, each item should be about 1/4 of container width minus gaps
                const itemWidth = (containerWidth - 36) / 4; // 36px for 3 gaps of 12px each
                setImageSize(Math.min(itemWidth, 150)); // Max 150px per item
            }
        };

        updateImageSize();
        window.addEventListener("resize", updateImageSize);

        return () => window.removeEventListener("resize", updateImageSize);
    }, []);

    return (
        <Modal maxHeight onClose={onClose}>
            <div>
                <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Search for images..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                    <span className="ml-2 text-gray-500">Searching...</span>
                </div>
            ) : error ? (
                <div className="text-center py-8 text-red-500">
                    <p>Error: {error}</p>
                </div>
            ) : images.length > 0 ? (
                <div ref={gridRef} className="grid grid-cols-4 gap-3">
                    {images.map((image) => (
                        <button
                            key={image.id}
                            className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden hover:bg-blue-50 transition-colors border-2 border-transparent hover:border-blue-200"
                            onClick={() =>
                                onImageSelect(
                                    getSizedImageUrl(image.urls.raw, imageSize)
                                )
                            }
                        >
                            <img
                                src={getSizedImageUrl(
                                    image.urls.raw,
                                    imageSize
                                )}
                                alt={image.alt_description || "Search result"}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            ) : searchQuery ? (
                <div className="text-center py-8 text-gray-500">
                    <p>No images found for "{searchQuery}"</p>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <p>Enter a search term to find images</p>
                </div>
            )}
        </Modal>
    );
};

export default ImageSearchModal;

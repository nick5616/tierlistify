import React, { useEffect, useRef, useState } from "react";
import { Upload, Search, Camera, Loader2 } from "lucide-react";
import { TierItem } from "../types";
import Modal from "../components/Modal";
import Button from "../components/Button";
import {
    useUnsplashSearch,
    getSizedImageUrl,
} from "../hooks/useUnsplashSearch";

interface ItemUploadModalProps {
    itemName: string;
    selectedImage: string;
    onNameChange: (name: string) => void;
    onImageSelect: (image: string) => void;
    onSearchClick: () => void;
    onCreateItem: (item: TierItem) => void;
    onClose?: () => void;
}

const ItemUploadModal: React.FC<ItemUploadModalProps> = ({
    itemName,
    selectedImage,
    onNameChange,
    onImageSelect,
    onSearchClick,
    onCreateItem,
    onClose,
}) => {
    const { images, loading, error } = useUnsplashSearch(itemName, 1000);
    const previewRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageSize, setImageSize] = useState(200); // Default size
    const [uploadedImage, setUploadedImage] = useState<string>("");
    const createButtonDisabled = !itemName || !selectedImage;
    // Calculate image size based on preview component width
    useEffect(() => {
        const updateImageSize = () => {
            if (previewRef.current) {
                const width = previewRef.current.offsetWidth;
                // Use the full width for the square image, accounting for padding
                const size = Math.min(width - 32, 400); // Subtract padding, max 400px
                setImageSize(size);
            }
        };

        updateImageSize();
        window.addEventListener("resize", updateImageSize);

        return () => window.removeEventListener("resize", updateImageSize);
    }, []);

    // Handle file upload
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setUploadedImage(result);
                onImageSelect(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    // Auto-select the first image when search results come in, or clear when no query
    useEffect(() => {
        console.log("images", images);
        console.log("itemName", itemName);
        console.log("previewRef", previewRef.current);
        console.log("uploadedImage", uploadedImage);
        const userJustSelectedSearchResult = selectedImage;
        console.log(
            "userJustSelectedSearchResult",
            userJustSelectedSearchResult
        );
        const shouldSelectImage =
            images.length > 0 &&
            itemName.trim() &&
            (!previewRef.current || !userJustSelectedSearchResult) &&
            !uploadedImage;
        console.log("shouldSelectImage", shouldSelectImage);
        console.log("images.length > 0", images.length > 0);
        console.log("itemName.trim()", itemName.trim());
        console.log("!previewRef.current", !previewRef.current);
        console.log(
            "!userJustSelectedSearchResult",
            !userJustSelectedSearchResult
        );
        console.log("selectedImage", selectedImage);
        console.log("!uploadedImage", !uploadedImage);
        console.log("shouldSelectImage", shouldSelectImage);
        if (shouldSelectImage) {
            const firstImageUrl = getSizedImageUrl(
                images[0].urls.raw,
                imageSize
            );
            console.log("firstImageUrl", firstImageUrl);
            onImageSelect(firstImageUrl);
        } else if (!itemName.trim() && selectedImage) {
            console.log("clearing image");
            // Clear the selected image when input is cleared
            onImageSelect("");
            setUploadedImage("");
        } else {
            console.log("no image to clear");
        }
    }, [
        images,
        itemName,
        imageSize,
        onImageSelect,
        selectedImage,
        uploadedImage,
    ]);

    const handleCreate = () => {
        if (itemName && selectedImage) {
            onCreateItem({
                id: Date.now().toString(),
                name: itemName,
                image: selectedImage,
            });
        }
    };

    return (
        <Modal onClose={onClose}>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item name
                </label>
                <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter item name"
                    value={itemName}
                    onChange={(e) => onNameChange(e.target.value)}
                />
            </div>

            <div
                ref={previewRef}
                className={`${
                    !previewRef.current ? "bg-gray-100" : "bg-transparent"
                } rounded-lg flex items-center justify-center min-h-[200px]`}
            >
                {loading ? (
                    <div className="text-center text-gray-500">
                        <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                        <p>Searching for images...</p>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500">
                        <p>Error: {error}</p>
                    </div>
                ) : selectedImage ? (
                    selectedImage.startsWith("http") ||
                    selectedImage.startsWith("data:") ? (
                        <img
                            src={selectedImage}
                            alt="Selected image"
                            className="max-w-full max-h-full object-contain rounded"
                            style={{
                                width: `${imageSize}px`,
                                height: `${imageSize}px`,
                            }}
                        />
                    ) : (
                        <div className="text-6xl">{selectedImage}</div>
                    )
                ) : images.length > 0 ? (
                    <div className="text-center">
                        <img
                            src={getSizedImageUrl(
                                images[0].urls.raw,
                                imageSize
                            )}
                            alt={images[0].alt_description || "Search result"}
                            className="max-w-full max-h-full object-contain rounded"
                            style={{
                                width: `${imageSize}px`,
                                height: `${imageSize}px`,
                            }}
                        />
                        <p className="text-sm text-gray-600 mt-2">
                            Auto-selected from search results
                        </p>
                    </div>
                ) : (
                    <div className="text-center text-gray-500">
                        <Camera className="w-12 h-12 mx-auto mb-2" />
                        <p>Image preview</p>
                        {itemName && (
                            <p className="text-sm mt-2">
                                Type to search for images...
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button
                    variant="secondary"
                    icon={Upload}
                    onClick={handleUploadClick}
                >
                    Upload Image
                </Button>
                <Button
                    variant="secondary"
                    icon={Search}
                    onClick={onSearchClick}
                >
                    Search Image
                </Button>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
            />

            <Button
                variant="primary"
                fullWidth
                disabled={createButtonDisabled}
                onClick={handleCreate}
            >
                Create
            </Button>
        </Modal>
    );
};

export default ItemUploadModal;

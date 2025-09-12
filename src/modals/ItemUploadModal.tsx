import React from "react";
import { Upload, Search, Camera } from "lucide-react";
import { TierItem } from "../types";
import Modal from "../components/Modal";
import Button from "../components/Button";

interface ItemUploadModalProps {
    itemName: string;
    selectedImage: string;
    onNameChange: (name: string) => void;
    onSearchClick: () => void;
    onCreateItem: (item: TierItem) => void;
}

const ItemUploadModal: React.FC<ItemUploadModalProps> = ({
    itemName,
    selectedImage,
    onNameChange,
    onSearchClick,
    onCreateItem,
}) => {
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
        <Modal>
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

            <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center min-h-[200px]">
                {selectedImage ? (
                    <div className="text-6xl">{selectedImage}</div>
                ) : (
                    <div className="text-center text-gray-500">
                        <Camera className="w-12 h-12 mx-auto mb-2" />
                        <p>Image preview</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" icon={Upload}>
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

            <Button
                variant="primary"
                fullWidth
                disabled={!itemName || !selectedImage}
                onClick={handleCreate}
            >
                Create
            </Button>
        </Modal>
    );
};

export default ItemUploadModal;

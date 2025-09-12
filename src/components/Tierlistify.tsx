import React, { useState } from "react";
import {
    TierList,
    TierItem,
    Screen,
    Modal as ModalType,
    CreationTab,
} from "../types";
import { defaultTierColors } from "../constants";
import HomeScreen from "../screens/HomeScreen";
import InitScreen from "../screens/InitScreen";
import CreationScreen from "../screens/CreationScreen";
import ViewScreen from "../screens/ViewScreen";
import ItemUploadModal from "../modals/ItemUploadModal";
import ImageSearchModal from "../modals/ImageSearchModal";

const Tierlistify: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState<Screen>("home");
    const [currentModal, setCurrentModal] = useState<ModalType>(null);
    const [tierLists, setTierLists] = useState<TierList[]>([]);
    const [currentTierList, setCurrentTierList] = useState<Partial<TierList>>(
        {}
    );
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [creationTab, setCreationTab] = useState<CreationTab>("build");
    const [searchQuery, setSearchQuery] = useState("");
    const [newItemName, setNewItemName] = useState("");
    const [selectedImage, setSelectedImage] = useState("");

    const handleCreateItem = (item: TierItem) => {
        setCurrentTierList({
            ...currentTierList,
            items: [...(currentTierList.items || []), item],
        });
        setNewItemName("");
        setSelectedImage("");
        setCurrentModal(null);
    };

    const handleItemTierSelect = (tier: string) => {
        const currentItem = currentTierList.items?.[currentItemIndex];
        if (currentItem) {
            const updatedItems = [...(currentTierList.items || [])];
            updatedItems[currentItemIndex] = { ...currentItem, tier };
            setCurrentTierList({
                ...currentTierList,
                items: updatedItems,
            });
            setCurrentItemIndex(currentItemIndex + 1);
        }
    };

    const handleComplete = () => {
        const completedTierList = currentTierList as TierList;
        setTierLists([...tierLists, completedTierList]);
        setCurrentScreen("view");
    };

    const handleBegin = () => {
        setCurrentTierList({
            ...currentTierList,
            id: Date.now().toString(),
            tiers: Object.keys(defaultTierColors),
            createdAt: new Date(),
        });
        setCurrentScreen("creation");
    };

    return (
        <div className="relative">
            {currentScreen === "home" && (
                <HomeScreen
                    tierLists={tierLists}
                    onCreateNew={() => setCurrentScreen("init")}
                    onSelectList={(list) => {
                        setCurrentTierList(list);
                        setCurrentScreen("view");
                    }}
                />
            )}

            {currentScreen === "init" && (
                <InitScreen
                    currentTierList={currentTierList}
                    onUpdateTierList={setCurrentTierList}
                    onBack={() => setCurrentScreen("home")}
                    onAddItem={() => setCurrentModal("item-upload")}
                    onBegin={handleBegin}
                />
            )}

            {currentScreen === "creation" && (
                <CreationScreen
                    currentTierList={currentTierList}
                    currentItemIndex={currentItemIndex}
                    creationTab={creationTab}
                    onBack={() => setCurrentScreen("init")}
                    onTabChange={setCreationTab}
                    onItemTierSelect={handleItemTierSelect}
                    onComplete={handleComplete}
                />
            )}

            {currentScreen === "view" && (
                <ViewScreen
                    tierList={currentTierList}
                    onBack={() => setCurrentScreen("home")}
                />
            )}

            {currentModal === "item-upload" && (
                <ItemUploadModal
                    itemName={newItemName}
                    selectedImage={selectedImage}
                    onNameChange={setNewItemName}
                    onSearchClick={() => setCurrentModal("image-search")}
                    onCreateItem={handleCreateItem}
                />
            )}

            {currentModal === "image-search" && (
                <ImageSearchModal
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onImageSelect={(image) => {
                        setSelectedImage(image);
                        setCurrentModal("item-upload");
                    }}
                />
            )}
        </div>
    );
};

export default Tierlistify;

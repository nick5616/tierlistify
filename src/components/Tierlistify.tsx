import React, { useState } from "react";
import { Routes, Route, useNavigate, useSearchParams } from "react-router-dom";
import { TierList, TierItem, Modal as ModalType, CreationTab } from "../types";
import HomeScreen from "../screens/HomeScreen";
import InitScreen from "../screens/InitScreen";
import CreationScreen from "../screens/CreationScreen";
import ViewScreen from "../screens/ViewScreen";
import ItemUploadModal from "../modals/ItemUploadModal";
import ImageSearchModal from "../modals/ImageSearchModal";

const Tierlistify: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [tierLists, setTierLists] = useState<TierList[]>([]);
    const [currentTierList, setCurrentTierList] = useState<Partial<TierList>>(
        {}
    );
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [creationTab, setCreationTab] = useState<CreationTab>("build");
    const [searchQuery, setSearchQuery] = useState("");
    const [newItemName, setNewItemName] = useState("");
    const [selectedImage, setSelectedImage] = useState("");

    const modal = searchParams.get("modal") as ModalType;

    const handleCreateItem = (item: TierItem) => {
        setCurrentTierList({
            ...currentTierList,
            items: [...(currentTierList.items || []), item],
        });
        setNewItemName("");
        setSelectedImage("");
        setSearchParams({});
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
        navigate(`/view/${completedTierList.id}`);
    };

    const handleBegin = () => {
        const newTierList = {
            ...currentTierList,
            id: Date.now().toString(),
            createdAt: new Date(),
        };
        setCurrentTierList(newTierList);
        navigate(`/creation/${newTierList.id}`);
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleCreateNew = () => {
        setCurrentTierList({});
        navigate("/init");
    };

    const handleSelectList = (list: TierList) => {
        setCurrentTierList(list);
        navigate(`/view/${list.id}`);
    };

    const handleAddItem = () => {
        setSearchParams({ modal: "item-upload" });
    };

    const handleSearchClick = () => {
        setSearchParams({ modal: "image-search" });
    };

    const handleImageSelect = (image: string) => {
        setSelectedImage(image);
        setSearchParams({ modal: "item-upload" });
    };

    const handleCloseModal = () => {
        setSearchParams({});
    };

    return (
        <div className="relative">
            <Routes>
                <Route
                    path="/"
                    element={
                        <HomeScreen
                            tierLists={tierLists}
                            onCreateNew={handleCreateNew}
                            onSelectList={handleSelectList}
                        />
                    }
                />
                <Route
                    path="/init"
                    element={
                        <InitScreen
                            currentTierList={currentTierList}
                            onUpdateTierList={setCurrentTierList}
                            onBack={handleBack}
                            onAddItem={handleAddItem}
                            onBegin={handleBegin}
                        />
                    }
                />
                <Route
                    path="/creation/:tierListId"
                    element={
                        <CreationScreen
                            currentTierList={currentTierList}
                            currentItemIndex={currentItemIndex}
                            creationTab={creationTab}
                            onBack={handleBack}
                            onTabChange={setCreationTab}
                            onItemTierSelect={handleItemTierSelect}
                            onComplete={handleComplete}
                        />
                    }
                />
                <Route
                    path="/view/:tierListId"
                    element={
                        <ViewScreen
                            tierList={currentTierList}
                            onBack={handleBack}
                        />
                    }
                />
            </Routes>

            {modal === "item-upload" && (
                <ItemUploadModal
                    itemName={newItemName}
                    selectedImage={selectedImage}
                    onNameChange={setNewItemName}
                    onSearchClick={handleSearchClick}
                    onCreateItem={handleCreateItem}
                    onClose={handleCloseModal}
                />
            )}

            {modal === "image-search" && (
                <ImageSearchModal
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onImageSelect={handleImageSelect}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default Tierlistify;

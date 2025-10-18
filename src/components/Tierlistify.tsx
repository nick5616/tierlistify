import React, { useState, useEffect } from "react";
import {
    Routes,
    Route,
    useNavigate,
    useSearchParams,
    useParams,
} from "react-router-dom";
import { TierList, TierItem, Modal as ModalType, Tier } from "../types";
import { useTierLists } from "../hooks/useTierLists";
import { useCurrentTierList } from "../hooks/useCurrentTierList";
import HomeScreen from "../screens/HomeScreen";
import InitScreen from "../screens/InitScreen";
import CreationScreen from "../screens/CreationScreen";
import ViewScreen from "../screens/ViewScreen";
import ItemUploadModal from "../modals/ItemUploadModal";
import ImageSearchModal from "../modals/ImageSearchModal";
import DragTestComponent from "./DragTestComponent";
import NativeDragTest from "./NativeDragTest";
import LayoutWithAds from "./LayoutWithAds";

const Tierlistify: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { tierListId } = useParams<{ tierListId: string }>();

    // Use custom hooks for persistent state management
    const {
        tierLists,
        isLoading: tierListsLoading,
        error: tierListsError,
        addTierList,
        getTierListById,
    } = useTierLists();

    const { currentTierList, updateCurrentTierList, clearCurrentTierList } =
        useCurrentTierList();

    const [searchQuery, setSearchQuery] = useState("");
    const [newItemName, setNewItemName] = useState("");
    const [selectedImage, setSelectedImage] = useState("");

    const modal = searchParams.get("modal") as ModalType;

    // Load tier list when navigating to view or creation screens
    useEffect(() => {
        if (tierListId && !tierListsLoading) {
            const existingTierList = getTierListById(tierListId);
            if (
                existingTierList &&
                (!currentTierList.id || currentTierList.id !== tierListId)
            ) {
                updateCurrentTierList(existingTierList);
            } else if (!existingTierList && tierListId) {
                // Tier list not found, redirect to home
                console.warn(`Tier list with ID ${tierListId} not found`);
                navigate("/");
            }
        }
    }, [
        tierListId,
        tierListsLoading,
        getTierListById,
        currentTierList.id,
        updateCurrentTierList,
        navigate,
    ]);

    const handleCreateItem = (item: TierItem) => {
        updateCurrentTierList({
            items: [...(currentTierList.items || []), item],
        });
        setNewItemName("");
        setSelectedImage("");
        setSearchParams({});
    };

    const handleComplete = () => {
        const completedTierList = currentTierList as TierList;
        addTierList(completedTierList);
        navigate(`/view/${completedTierList.id}`);
    };

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/view/${currentTierList.id}`;

        try {
            // Try using the Web Share API first (mobile)
            if (navigator.share) {
                await navigator.share({
                    title: currentTierList.name || "Tier List",
                    text: `Check out my tier list: ${currentTierList.name}`,
                    url: shareUrl,
                });
            } else {
                // Fallback to clipboard
                await navigator.clipboard.writeText(shareUrl);
                alert("Link copied to clipboard!");
            }
        } catch (error) {
            // If all else fails, show the URL
            prompt("Copy this link to share:", shareUrl);
        }
    };

    const handleGoHome = () => {
        navigate("/");
    };

    const handleBegin = (tiers: Tier[]) => {
        const newTierList = {
            ...currentTierList,
            id: Date.now().toString(),
            tiers: tiers,
            createdAt: new Date(),
        };
        updateCurrentTierList(newTierList);
        navigate(`/creation/${newTierList.id}`);
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleCreateNew = () => {
        clearCurrentTierList();
        navigate("/init");
    };

    const handleSelectList = (list: TierList) => {
        updateCurrentTierList(list);
        navigate(`/view/${list.id}`);
    };

    const handleAddItem = () => {
        setSearchParams({ modal: "item-upload" });
    };

    const handleSearchClick = () => {
        // Auto-populate search with current item name
        setSearchQuery(newItemName);
        setSearchParams({ modal: "image-search" });
    };

    const handleImageSelect = (image: string) => {
        setSelectedImage(image);
        setSearchParams({ modal: "item-upload" });
    };

    const handleCloseModal = () => {
        setSearchParams({});
    };

    const handleItemMove = (
        itemId: string,
        _fromTier: string | null,
        toTier: string | null
    ) => {
        console.log("handleItemMove called:", {
            itemId,
            fromTier: _fromTier,
            toTier,
            currentItems: currentTierList.items,
        });

        const updatedItems = (currentTierList.items || []).map((item) =>
            item.id === itemId ? { ...item, tier: toTier } : item
        );

        console.log("Updated items:", updatedItems);

        updateCurrentTierList({ items: updatedItems });

        console.log("Item move completed");
    };

    // Show loading state while tier lists are being loaded
    if (tierListsLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your tier lists...</p>
                </div>
            </div>
        );
    }

    // Show error state if there's an error loading tier lists
    if (tierListsError) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Error Loading Data
                    </h2>
                    <p className="text-gray-600 mb-4">{tierListsError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen overflow-hidden">
            <Routes>
                <Route path="/test" element={<DragTestComponent />} />
                <Route path="/native" element={<NativeDragTest />} />
                <Route
                    path="/debug-routes"
                    element={
                        <div style={{ padding: 20 }}>
                            <h1>Debug Routes</h1>
                            <p>If you can see this, routing is working!</p>
                            <ul>
                                <li>
                                    <a href="/test">Go to /test</a>
                                </li>
                                <li>
                                    <a href="/native">Go to /native</a>
                                </li>
                                <li>
                                    <a href="/">Go to home</a>
                                </li>
                            </ul>
                        </div>
                    }
                />
                <Route
                    path="/"
                    element={
                        <LayoutWithAds>
                            <HomeScreen
                                tierLists={tierLists}
                                onCreateNew={handleCreateNew}
                                onSelectList={handleSelectList}
                            />
                        </LayoutWithAds>
                    }
                />
                <Route
                    path="/init"
                    element={
                        <LayoutWithAds>
                            <InitScreen
                                currentTierList={currentTierList}
                                onUpdateTierList={updateCurrentTierList}
                                onBack={handleBack}
                                onAddItem={handleAddItem}
                                onBegin={handleBegin}
                            />
                        </LayoutWithAds>
                    }
                />
                <Route
                    path="/creation/:tierListId"
                    element={
                        <LayoutWithAds>
                            <CreationScreen
                                currentTierList={currentTierList}
                                onBack={handleBack}
                                onComplete={handleComplete}
                                onItemMove={handleItemMove}
                            />
                        </LayoutWithAds>
                    }
                />
                <Route
                    path="/view/:tierListId"
                    element={
                        <LayoutWithAds>
                            <ViewScreen
                                tierList={currentTierList}
                                onBack={handleBack}
                                onShare={handleShare}
                                onGoHome={handleGoHome}
                            />
                        </LayoutWithAds>
                    }
                />
            </Routes>

            {modal === "item-upload" && (
                <ItemUploadModal
                    itemName={newItemName}
                    selectedImage={selectedImage}
                    onNameChange={setNewItemName}
                    onImageSelect={setSelectedImage}
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

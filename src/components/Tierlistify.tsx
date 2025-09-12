import React, { useState } from "react";
import {
    Plus,
    Upload,
    Search,
    Share2,
    ChevronLeft,
    Camera,
    Grid3X3,
} from "lucide-react";

interface TierItem {
    id: string;
    name: string;
    image: string;
    tier?: string;
}

interface TierList {
    id: string;
    name: string;
    description: string;
    tiers: string[];
    items: TierItem[];
    createdAt: Date;
    icon?: string;
}

interface TierColors {
    [key: string]: string;
}

const defaultTierColors: TierColors = {
    S: "#ffb3ba",
    A: "#ffdfba",
    B: "#ffffba",
    C: "#baffc9",
    D: "#bae1ff",
    F: "#c9c9ff",
};

const Tierlistify: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState<
        "home" | "init" | "creation" | "view"
    >("home");
    const [currentModal, setCurrentModal] = useState<
        "item-upload" | "image-search" | null
    >(null);
    const [tierLists, setTierLists] = useState<TierList[]>([]);
    const [currentTierList, setCurrentTierList] = useState<Partial<TierList>>(
        {}
    );
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [creationTab, setCreationTab] = useState<"build" | "preview">(
        "build"
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [newItemName, setNewItemName] = useState("");
    const [selectedImage, setSelectedImage] = useState("");

    const mockSearchResults = ["🍎", "🍌", "🍊", "🍇", "🥝", "🍓", "🥭", "🍑"];

    const HomeScreen = () => (
        <div className="min-h-screen bg-gray-50 p-4 animate-fade-in">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-8 pt-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Tierlistify
                    </h1>
                    <p className="text-gray-600">Create and share tier lists</p>
                </div>

                {tierLists.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Grid3X3 className="w-10 h-10 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No tier lists yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Create your first tier list to get started
                        </p>
                    </div>
                ) : (
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            My Tier Lists
                        </h2>
                        <div className="grid grid-cols-3 gap-4">
                            {tierLists.map((list) => (
                                <div
                                    key={list.id}
                                    className="bg-white rounded-lg p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => {
                                        setCurrentTierList(list);
                                        setCurrentScreen("view");
                                    }}
                                >
                                    <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-2xl mb-2">
                                        {list.icon || "📋"}
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {list.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                    onClick={() => setCurrentScreen("init")}
                >
                    <Plus className="w-5 h-5" />
                    Create New
                </button>
            </div>
        </div>
    );

    const InitScreen = () => (
        <div className="min-h-screen bg-gray-50 p-4 animate-slide-in">
            <div className="max-w-md mx-auto">
                <div className="flex items-center mb-6 pt-4">
                    <button
                        onClick={() => setCurrentScreen("home")}
                        className="mr-3"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900">
                        Create Tier List
                    </h1>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            What are you ranking?
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Favorite Fruits"
                            value={currentTierList.name || ""}
                            onChange={(e) =>
                                setCurrentTierList({
                                    ...currentTierList,
                                    name: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            What are the tiers?
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {Object.entries(defaultTierColors).map(
                                ([tier, color]) => (
                                    <div
                                        key={tier}
                                        className="aspect-square rounded-lg flex items-center justify-center text-lg font-bold text-gray-800 cursor-pointer border-2 border-transparent hover:border-gray-300 transition-colors"
                                        style={{ backgroundColor: color }}
                                    >
                                        {tier}
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            What are the items?
                        </label>
                        <div className="grid grid-cols-4 gap-3 mb-4">
                            {(currentTierList.items || []).map((item) => (
                                <div
                                    key={item.id}
                                    className="aspect-square bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center text-2xl"
                                >
                                    {item.image}
                                </div>
                            ))}
                            <button
                                className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
                                onClick={() => setCurrentModal("item-upload")}
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {currentTierList.name &&
                        (currentTierList.items?.length || 0) > 0 && (
                            <button
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                onClick={() => {
                                    setCurrentTierList({
                                        ...currentTierList,
                                        id: Date.now().toString(),
                                        tiers: Object.keys(defaultTierColors),
                                        createdAt: new Date(),
                                    });
                                    setCurrentScreen("creation");
                                }}
                            >
                                Begin!
                            </button>
                        )}
                </div>
            </div>
        </div>
    );

    const ItemUploadModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50 animate-fade-in">
            <div className="bg-white rounded-t-3xl w-full p-6 pb-8">
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>

                <div className="max-w-md mx-auto space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Item name
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter item name"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
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
                        <button className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <Upload className="w-5 h-5" />
                            Upload Image
                        </button>
                        <button
                            className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            onClick={() => setCurrentModal("image-search")}
                        >
                            <Search className="w-5 h-5" />
                            Search Image
                        </button>
                    </div>

                    <button
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        disabled={!newItemName || !selectedImage}
                        onClick={() => {
                            if (newItemName && selectedImage) {
                                const newItem: TierItem = {
                                    id: Date.now().toString(),
                                    name: newItemName,
                                    image: selectedImage,
                                };
                                setCurrentTierList({
                                    ...currentTierList,
                                    items: [
                                        ...(currentTierList.items || []),
                                        newItem,
                                    ],
                                });
                                setNewItemName("");
                                setSelectedImage("");
                                setCurrentModal(null);
                            }
                        }}
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );

    const ImageSearchModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50 animate-fade-in">
            <div className="bg-white rounded-t-3xl w-full p-6 pb-8 max-h-[80vh] overflow-y-auto">
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>

                <div className="max-w-md mx-auto space-y-6">
                    <div>
                        <input
                            type="text"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Search for images..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                        {mockSearchResults.map((emoji, index) => (
                            <button
                                key={index}
                                className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center text-3xl hover:bg-blue-50 transition-colors border-2 border-transparent hover:border-blue-200"
                                onClick={() => {
                                    setSelectedImage(emoji);
                                    setCurrentModal("item-upload");
                                }}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const CreationScreen = () => {
        const currentItem = currentTierList.items?.[currentItemIndex];
        const remainingItems =
            (currentTierList.items?.length || 0) - currentItemIndex;

        return (
            <div className="min-h-screen bg-gray-50 p-4 animate-slide-in">
                <div className="max-w-md mx-auto">
                    <div className="flex items-center mb-6 pt-4">
                        <button
                            onClick={() => setCurrentScreen("init")}
                            className="mr-3"
                        >
                            <ChevronLeft className="w-6 h-6 text-gray-600" />
                        </button>
                        <h1 className="text-xl font-semibold text-gray-900">
                            {currentTierList.name}
                        </h1>
                    </div>

                    <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                        <button
                            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                                creationTab === "build"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-gray-600"
                            }`}
                            onClick={() => setCreationTab("build")}
                        >
                            Build
                        </button>
                        <button
                            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                                creationTab === "preview"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-gray-600"
                            }`}
                            onClick={() => setCreationTab("preview")}
                        >
                            Preview
                        </button>
                    </div>

                    {creationTab === "build" ? (
                        <div className="space-y-6">
                            {currentItem ? (
                                <>
                                    <div className="text-center">
                                        <div className="w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center text-6xl mx-auto mb-4">
                                            {currentItem.image}
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {currentItem.name}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        {currentTierList.tiers?.map((tier) => (
                                            <button
                                                key={tier}
                                                className="aspect-square rounded-lg flex items-center justify-center text-xl font-bold text-gray-800 hover:scale-105 transition-transform shadow-sm"
                                                style={{
                                                    backgroundColor:
                                                        defaultTierColors[tier],
                                                }}
                                                onClick={() => {
                                                    const updatedItems = [
                                                        ...(currentTierList.items ||
                                                            []),
                                                    ];
                                                    updatedItems[
                                                        currentItemIndex
                                                    ] = {
                                                        ...currentItem,
                                                        tier,
                                                    };
                                                    setCurrentTierList({
                                                        ...currentTierList,
                                                        items: updatedItems,
                                                    });
                                                    setCurrentItemIndex(
                                                        currentItemIndex + 1
                                                    );
                                                }}
                                            >
                                                {tier}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="text-4xl mb-4">🎉</div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        All items ranked!
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Switch to preview to see your tier list
                                    </p>
                                    <button
                                        className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                        onClick={() =>
                                            setCreationTab("preview")
                                        }
                                    >
                                        View Preview
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {currentTierList.tiers?.map((tier) => {
                                const tieredItems =
                                    currentTierList.items?.filter(
                                        (item) => item.tier === tier
                                    ) || [];
                                return (
                                    <div
                                        key={tier}
                                        className="bg-white rounded-lg overflow-hidden shadow-sm"
                                    >
                                        <div className="flex">
                                            <div
                                                className="w-16 flex items-center justify-center text-lg font-bold text-gray-800"
                                                style={{
                                                    backgroundColor:
                                                        defaultTierColors[tier],
                                                }}
                                            >
                                                {tier}
                                            </div>
                                            <div className="flex-1 bg-gray-900 p-2 min-h-[60px] flex items-center gap-2">
                                                {tieredItems.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="w-12 h-12 bg-white rounded flex items-center justify-center text-xl"
                                                    >
                                                        {item.image}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="flex justify-between items-center pt-4">
                                <p className="text-sm text-gray-600">
                                    {remainingItems} remaining
                                </p>
                                <button
                                    className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    onClick={() => {
                                        const completedTierList =
                                            currentTierList as TierList;
                                        setTierLists([
                                            ...tierLists,
                                            completedTierList,
                                        ]);
                                        setCurrentScreen("view");
                                    }}
                                >
                                    Share
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const ViewScreen = () => (
        <div className="min-h-screen bg-gray-50 p-4 animate-fade-in">
            <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-6 pt-4">
                    <button onClick={() => setCurrentScreen("home")}>
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900">
                        {currentTierList.name}
                    </h1>
                    <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    {currentTierList.tiers?.map((tier) => {
                        const tieredItems =
                            currentTierList.items?.filter(
                                (item) => item.tier === tier
                            ) || [];
                        return (
                            <div
                                key={tier}
                                className="bg-white rounded-lg overflow-hidden shadow-sm"
                            >
                                <div className="flex">
                                    <div
                                        className="w-16 flex items-center justify-center text-lg font-bold text-gray-800"
                                        style={{
                                            backgroundColor:
                                                defaultTierColors[tier],
                                        }}
                                    >
                                        {tier}
                                    </div>
                                    <div className="flex-1 bg-gray-900 p-2 min-h-[60px] flex items-center gap-2 flex-wrap">
                                        {tieredItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="w-12 h-12 bg-white rounded flex items-center justify-center overflow-hidden"
                                            >
                                                {item.image.startsWith(
                                                    "http"
                                                ) ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            const target =
                                                                e.target as HTMLImageElement;
                                                            target.style.display =
                                                                "none";
                                                            const parent =
                                                                target.parentElement;
                                                            if (parent) {
                                                                parent.innerHTML =
                                                                    '<div class="text-xl">🖼️</div>';
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="text-xl">
                                                        {item.image}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative">
            {currentScreen === "home" && <HomeScreen />}
            {currentScreen === "init" && <InitScreen />}
            {currentScreen === "creation" && <CreationScreen />}
            {currentScreen === "view" && <ViewScreen />}

            {currentModal === "item-upload" && <ItemUploadModal />}
            {currentModal === "image-search" && <ImageSearchModal />}
        </div>
    );
};

export default Tierlistify;

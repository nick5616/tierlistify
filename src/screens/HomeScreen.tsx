import React from "react";
import { Grid3X3, Plus } from "lucide-react";
import { TierList } from "../types";
import { animations } from "../constants";
import Button from "../components/Button";

interface HomeScreenProps {
    tierLists: TierList[];
    onCreateNew: () => void;
    onSelectList: (list: TierList) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
    tierLists,
    onCreateNew,
    onSelectList,
}) => {
    return (
        <div className="min-h-screen bg-gray-50 p-4" style={animations.fadeIn}>
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
                                    onClick={() => onSelectList(list)}
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

                <Button
                    variant="primary"
                    icon={Plus}
                    fullWidth
                    onClick={onCreateNew}
                >
                    Create New
                </Button>
            </div>
        </div>
    );
};

export default HomeScreen;

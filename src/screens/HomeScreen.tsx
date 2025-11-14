import React from "react";
import { Plus } from "lucide-react";
import { TierList } from "../types";
import AnimatedScreen from "../components/AnimatedScreen";
import Button from "../components/Button";

interface HomeScreenProps {
    tierLists: TierList[];
    templates: TierList[];
    onCreateNew: () => void;
    onSelectList: (list: TierList) => void;
    onUseTemplate: (template: TierList) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
    tierLists,
    templates,
    onCreateNew,
    onSelectList,
    onUseTemplate,
}) => {
    const hasUserTierLists = tierLists.length > 0;

    return (
        <AnimatedScreen animation="fade">
            <div className="max-w-md mx-auto h-full flex flex-col">
                <div className="text-center mb-4 pt-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Tierlistify
                    </h1>
                    <p className="text-gray-600">Create and share tier lists</p>
                </div>

                <div className="flex-1 flex flex-col overflow-y-auto pb-safe">
                    {!hasUserTierLists && templates.length > 0 && (
                        <div className="mb-6 flex-1">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Tier List Templates
                            </h2>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                {templates.map((template) => (
                                    <div
                                        key={template.id}
                                        className="bg-white rounded-lg p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => onUseTemplate(template)}
                                    >
                                        <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-3xl mb-2 overflow-hidden">
                                            {template.icon || "📋"}
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 truncate mb-1">
                                            {template.name}
                                        </p>
                                        {template.description && (
                                            <p className="text-xs text-gray-500 line-clamp-2">
                                                {template.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {hasUserTierLists && (
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

                    {hasUserTierLists && templates.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Templates
                            </h2>
                            <div className="grid grid-cols-3 gap-4">
                                {templates.map((template) => (
                                    <div
                                        key={template.id}
                                        className="bg-white rounded-lg p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => onUseTemplate(template)}
                                    >
                                        <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-2xl mb-2">
                                            {template.icon || "📋"}
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {template.name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-auto pt-4">
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
            </div>
        </AnimatedScreen>
    );
};

export default HomeScreen;

import { useEffect } from "react";
import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
    useParams,
} from "react-router-dom";
import { ListsProvider, useLists } from "./state/lists";
import { ToastProvider, useToast } from "./components/Toast";
import { useKeyboardInset } from "./hooks/useKeyboardInset";
import HomeScreen from "./screens/HomeScreen";
import SetupScreen from "./screens/SetupScreen";
import BoardScreen from "./screens/BoardScreen";
import ViewScreen from "./screens/ViewScreen";
import PublishedScreen from "./screens/PublishedScreen";

/** Links from before the routes were renamed. */
const LegacyRedirect = ({ to }: { to: string }) => {
    const { tierListId } = useParams();
    return <Navigate to={`${to}/${tierListId}`} replace />;
};

function SaveWatcher() {
    const { saveFailed } = useLists();
    const toast = useToast();

    useEffect(() => {
        if (saveFailed) {
            toast("Couldn't save. Your device may be out of storage.", {
                duration: 8000,
            });
        }
    }, [saveFailed, toast]);

    return null;
}

export default function App() {
    useKeyboardInset();

    return (
        <BrowserRouter>
            <ToastProvider>
                <ListsProvider>
                    <SaveWatcher />
                    <div className="mx-auto h-full max-w-2xl">
                        <Routes>
                            <Route path="/" element={<HomeScreen />} />
                            <Route path="/edit/:id" element={<SetupScreen />} />
                            <Route path="/rank/:id" element={<BoardScreen />} />
                            <Route path="/list/:id" element={<ViewScreen />} />
                            <Route path="/p/:id" element={<PublishedScreen />} />
                            <Route
                                path="/view/:tierListId"
                                element={<LegacyRedirect to="/list" />}
                            />
                            <Route
                                path="/creation/:tierListId"
                                element={<LegacyRedirect to="/rank" />}
                            />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>
                </ListsProvider>
            </ToastProvider>
        </BrowserRouter>
    );
}

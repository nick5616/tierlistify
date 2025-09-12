import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import Tierlistify from "./components/Tierlistify";

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Tierlistify />
        </BrowserRouter>
    );
};

export default App;

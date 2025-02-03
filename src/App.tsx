import { BrowserRouter, Routes, Route } from "react-router-dom";

import Rootlayout from "./Rootlayout";

import Home from "./pages/Home/Page";
import Sync from "./pages/Sync/Page";
import Settings from "./pages/Settings/Page";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Rootlayout />}>
          <Route index element={<Home />} />
          <Route path="sync" element={<Sync />} />
          <Route path="settings" element={<Settings />} />

          <Route path="*" element={<h2>Page Not Found</h2>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

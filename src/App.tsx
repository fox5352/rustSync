import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Page";
import Rootlayout from "./Rootlayout";

import "./App.css";
import Sync from "./pages/Sync/Page";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Rootlayout />}>
          <Route index element={<Home />} />
          <Route path="sync" element={<Sync />} />

          <Route path="*" element={<h2>Page Not Found</h2>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

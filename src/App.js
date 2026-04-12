import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { ToastProvider } from "./components/ToastProvider";
import Dashboard from "./pages/Dashboard";
import BrandPage from "./pages/BrandPage";
import ModelPage from "./pages/ModelPage";

const App = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/brand/:id" element={<BrandPage />} />
          <Route path="/brand/:id/model/:modelId" element={<ModelPage />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;

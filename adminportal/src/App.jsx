// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./auth/ProtectedRoute";
import DataGeneratorPage from "./pages/DataGeneratorPage";
import StartPage from "./pages/StartPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/start"
          element={
            <ProtectedRoute>
              <StartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-generator"
          element={
            <ProtectedRoute>
              <DataGeneratorPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

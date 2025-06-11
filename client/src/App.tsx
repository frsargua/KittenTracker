// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import ProtectedRoute from "./components/ProtectedRoute"; // Our HOC for protected routes

// Pages
import AuthenticatedLandingPage from "./pages/AuthenticatedLandingPage";
import ProfilePage from "./pages/ProfilePage";

import "./App.css";
import Navbar from "./components/NavbarComponent";
import CreateLitterPage from "./pages/CreateLitterPage";
import LitterDetailPage from "./pages/LitterDetailPage/LitterDetailPage";
import LoadingSpinner from "./components/LoadingSpinner";
import HomePage from "./pages/HomePage";
import ErrorPage from "./pages/Error/ErrorPage";

function App() {
  const { isLoading, error } = useAuth0();

  if (isLoading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <LoadingSpinner message="Authenticating..." />
      </div>
    );
  }

  if (error) {
    return <ErrorPage type={"OTHERS"} customMessage={error.message} />;
  }

  return (
    <Router>
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute component={AuthenticatedLandingPage} />}
          />
          <Route
            path="/create-litter"
            element={<ProtectedRoute component={CreateLitterPage} />}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute component={ProfilePage} />}
          />
          <Route
            path="/litters/:litterId"
            element={<ProtectedRoute component={LitterDetailPage} />}
          />
          <Route path="*" element={<ErrorPage type={"NOT_FOUND"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

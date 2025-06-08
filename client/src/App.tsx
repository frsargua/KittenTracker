// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import ProtectedRoute from "./components/ProtectedRoute"; // Our HOC for protected routes

// Pages
import AuthenticatedLandingPage from "./pages/AuthenticatedLandingPage";
import ProfilePage from "./pages/ProfilePage";

import "./App.css"; // Or your global styles
import Navbar from "./components/NavbarComponent";
import CreateLitterPage from "./pages/CreateLitterPage";
import LitterDetailPage from "./pages/LitterDetailPage";

// A simple public home page component (optional)
const HomePage: React.FC = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <div className="container text-center mt-5">
      <h1>Welcome to KittenTracker!</h1>
      <p>Please log in to manage your litters.</p>
      <button
        className="btn btn-primary btn-lg"
        onClick={() => loginWithRedirect()}
      >
        Log In
      </button>
    </div>
  );
};

function App() {
  const { isLoading, error } = useAuth0();

  if (isLoading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">Oops... {error.message}</div>
      </div>
    );
  }

  return (
    <Router>
      <Navbar />
      <div className="main-content">
        {" "}
        {/* Optional: for consistent padding below navbar */}
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
          <Route
            path="*"
            element={
              <div className="container mt-5 text-center">
                <h2>404: Page Not Found</h2>
                <p>The page you are looking for does not exist.</p>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

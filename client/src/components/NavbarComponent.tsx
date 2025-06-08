// src/components/Navbar.tsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout, loginWithRedirect } = useAuth0();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3 shadow-sm">
      <Link
        className="navbar-brand fw-bold"
        to={isAuthenticated ? "/dashboard" : "/"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          className="bi bi-heart-pulse-fill me-2"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314Z"
          />
        </svg>
        KittenTracker
      </Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav me-auto">
          {isAuthenticated && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/create-litter">
                  New Litter
                </Link>
              </li>
            </>
          )}
        </ul>
        {isAuthenticated && user ? (
          <div className="nav-item dropdown" ref={dropdownRef}>
            <button
              className="nav-link btn d-flex align-items-center"
              onClick={toggleDropdown}
              style={{ background: "none", border: "none" }}
            >
              <img
                src={user.picture || ""}
                alt={user.name || "P"}
                className="rounded-circle me-2"
                style={{ width: "32px", height: "32px", objectFit: "cover" }}
                onError={(e) => {
                  (
                    e.target as HTMLImageElement
                  ).src = `https://placehold.co/40x40/6c757d/white?text=${
                    user.name?.charAt(0) || "U"
                  }`;
                }}
              />
              <span className="d-none d-lg-inline text-light">{user.name}</span>
            </button>
            {dropdownOpen && (
              <ul
                className="dropdown-menu dropdown-menu-end dropdown-menu-dark show"
                style={{ position: "absolute", right: 0, top: "100%" }}
              >
                <li>
                  <div className="dropdown-item-text px-3 pt-2">
                    <strong>{user.name}</strong>
                    <br />
                    <small>{user.email}</small>
                  </div>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <Link
                    className="dropdown-item"
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                  >
                    View Profile
                  </Link>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() =>
                      logout({
                        logoutParams: { returnTo: window.location.origin },
                      })
                    }
                  >
                    Log Out
                  </button>
                </li>
              </ul>
            )}
          </div>
        ) : (
          <button
            className="btn btn-outline-light"
            onClick={() => loginWithRedirect()}
          >
            Log In
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

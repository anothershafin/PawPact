import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  // Check if user is logged in by reading from localStorage
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          Paw Pact
        </Link>
        <Link to="/" className="navbar-link">
          Home
        </Link>
      </div>

      <div className="navbar-right">
        {userInfo ? (
          <>
            {userInfo.role === "adopter" && (
              <>
                <Link to="/discover" className="navbar-link">
                  Discover
                </Link>
                <Link to="/shortlist" className="navbar-link">
                  Shortlist
                </Link>
                <Link to="/compare" className="navbar-link">
                  Compare
                </Link>
                <Link to="/questionnaire" className="navbar-link">
                  Questionnaire
                </Link>
                <Link to="/applications" className="navbar-link">
                  Applications
                </Link>
                <Link to="/reports" className="navbar-link">
                  Reports
                </Link>
                <Link to="/reviews" className="navbar-link">
                  Reviews
                </Link>
              </>
            )}
            {/* Show "Pets" button only for Pet Parents */}
            {userInfo.role === "petparent" && (
              <>
                <Link to="/pets" className="navbar-link">
                  Pets
                </Link>
                <Link to="/review-applications" className="navbar-link">
                  Applications
                </Link>
                <Link to="/contracts" className="navbar-link">
                  Contracts
                </Link>
                <Link to="/reports" className="navbar-link">
                  Reports
                </Link>
                <Link to="/reviews" className="navbar-link">
                  Reviews
                </Link>
              </>
            )}
            {userInfo.role === "admin" && (
              <>
                <Link to="/admin" className="navbar-link">
                  Admin
                </Link>
                <Link to="/reports" className="navbar-link">
                  Reports
                </Link>
              </>
            )}
            <Link to="/view-profile" className="navbar-link">
              View Profile
            </Link>
            <button onClick={handleLogout} className="navbar-btn navbar-btn-logout">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">
              Log In
            </Link>
            <Link to="/signup" className="navbar-link">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

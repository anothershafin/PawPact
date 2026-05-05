import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">Paw Pact</Link>
        <Link to="/" className="navbar-link">Home</Link>
      </div>
      
      <div className="navbar-right">
        {userInfo ? (
          <>
            
            <Link to="/pets" className="navbar-link">Pets</Link>
            
           
            <Link to="/compare" className="navbar-link">Compare</Link>
            <Link to="/shortlist" className="navbar-link">Shortlist</Link>
            <Link to="/applications" className="navbar-link">Applications</Link>
            <Link to="/questionnaire" className="navbar-link">Questionnaire</Link>
            <Link to="/report" className="profile-edit-btn">Report</Link>
            <Link to="/view-profile" className="navbar-link">View Profile</Link>
            <button onClick={handleLogout} className="navbar-btn navbar-btn-logout">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">Log In</Link>
            <Link to="/signup" className="navbar-link">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
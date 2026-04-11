import React from "react";
import "../styles/Home.css";
import { Link } from "react-router-dom";

const Home = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  return (
    <div className="home-container">
      <div className="home-content">
        {/* Left side - text */}
        <div className="home-text">
          <h1 className="home-title">
            Welcome to
            <br />
            <span className="home-title-accent">Pawpact!</span>
          </h1>
          <h2 className="home-subtitle">
            Find Your
            <br />
            <span className="home-subtitle-accent">Perfect</span> Friend
          </h2>

          {/* Show login/signup prompt only if NOT logged in */}
          {!userInfo && (
            <p className="home-cta-text">
              <Link to="/login" className="home-cta-btn">Log In</Link>
              {" "}or{" "}
              <Link to="/signup" className="home-cta-btn">Sign Up</Link>
              {" "}to explore the pets nearby.
            </p>
          )}
        </div>

        {/* Right side - image */}
        <div className="home-image-wrapper">
          <div className="home-image-circle">
            <img
              src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=600&fit=crop"
              alt="Adorable pets"
              className="home-image"
            />
          </div>
        </div>
      </div>

      {/* Search bar - only shown when logged in */}
      {userInfo && (
        <div className="home-search-wrapper">
          <input
            type="text"
            className="home-search-input"
            placeholder="Search for nearby pets by breed, location, age, etc."
            readOnly
          />
        </div>
      )}
    </div>
  );
};

export default Home;

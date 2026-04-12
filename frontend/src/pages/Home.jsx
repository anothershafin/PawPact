import React, { useState } from "react";
import "../styles/Home.css";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    location: "",
    breed: "",
    vaccinationStatus: "",
    ageMin: "",
    ageMax: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!userInfo) return;

    const params = new URLSearchParams();
    if (searchTerm) params.set("q", searchTerm);
  if (filters.location) params.set("location", filters.location);
    if (filters.breed) params.set("breed", filters.breed);
    if (filters.vaccinationStatus) params.set("vaccinationStatus", filters.vaccinationStatus);
    if (filters.ageMin) params.set("ageMin", filters.ageMin);
    if (filters.ageMax) params.set("ageMax", filters.ageMax);

    navigate(`/search?${params.toString()}`);
  };

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
          <form onSubmit={handleSearch}>
            <input
              type="text"
              className="home-search-input"
              placeholder="Search for pets by breed, name, or location"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="home-search-actions">
              <button type="submit" className="home-search-btn">
                Search Pets
              </button>
              <button
                type="button"
                className="home-search-btn"
                style={{ marginLeft: "8px" }}
                onClick={() => setShowFilters((prev) => !prev)}
              >
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="home-filters-row" style={{ marginTop: "12px" }}>
                <div className="home-filter-field">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    placeholder="e.g. Mohammadpur, Dhaka"
                  />
                </div>
                <div className="home-filter-field">
                  <label>Breed</label>
                  <input
                    type="text"
                    name="breed"
                    value={filters.breed}
                    onChange={handleFilterChange}
                    placeholder="e.g. Labrador"
                  />
                </div>
                <div className="home-filter-field">
                  <label>Vaccination</label>
                  <select
                    name="vaccinationStatus"
                    value={filters.vaccinationStatus}
                    onChange={handleFilterChange}
                  >
                    <option value="">Any</option>
                    <option value="Not Vaccinated">Not Vaccinated</option>
                    <option value="Vaccinated">Vaccinated</option>
                  </select>
                </div>
                <div className="home-filter-field">
                  <label>Age (min)</label>
                  <input
                    type="number"
                    name="ageMin"
                    value={filters.ageMin}
                    onChange={handleFilterChange}
                    min="0"
                  />
                </div>
                <div className="home-filter-field">
                  <label>Age (max)</label>
                  <input
                    type="number"
                    name="ageMax"
                    value={filters.ageMax}
                    onChange={handleFilterChange}
                    min="0"
                  />
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default Home;

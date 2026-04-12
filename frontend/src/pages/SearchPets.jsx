import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Home.css";
import "../styles/Pets.css";
import { searchPets } from "../services/api";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const SearchPets = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const query = useQuery();

  const [searchTerm, setSearchTerm] = useState(query.get("q") || "");
  const [filters, setFilters] = useState({
    location: query.get("location") || "",
    breed: query.get("breed") || "",
    vaccinationStatus: query.get("vaccinationStatus") || "",
    ageMin: query.get("ageMin") || "",
    ageMax: query.get("ageMax") || "",
  });
  const [showFilters, setShowFilters] = useState(true);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAvailableTitle, setShowAvailableTitle] = useState(false);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const runSearch = async (e) => {
    if (e) e.preventDefault();
    if (!userInfo) return;

    setLoading(true);
    setError("");
    try {
      const params = {
        q: searchTerm || undefined,
        location: filters.location || undefined,
        breed: filters.breed || undefined,
        vaccinationStatus: filters.vaccinationStatus || undefined,
        ageMin: filters.ageMin || undefined,
        ageMax: filters.ageMax || undefined,
      };

      const { data } = await searchPets(params);

      // If no exact matches, show general available pets as a fallback
      if (!data || data.length === 0) {
        const fallback = await searchPets({});
        setResults(fallback.data || []);
        setShowAvailableTitle(true);
      } else {
        setResults(data);
        setShowAvailableTitle(false);
      }
    } catch (err) {
      console.error("Pet search failed", err);
      setError(
        err.response?.data?.message ||
          "Failed to search pets. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Run search on first load using initial query parameters
  useEffect(() => {
    runSearch();
  }, []);

  return (
    <div className="home-container">
      <div className="home-search-wrapper">
        <form onSubmit={runSearch}>
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

        <div className="home-results">
          {loading && <p className="pets-loading">Searching pets...</p>}
          {error && <p className="pets-error">{error}</p>}
          {!loading && !error && results.length === 0 && (
            <p className="pets-empty">
              No pets found. Try adjusting your search or filters.
            </p>
          )}
          {!loading && !error && showAvailableTitle && results.length > 0 && (
            <p className="pets-empty" style={{ marginBottom: "8px" }}>
              No pets matched your search. Showing available pets instead.
            </p>
          )}
          {!loading && !error && results.length > 0 && (
            <div className="pets-grid">
              {showAvailableTitle && (
                <h2 className="pets-section-title" style={{ gridColumn: "1 / -1", marginBottom: "8px" }}>
                  Available Pets
                </h2>
              )}
              {results.map((pet) => (
                <div key={pet._id} className="pet-card-wrapper">
                  <Link to={`/pet/${pet._id}`} className="pet-card">
                    <div className="pet-card-image">
                      {pet.profilePhoto ? (
                        <img
                          src={`http://localhost:5000${pet.profilePhoto}`}
                          alt={pet.name}
                          className="pet-card-img"
                        />
                      ) : (
                        <div className="pet-card-no-image"></div>
                      )}
                    </div>
                    <div className="pet-card-info">
                      <h3 className="pet-card-name">
                        {pet.name} ({pet.breed})
                      </h3>
                      <p className="pet-card-detail">{pet.age}</p>
                      <p className="pet-card-detail">{pet.upazilla}</p>
                      <span className="pet-card-vaccine">
                        {pet.vaccinationStatus}
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPets;

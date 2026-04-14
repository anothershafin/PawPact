import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserProfile, getPetById } from "../services/api";
import "../styles/Pets.css"; // Reuse existing styles for a beautiful layout

const Shortlist = () => {
  const [shortlistPets, setShortlistPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShortlist = async () => {
      try {
        const { data } = await getUserProfile();
        const list = data.shortlist || [];

        // Fetch the full pet details for each item in the shortlist
        const populatedList = await Promise.all(
          list.map(async (item) => {
            const petRes = await getPetById(item.pet);
            return { ...petRes.data, shortlistLabel: item.label };
          })
        );
        
        setShortlistPets(populatedList);
      } catch (error) {
        console.error("Failed to fetch shortlist", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShortlist();
  }, []);

  if (loading) {
    return <div className="pets-container"><p className="pets-loading">Loading shortlist...</p></div>;
  }

  return (
    <div className="pets-container">
      <h1 style={{ color: "#333", textAlign: "center", marginBottom: "30px" }}>My Shortlist ⭐</h1>
      
      {shortlistPets.length === 0 ? (
        <p className="pets-empty">Your shortlist is empty. Go browse pets to add some!</p>
      ) : (
        <div className="pets-grid">
          {shortlistPets.map((pet) => (
            <div key={pet._id} className="pet-card-wrapper" style={{ position: "relative" }}>
              {/* Custom Label Tag */}
              <div style={{ position: "absolute", top: "10px", right: "10px", backgroundColor: "#ff9800", color: "white", padding: "5px 10px", borderRadius: "15px", fontSize: "12px", zIndex: 2, fontWeight: "bold" }}>
                {pet.shortlistLabel}
              </div>

              <Link to={`/pet/${pet._id}`} className="pet-card">
                <div className="pet-card-image">
                  {pet.profilePhoto ? (
                    <img src={pet.profilePhoto} alt={pet.name} className="pet-card-img" />
                  ) : (
                    <div className="pet-card-no-image"></div>
                  )}
                </div>
                <div className="pet-card-info">
                  <h3 className="pet-card-name">{pet.name} ({pet.breed})</h3>
                  <p className="pet-card-detail">{pet.age} • {pet.upazilla}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Shortlist;
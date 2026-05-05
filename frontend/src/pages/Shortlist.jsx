import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserProfile, getPetById, removeFromShortlist } from "../services/api";
import { toast } from "react-toastify";
import "../styles/Pets.css"; 

const Shortlist = () => {
  const [shortlistPets, setShortlistPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShortlist = async () => {
      try {
        const { data } = await getUserProfile();
        const list = data.shortlist || [];

        const populatedList = await Promise.all(
          list.map(async (item) => {
            const petRes = await getPetById(item.pet);
            return { ...petRes.data, shortlistLabel: item.label };
          })
        );
        setShortlistPets(populatedList);
      } catch (error) {
        toast.error("Failed to load shortlist");
      } finally {
        setLoading(false);
      }
    };
    fetchShortlist();
  }, []);

  const handleRemove = async (e, petId) => {
    e.preventDefault(); // Prevent navigating to pet profile
    try {
      await removeFromShortlist(petId);
      // Remove it from the screen immediately without reloading
      setShortlistPets(shortlistPets.filter((pet) => pet._id !== petId));
      toast.info("🗑️ Removed from shortlist");
    } catch (error) {
      toast.error("Failed to remove pet.");
    }
  };

  if (loading) return <div className="pets-container"><p className="pets-loading">Loading shortlist...</p></div>;

  return (
    <div className="pets-container">
      <h1 style={{ color: "#333", textAlign: "center", marginBottom: "30px" }}>My Shortlist ⭐</h1>
      
      {shortlistPets.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", background: "#f9f9f9", borderRadius: "10px" }}>
          <h2 style={{ color: "#666" }}>Your shortlist is empty.</h2>
          <p>Go browse our amazing pets and add them to your favourites!</p>
          <Link to="/pets" style={{ display: "inline-block", marginTop: "15px", padding: "10px 20px", background: "#4caf50", color: "white", textDecoration: "none", borderRadius: "5px" }}>Browse Pets</Link>
        </div>
      ) : (
        <div className="pets-grid">
          {shortlistPets.map((pet) => (
            <div key={pet._id} className="pet-card-wrapper" style={{ position: "relative" }}>
              
              {/* Dynamic Label Tag */}
              <div style={{ position: "absolute", top: "10px", left: "10px", backgroundColor: "#ff9800", color: "white", padding: "5px 12px", borderRadius: "15px", fontSize: "12px", zIndex: 2, fontWeight: "bold", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                {pet.shortlistLabel}
              </div>

              {/* Remove Button */}
              <button 
                onClick={(e) => handleRemove(e, pet._id)}
                style={{ position: "absolute", top: "10px", right: "10px", backgroundColor: "white", border: "1px solid #ff4d4d", color: "#ff4d4d", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", transition: "0.2s" }}
                title="Remove from shortlist"
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#ff4d4d"; e.currentTarget.style.color = "white"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; e.currentTarget.style.color = "#ff4d4d"; }}
              >
                🗑️
              </button>

              <Link to={`/pet/${pet._id}`} className="pet-card">
                <div className="pet-card-image">
                  {pet.profilePhoto ? (
                    <img src={pet.profilePhoto} alt={pet.name} className="pet-card-img" />
                  ) : ( <div className="pet-card-no-image"></div> )}
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
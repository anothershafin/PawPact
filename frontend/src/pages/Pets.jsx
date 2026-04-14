import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyPets, getAllPets, updateShortlist, removeFromShortlist, getUserProfile } from "../services/api";
import { toast } from "react-toastify";
import "../styles/Pets.css";

const Pets = () => {
  const [pets, setPets] = useState([]);
  const [shortlistIds, setShortlistIds] = useState([]); // Tracks favorite pets
  const [loading, setLoading] = useState(true);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  
  const isAdopter = userInfo && userInfo.role === "adopter";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Pets
        const { data } = isAdopter ? await getAllPets() : await getMyPets();
        setPets(data);

        // Fetch User's current shortlist to set the heart states
        if (isAdopter) {
          const userProfile = await getUserProfile();
          const savedIds = userProfile.data.shortlist.map(item => item.pet.toString());
          setShortlistIds(savedIds);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdopter]);

  // Make the Heart Toggle Work!
  const handleToggleFavorite = async (e, petId) => {
    e.preventDefault(); // Stop the card link from triggering
    try {
      if (shortlistIds.includes(petId)) {
        // Remove from favorites
        await removeFromShortlist(petId);
        setShortlistIds(shortlistIds.filter(id => id !== petId));
        toast.info("🤍 Removed from Favourites");
      } else {
        // Add to favorites
        await updateShortlist({ petId: petId, label: "Favourites" });
        setShortlistIds([...shortlistIds, petId]);
        toast.success("❤️ Added to Favourites!");
      }
    } catch (error) {
      toast.error("Failed to update favourites.");
    }
  };

  if (loading) return <div className="pets-container"><p className="pets-loading">Loading pets...</p></div>;

  return (
    <div className="pets-container">
      {!isAdopter && (
        <div className="pets-header">
          <Link to="/add-pet" className="pets-add-btn">Add Pets</Link>
        </div>
      )}

      {pets.length === 0 ? (
        <p className="pets-empty">No pets available right now.</p>
      ) : (
        <div className="pets-grid">
          {pets.map((pet) => (
            <div key={pet._id} className="pet-card-wrapper" style={{ position: "relative" }}>
              
              {/* Fully Workable Heart Button */}
              {isAdopter && (
                <button 
                  onClick={(e) => handleToggleFavorite(e, pet._id)}
                  style={{ position: "absolute", top: "10px", right: "10px", zIndex: 10, background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", fontSize: "22px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.2)", transition: "transform 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  title={shortlistIds.includes(pet._id) ? "Remove from Favourites" : "Add to Favourites"}
                >
                  {shortlistIds.includes(pet._id) ? "❤️" : "🤍"}
                </button>
              )}

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
                  <span className="pet-card-vaccine">{pet.vaccinationStatus}</span>
                </div>
              </Link>
              
              {!isAdopter && (
                <Link to={`/edit-pet/${pet._id}`} className="pet-card-edit-btn">Edit</Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Pets;
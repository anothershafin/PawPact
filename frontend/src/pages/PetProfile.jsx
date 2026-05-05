import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPetById } from "../services/api";
import "../styles/PetProfile.css";

const PetProfile = () => {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [checkedRequirements, setCheckedRequirements] = useState([]);
  const handleCheckboxChange = (req) => {
    if (checkedRequirements.includes(req)) {
      setCheckedRequirements(checkedRequirements.filter(r => r !== req)); // Uncheck
    } else {
      setCheckedRequirements([...checkedRequirements, req]); // Check
    }
  };  
  const allRequirementsMet = pet?.requirements?.length === 0 || checkedRequirements.length === pet?.requirements?.length;
  
  useEffect(() => {
    const fetchPet = async () => {
      try {
        const { data } = await getPetById(id);
        setPet(data);
      } catch (error) {
        console.error("Failed to fetch pet:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [id]);

  // Check if logged in user is the owner of this pet
  const isOwner = userInfo && pet && pet.owner && (
    pet.owner._id === userInfo._id || pet.owner === userInfo._id
  );

  if (loading) {
    return (
      <div className="petprofile-container">
        <p className="petprofile-loading">Loading pet profile...</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="petprofile-container">
        <p className="petprofile-loading">Pet not found.</p>
      </div>
    );
  }

  return (
    <div className="petprofile-container">
      {/* Top section: pet info + photo */}
      <div className="petprofile-top">
        <div className="petprofile-info">
          <h1 className="petprofile-name">{pet.name} ({pet.breed})</h1>
          <p className="petprofile-detail">{pet.age}</p>
          <p className="petprofile-detail">{pet.upazilla}, {pet.district}</p>
          <span className="petprofile-vaccine">{pet.vaccinationStatus}</span>
<<<<<<< Updated upstream
=======
          
          {/* Action Buttons for Adopters */}
          {!isOwner && userInfo && (
            <div style={{ marginTop: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={() => setShowShortlistModal(true)} style={{ padding: "8px 12px", cursor: "pointer", background: "#f0f0f0", border: "1px solid #ccc", borderRadius: "4px" }}>
                ⭐ Shortlist
              </button>
              <button onClick={handleAddToCompare} style={{ padding: "8px 12px", cursor: "pointer", background: "#f0f0f0", border: "1px solid #ccc", borderRadius: "4px" }}>
                ⚖️ Compare
              </button>

            </div>
          )}
>>>>>>> Stashed changes
        </div>

        <div className="petprofile-photo-section">
          {pet.profilePhoto ? (
            <img src={pet.profilePhoto} alt={pet.name} className="petprofile-photo" />
          ) : (
            <div className="petprofile-no-photo">No Photo</div>
          )}
          {isOwner && (
            <Link to={`/edit-pet/${pet._id}`} className="petprofile-edit-btn">Edit Pet</Link>
          )}
        </div>
      </div>

      {/* Details section */}
      <div className="petprofile-details">
        <p className="petprofile-status">
          {pet.adoptionStatus === "available"
            ? "This Pet is available for adoption."
            : `Status: ${pet.adoptionStatus}`}
        </p>
        <p className="petprofile-detail-line">
          {pet.pottyTrained ? "Potty Trained" : "Not Potty Trained"}
        </p>
        <p className="petprofile-detail-line">
          <strong>Owner:</strong> {pet.owner?.name || "Unknown"}
        </p>
        <p className="petprofile-detail-line">
          <strong>Diet:</strong> {pet.diet || "Not specified"}
        </p>

      {/* --- REQUIREMENTS & APPLY SECTION --- */}
      <div style={{ marginTop: "30px", borderTop: "1px solid #e0e0e0", paddingTop: "20px" }}>
        <h3 style={{ margin: "0 0 10px 0" }}>Requirements:</h3>

        {pet.requirements && pet.requirements.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {pet.requirements.map((req, index) => (
              <div key={index} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                
                {/* Adopters see checkboxes, Owners see standard bullet points */}
                {userInfo.role === "adopter" ? (
                  <input
                    type="checkbox"
                    id={`req-${index}`}
                    checked={checkedRequirements.includes(req)}
                    onChange={() => handleCheckboxChange(req)}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                ) : (
                  <span style={{ color: "#c62828", fontSize: "1.2rem", lineHeight: "1" }}>•</span>
                )}

                <label 
                  htmlFor={`req-${index}`} 
                  style={{ 
                    color: "#c62828", 
                    cursor: userInfo.role === "adopter" ? "pointer" : "default",
                    fontSize: "1rem"
                  }}
                >
                  {req}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#94a3b8", fontStyle: "italic", margin: "5px 0" }}>
            No specific requirements set by the owner.
          </p>
        )}

        {/* --- APPLY TO ADOPT BUTTON (MOVED HERE) --- */}
        {userInfo.role === "adopter" && (
          <div style={{ marginTop: "25px" }}>
            <button
              onClick={() => navigate(`/apply/${pet._id}`)} // Use whatever your existing onClick function is
              disabled={!allRequirementsMet}
              style={{
                backgroundColor: allRequirementsMet ? "#4caf50" : "#b0bec5", // Green if ready, Grey if locked
                color: "white",
                padding: "12px 24px",
                border: "none",
                borderRadius: "6px",
                cursor: allRequirementsMet ? "pointer" : "not-allowed",
                fontWeight: "bold",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              🐾 Apply to Adopt
            </button>
            
            {/* Warning message if locked */}
            {!allRequirementsMet && pet.requirements?.length > 0 && (
              <p style={{ color: "#d32f2f", fontSize: "0.85rem", marginTop: "8px", fontWeight: "500" }}>
                * You must agree to all of the owner's requirements before applying.
              </p>
            )}
          </div>
        )}
      </div>
      </div>

      {/* Vaccination info at bottom */}
      <div className="petprofile-vaccination-bar">
        <p>Vaccination Status: {pet.vaccinationStatus}</p>
      </div>
    </div>
  );
};

export default PetProfile;
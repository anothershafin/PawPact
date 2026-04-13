import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPetById, updateShortlist, createApplication } from "../services/api"; 
import { calculateMatchScore } from "../utils/matchingLogic";
import "../styles/PetProfile.css";
import { toast } from "react-toastify"; // Imported toast

const PetProfile = () => {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // FR-9 State
  const [showShortlistModal, setShowShortlistModal] = useState(false);
  const [shortlistLabel, setShortlistLabel] = useState("Favourites");

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const { data } = await getPetById(id);
        setPet(data);
      } catch (error) {
        console.error("Failed to fetch pet:", error);
        toast.error("Failed to load pet profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [id]);

  const handleShortlist = async () => {
    try {
      await updateShortlist({ petId: pet._id, label: shortlistLabel });
      toast.success(`Saved to ${shortlistLabel}!`); // Using Toast
      setShowShortlistModal(false);
    } catch (error) {
      console.error("Failed to shortlist", error);
      toast.error("Failed to save to shortlist.");
    }
  };

  const handleApply = async () => {
    try {
      await createApplication({ petId: pet._id, petParentId: pet.owner._id, message: "I would like to adopt this pet." });
      toast.success("Application submitted successfully! 🎉"); // Using Toast
    } catch (error) {
      console.error("Failed to apply", error);
      toast.error("Failed to submit application.");
    }
  };

  const handleAddToCompare = () => {
    let compareList = JSON.parse(localStorage.getItem("comparePets")) || [];
    if (!compareList.includes(pet._id)) {
      if (compareList.length >= 3) {
        toast.warning("You can only compare up to 3 pets at a time."); // Using Toast
        return;
      }
      compareList.push(pet._id);
      localStorage.setItem("comparePets", JSON.stringify(compareList));
      toast.success("Added to comparison list!"); // Using Toast
    } else {
      toast.info("This pet is already in your comparison list."); // Using Toast
    }
  };

  // Check if logged in user is the owner of this pet
  const isOwner = userInfo && pet && pet.owner && (
    pet.owner._id === userInfo._id || pet.owner === userInfo._id
  );
  
  const isAdopter = userInfo && userInfo.role === "adopter";

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

  // FR-11: Calculate Match Score if user is logged in
  const matchScore = userInfo && userInfo.lifestyleAnswers ? 
    calculateMatchScore(userInfo.lifestyleAnswers, pet.requirements) : null;

  return (
    <div className="petprofile-container">
      {/* Top section: pet info + photo */}
      <div className="petprofile-top">
        <div className="petprofile-info">
          <h1 className="petprofile-name">{pet.name} ({pet.breed})</h1>
          
          {/* FR-11 UI: Display Match Score */}
          {matchScore !== null && !isOwner && (
            <div style={{ background: "#e8f5e9", color: "#2e7d32", padding: "5px 10px", borderRadius: "15px", display: "inline-block", marginBottom: "10px", fontWeight: "bold" }}>
              {matchScore}% Match based on your lifestyle
            </div>
          )}

          <p className="petprofile-detail">{pet.age}</p>
          <p className="petprofile-detail">{pet.upazilla}, {pet.district}</p>
          <span className="petprofile-vaccine">{pet.vaccinationStatus}</span>
          
          {/* Action Buttons for Adopters */}
          {!isOwner && userInfo && (
            <div style={{ marginTop: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={() => setShowShortlistModal(true)} style={{ padding: "8px 12px", cursor: "pointer", background: "#f0f0f0", border: "1px solid #ccc", borderRadius: "4px" }}>
                ⭐ Shortlist
              </button>
              <button onClick={handleAddToCompare} style={{ padding: "8px 12px", cursor: "pointer", background: "#f0f0f0", border: "1px solid #ccc", borderRadius: "4px" }}>
                ⚖️ Compare
              </button>
              {isAdopter && pet.adoptionStatus === "available" && (
                 <button onClick={handleApply} style={{ padding: "8px 12px", cursor: "pointer", background: "#4caf50", color: "white", border: "none", borderRadius: "4px" }}>
                   🐾 Apply to Adopt
                 </button>
              )}
            </div>
          )}
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

        <div className="petprofile-requirements">
          <strong>Requirements:</strong>
          {pet.requirements && pet.requirements.length > 0 ? (
            <ul className="petprofile-req-list">
              {pet.requirements.map((req, index) => (
                <li key={index} className="petprofile-req-item">{req}</li>
              ))}
            </ul>
          ) : (
            <p className="petprofile-no-req">No requirements</p>
          )}
        </div>
      </div>

      {/* FR-7 Vaccination info at bottom */}
      <div className="petprofile-vaccination-bar">
        <p><strong>General Status:</strong> {pet.vaccinationStatus}</p>
        {pet.vaccinationSchedule && pet.vaccinationSchedule.length > 0 && (
          <div style={{ marginTop: "10px" }}>
            <strong>Detailed Schedule:</strong>
            <ul style={{ listStyleType: "none", paddingLeft: 0, marginTop: "5px" }}>
              {pet.vaccinationSchedule.map((vac, idx) => (
                <li key={idx} style={{ fontSize: "0.9rem", color: vac.status === "completed" ? "green" : "orange" }}>
                  • {vac.vaccineName} - {new Date(vac.date).toLocaleDateString()} ({vac.status})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* FR-9 Shortlist Modal UI */}
      {showShortlistModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "white", padding: "20px", borderRadius: "8px", width: "300px" }}>
            <h3>Save to Shortlist</h3>
            <p style={{ fontSize: "14px", color: "#666" }}>Organize your favorite pets!</p>
            <input 
              type="text" 
              value={shortlistLabel} 
              onChange={(e) => setShortlistLabel(e.target.value)}
              placeholder="e.g. Favourites, Nearby..."
              style={{ width: "90%", padding: "8px", margin: "10px 0", borderRadius: "4px", border: "1px solid #ccc" }}
            />
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowShortlistModal(false)} style={{ padding: "5px 10px", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleShortlist} style={{ padding: "5px 10px", cursor: "pointer", background: "#2196F3", color: "white", border: "none", borderRadius: "4px" }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetProfile;
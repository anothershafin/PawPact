import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPetById } from "../services/api";
import "../styles/PetProfile.css";

const PetProfile = () => {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

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

      {/* Vaccination info at bottom */}
      <div className="petprofile-vaccination-bar">
        <p>Vaccination Status: {pet.vaccinationStatus}</p>
      </div>
    </div>
  );
};

export default PetProfile;
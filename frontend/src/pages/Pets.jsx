import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyPets } from "../services/api";
import "../styles/Pets.css";

const Pets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const { data } = await getMyPets();
        setPets(data);
      } catch (error) {
        console.error("Failed to fetch pets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, []);

  if (loading) {
    return (
      <div className="pets-container">
        <p className="pets-loading">Loading pets...</p>
      </div>
    );
  }

  return (
    <div className="pets-container">
      <div className="pets-header">
        <Link to="/add-pet" className="pets-add-btn">Add Pets</Link>
      </div>

      {pets.length === 0 ? (
        <p className="pets-empty">You haven't added any pets yet. Click "Add Pets" to get started!</p>
      ) : (
        <div className="pets-grid">
          {pets.map((pet) => (
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
                  <h3 className="pet-card-name">{pet.name} ({pet.breed})</h3>
                  <p className="pet-card-detail">{pet.age}</p>
                  <p className="pet-card-detail">{pet.upazilla}</p>
                  <span className="pet-card-vaccine">{pet.vaccinationStatus}</span>
                </div>
              </Link>
              <Link to={`/edit-pet/${pet._id}`} className="pet-card-edit-btn">Edit</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Pets;
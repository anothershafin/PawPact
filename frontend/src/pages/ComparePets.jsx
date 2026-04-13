import React, { useState, useEffect } from "react";
import { getPetById } from "../services/api";

const ComparePets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComparedPets = async () => {
      // Assuming you save pet IDs to compare in localStorage under "comparePets"
      const compareIds = JSON.parse(localStorage.getItem("comparePets")) || [];
      
      if (compareIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // Fetch up to 3 pets for comparison
        const petPromises = compareIds.slice(0, 3).map(id => getPetById(id));
        const results = await Promise.all(petPromises);
        setPets(results.map(res => res.data));
      } catch (error) {
        console.error("Failed to fetch pets for comparison", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchComparedPets();
  }, []);

  if (loading) return <div style={{ padding: "20px" }}>Loading comparison...</div>;
  if (pets.length === 0) return <div style={{ padding: "20px" }}>No pets selected for comparison. Add pets to your compare list first!</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Compare Pets</h1>
      <div style={{ display: "flex", gap: "20px", overflowX: "auto" }}>
        {pets.map(pet => (
          <div key={pet._id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "15px", minWidth: "250px", flex: 1 }}>
            {pet.profilePhoto ? (
              <img src={pet.profilePhoto} alt={pet.name} style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "4px" }} />
            ) : (
              <div style={{ width: "100%", height: "200px", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>No Photo</div>
            )}
            <h2>{pet.name}</h2>
            <p><strong>Breed:</strong> {pet.breed}</p>
            <p><strong>Age:</strong> {pet.age}</p>
            <p><strong>Location:</strong> {pet.upazilla}, {pet.district}</p>
            <p><strong>Diet:</strong> {pet.diet || "N/A"}</p>
            <p><strong>Potty Trained:</strong> {pet.pottyTrained ? "Yes" : "No"}</p>
            <p><strong>Vaccination:</strong> {pet.vaccinationStatus}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparePets;
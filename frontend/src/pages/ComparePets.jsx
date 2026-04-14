import React, { useState, useEffect } from "react";
import { getPetById } from "../services/api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const ComparePets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComparedPets = async () => {
      const compareIds = JSON.parse(localStorage.getItem("comparePets")) || [];
      if (compareIds.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const petPromises = compareIds.slice(0, 3).map(id => getPetById(id));
        const results = await Promise.all(petPromises);
        setPets(results.map(res => res.data));
      } catch (error) {
        toast.error("Failed to load comparison data.");
      } finally {
        setLoading(false);
      }
    };
    fetchComparedPets();
  }, []);

  const handleRemove = (idToRemove) => {
    const updatedIds = pets.filter(p => p._id !== idToRemove).map(p => p._id);
    localStorage.setItem("comparePets", JSON.stringify(updatedIds));
    setPets(pets.filter(p => p._id !== idToRemove));
    toast.info("Removed from comparison.");
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading comparison...</div>;

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1 style={{ color: "#333", margin: 0 }}>Compare Pets ⚖️</h1>
        {pets.length > 0 && (
          <button onClick={() => { localStorage.removeItem("comparePets"); setPets([]); }} style={{ padding: "8px 15px", background: "#f44336", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            Clear All
          </button>
        )}
      </div>

      {pets.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px", background: "#f5f5f5", borderRadius: "10px" }}>
          <h2>No pets selected for comparison.</h2>
          <p>Go to the pet feed and click "Compare" on up to 3 pets to see them side-by-side!</p>
          <Link to="/pets" style={{ display: "inline-block", marginTop: "15px", padding: "10px 20px", background: "#2196F3", color: "white", textDecoration: "none", borderRadius: "5px" }}>Find Pets</Link>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "20px", overflowX: "auto", paddingBottom: "20px" }}>
          {pets.map(pet => (
            <div key={pet._id} style={{ background: "white", border: "1px solid #ddd", borderRadius: "12px", padding: "20px", minWidth: "300px", flex: 1, boxShadow: "0 4px 6px rgba(0,0,0,0.05)", position: "relative" }}>
              
              <button onClick={() => handleRemove(pet._id)} style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(255,255,255,0.8)", border: "1px solid #ccc", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", fontWeight: "bold" }}>X</button>

              {pet.profilePhoto ? (
                <img src={pet.profilePhoto} alt={pet.name} style={{ width: "100%", height: "220px", objectFit: "cover", borderRadius: "8px", marginBottom: "15px" }} />
              ) : (
                <div style={{ width: "100%", height: "220px", backgroundColor: "#f0f0f0", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "15px" }}>No Photo</div>
              )}
              
              <h2 style={{ margin: "0 0 15px 0", color: "#2c3e50" }}>{pet.name}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: "5px" }}><strong>Breed:</strong> <span>{pet.breed}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: "5px" }}><strong>Age:</strong> <span>{pet.age}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: "5px" }}><strong>Location:</strong> <span>{pet.district}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: "5px" }}><strong>Potty Trained:</strong> <span>{pet.pottyTrained ? "✅ Yes" : "❌ No"}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: "5px" }}><strong>Diet:</strong> <span>{pet.diet || "N/A"}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: "5px" }}><strong>Vaccinated:</strong> <span>{pet.vaccinationStatus}</span></div>
              </div>
              <Link to={`/pet/${pet._id}`} style={{ display: "block", textAlign: "center", marginTop: "20px", padding: "10px", background: "#4caf50", color: "white", textDecoration: "none", borderRadius: "6px", fontWeight: "bold" }}>View Full Profile</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComparePets;
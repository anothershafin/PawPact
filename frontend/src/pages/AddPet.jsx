import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPet } from "../services/api";
import "../styles/Auth.css";

const AddPet = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
    district: "",
    upazilla: "",
    diet: "",
    pottyTrained: false,
  });

  // --- FR-7: Vaccination Schedule State ---
  const [vaccinationSchedule, setVaccinationSchedule] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- FR-7: Vaccination Handlers ---
  const handleAddVaccine = () => {
    setVaccinationSchedule([...vaccinationSchedule, { vaccineName: "", date: "", status: "pending" }]);
  };

  const handleVaccineChange = (index, field, value) => {
    const updated = [...vaccinationSchedule];
    updated[index][field] = value;
    setVaccinationSchedule(updated);
  };

  const handleRemoveVaccine = (index) => {
    setVaccinationSchedule(vaccinationSchedule.filter((_, i) => i !== index));
  };
  // ----------------------------------------

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      
      await createPet({ ...formData, vaccinationSchedule });
      navigate("/pets");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to add pet. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Add a New Pet</h2>
        <p className="auth-subtitle">Enter your pet's details</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Pet Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="auth-input"
              placeholder="e.g. Komola"
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Breed</label>
            <input
              type="text"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              className="auth-input"
              placeholder="e.g. Ginger"
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Age</label>
            <input
              type="text"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="auth-input"
              placeholder="e.g. 6 Months"
              required
            />
          </div>

          <div className="auth-row">
            <div className="auth-field">
              <label className="auth-label">District</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="auth-input"
                placeholder="e.g. Dhaka"
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Upazilla</label>
              <input
                type="text"
                name="upazilla"
                value={formData.upazilla}
                onChange={handleChange}
                className="auth-input"
                placeholder="e.g. Dhanmondi"
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Diet</label>
            <input
              type="text"
              name="diet"
              value={formData.diet}
              onChange={handleChange}
              className="auth-input"
              placeholder="e.g. Chicken, Powder Milk"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" style={{ display: "flex", alignItems: "center", gap: "8px", textTransform: "none" }}>
              <input
                type="checkbox"
                name="pottyTrained"
                checked={formData.pottyTrained}
                onChange={handleChange}
                style={{ width: "18px", height: "18px" }}
              />
              Potty Trained
            </label>
          </div>

          {/* --- FR-7: Dynamic Vaccination UI --- */}
          <div style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#333" }}>Vaccination Schedule (Optional)</h3>
            
            {vaccinationSchedule.map((vac, index) => (
              <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "center", flexWrap: "wrap" }}>
                <input 
                  type="text" 
                  placeholder="Vaccine Name" 
                  value={vac.vaccineName} 
                  onChange={(e) => handleVaccineChange(index, "vaccineName", e.target.value)}
                  required
                  style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ccc", minWidth: "120px" }}
                />
                <input 
                  type="date" 
                  value={vac.date} 
                  onChange={(e) => handleVaccineChange(index, "date", e.target.value)}
                  required
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
                <select 
                  value={vac.status} 
                  onChange={(e) => handleVaccineChange(index, "status", e.target.value)}
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
                <button type="button" onClick={() => handleRemoveVaccine(index)} style={{ background: "#ff4d4d", color: "white", border: "none", padding: "8px 12px", borderRadius: "4px", cursor: "pointer" }}>X</button>
              </div>
            ))}
            
            <button type="button" onClick={handleAddVaccine} style={{ background: "#2196F3", color: "white", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: "pointer", fontSize: "14px" }}>
              + Add Vaccine Date
            </button>
          </div>
          {/* ------------------------------------ */}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Adding Pet..." : "Add Pet"}
          </button>
        </form>

        <p className="auth-switch">
          <button
            onClick={() => navigate("/pets")}
            className="auth-switch-link"
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.95rem" }}
          >
            Cancel and go back
          </button>
        </p>
      </div>
    </div>
  );
};

export default AddPet;
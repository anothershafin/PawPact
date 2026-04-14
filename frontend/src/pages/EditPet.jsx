import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPetById, updatePet } from "../services/api";
import "../styles/Auth.css";

const EditPet = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
    district: "",
    upazilla: "",
    diet: "",
    pottyTrained: false,
    adoptionStatus: "available",
  });

  // --- FR-7: Vaccination Schedule State ---
  const [vaccinationSchedule, setVaccinationSchedule] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const { data } = await getPetById(id);
        setFormData({
          name: data.name,
          breed: data.breed,
          age: data.age,
          district: data.district,
          upazilla: data.upazilla,
          diet: data.diet || "",
          pottyTrained: data.pottyTrained || false,
          adoptionStatus: data.adoptionStatus || "available",
        });
        setVaccinationSchedule(data.vaccinationSchedule || []);
      } catch (error) {
        console.error("Failed to fetch pet:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [id]);

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
    setSuccess("");

    try {
      setSaving(true);
      await updatePet(id, { ...formData, vaccinationSchedule });
      setSuccess("Pet updated successfully!");

      setTimeout(() => {
        navigate(`/pet/${id}`);
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update pet. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Edit Pet</h2>
        <p className="auth-subtitle">Update your pet's information</p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="auth-input"
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
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Adoption Status</label>
            <select
              name="adoptionStatus"
              value={formData.adoptionStatus}
              onChange={handleChange}
              className="auth-input auth-select"
            >
              <option value="available">Available</option>
              <option value="paused">Paused</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
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

          {/* Placeholder buttons for future features */}
          <button type="button" className="auth-btn" style={{ backgroundColor: "#2d6a4f", marginBottom: "10px" }}>
            Add Media
          </button>
          <button type="button" className="auth-btn" style={{ backgroundColor: "#2d6a4f", marginBottom: "10px" }}>
            Add Requirements
          </button>

          {/* --- FR-7: Dynamic Vaccination UI --- */}
          <div style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px", marginBottom: "20px", marginTop: "10px" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#333" }}>Vaccination Schedule</h3>
            
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
                  value={
                    // Format date for the input field if it already exists from DB
                    vac.date ? new Date(vac.date).toISOString().split('T')[0] : ""
                  } 
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

          <button type="submit" className="auth-btn" style={{ backgroundColor: "#1b1b1b" }} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </form>

        <p className="auth-switch">
          <button
            onClick={() => navigate(`/pet/${id}`)}
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

export default EditPet;
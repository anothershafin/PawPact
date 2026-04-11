import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPet, uploadImage } from "../services/api";
import "../styles/Auth.css";
import { toastError, toastSuccess } from "../utils/toast";

const AddPet = () => {
  const navigate = useNavigate();

  const defaultLifestyleRequirements = {
    homeType: "any",
    activityLevel: "any",
    timeAvailable: "any",
    goodWithKids: "any",
    goodWithOtherPets: "any",
    experienceLevel: "any",
  };

  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
    district: "",
    upazilla: "",
    diet: "",
    pottyTrained: false,
    profilePhoto: "",
    vaccinationStatus: "Not Vaccinated",
    lifestyleRequirements: { ...defaultLifestyleRequirements },
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const setLifestyleRequirement = (key, value) => {
    setFormData((p) => ({
      ...p,
      lifestyleRequirements: {
        ...(p.lifestyleRequirements || defaultLifestyleRequirements),
        [key]: value,
      },
    }));
  };

  const setVaccinationStatus = (vaccinationStatus) => {
    setFormData((p) => ({ ...p, vaccinationStatus }));
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadImage(file);
      setFormData((p) => ({ ...p, profilePhoto: res.data.url }));
      toastSuccess("Image uploaded.");
    } catch (err) {
      toastError(err.response?.data?.message || err.message || "Upload failed");
    } finally {
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await createPet(formData);
      toastSuccess("Pet added.");
      navigate("/pets");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to add pet. Please try again."
      );
      toastError(err.response?.data?.message || "Failed to add pet");
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

          <div className="auth-field">
            <span className="auth-label">Vaccinated</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", textTransform: "none", fontWeight: 400 }}>
                <input
                  type="radio"
                  name="vaccinationStatus"
                  checked={formData.vaccinationStatus === "Vaccinated"}
                  onChange={() => setVaccinationStatus("Vaccinated")}
                />
                Yes
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", textTransform: "none", fontWeight: 400 }}>
                <input
                  type="radio"
                  name="vaccinationStatus"
                  checked={formData.vaccinationStatus === "Not Vaccinated"}
                  onChange={() => setVaccinationStatus("Not Vaccinated")}
                />
                No
              </label>
            </div>
          </div>

          <h3 className="auth-subtitle" style={{ marginTop: 8, marginBottom: 4 }}>
            Lifestyle requirements (match scoring)
          </h3>
          <p style={{ fontSize: "0.9rem", opacity: 0.85, marginBottom: 12 }}>
            Use &quot;Any&quot; when a dimension does not matter. Adopters see a match % on the pet profile.
          </p>

          <div className="auth-field">
            <label className="auth-label">Preferred home type</label>
            <select
              className="auth-input auth-select"
              value={formData.lifestyleRequirements?.homeType || "any"}
              onChange={(e) => setLifestyleRequirement("homeType", e.target.value)}
            >
              <option value="any">Any</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
            </select>
          </div>

          <div className="auth-row">
            <div className="auth-field">
              <label className="auth-label">Activity level</label>
              <select
                className="auth-input auth-select"
                value={formData.lifestyleRequirements?.activityLevel || "any"}
                onChange={(e) => setLifestyleRequirement("activityLevel", e.target.value)}
              >
                <option value="any">Any</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="auth-field">
              <label className="auth-label">Time available</label>
              <select
                className="auth-input auth-select"
                value={formData.lifestyleRequirements?.timeAvailable || "any"}
                onChange={(e) => setLifestyleRequirement("timeAvailable", e.target.value)}
              >
                <option value="any">Any</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="auth-row">
            <div className="auth-field">
              <label className="auth-label">Kids in home</label>
              <select
                className="auth-input auth-select"
                value={formData.lifestyleRequirements?.goodWithKids || "any"}
                onChange={(e) => setLifestyleRequirement("goodWithKids", e.target.value)}
              >
                <option value="any">Any</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div className="auth-field">
              <label className="auth-label">Other pets</label>
              <select
                className="auth-input auth-select"
                value={formData.lifestyleRequirements?.goodWithOtherPets || "any"}
                onChange={(e) => setLifestyleRequirement("goodWithOtherPets", e.target.value)}
              >
                <option value="any">Any</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Adopter experience</label>
            <select
              className="auth-input auth-select"
              value={formData.lifestyleRequirements?.experienceLevel || "any"}
              onChange={(e) => setLifestyleRequirement("experienceLevel", e.target.value)}
            >
              <option value="any">Any</option>
              <option value="firstTimeOk">First-time OK</option>
              <option value="experiencedOnly">Experienced only</option>
            </select>
          </div>

          <div className="auth-field">
            <label className="auth-label">Profile Photo</label>
            {formData.profilePhoto ? (
              <img
                src={formData.profilePhoto}
                alt="Pet"
                style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 12, marginBottom: 10 }}
              />
            ) : null}
            <input className="auth-input" type="file" accept="image/*" onChange={handleUpload} />
          </div>

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
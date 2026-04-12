import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPetById, updatePet, uploadPetProfilePhoto, uploadPetAlbumPhotos } from "../services/api";
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showMedia, setShowMedia] = useState(false);
  const [uploading, setUploading] = useState(false);

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
      } catch (error) {
        console.error("Failed to fetch pet:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [id]);

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
      await updatePet(id, formData);
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

  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const { data } = await uploadPetProfilePhoto(id, file);
      setFormData((prev) => ({ ...prev, profilePhoto: data.profilePhoto }));
    } catch (err) {
      console.error("Profile photo upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const handleAlbumPhotosChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setUploading(true);
      const { data } = await uploadPetAlbumPhotos(id, files);
      setFormData((prev) => ({ ...prev, photos: data.photos || [] }));
    } catch (err) {
      console.error("Album upload failed", err);
    } finally {
      setUploading(false);
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
          <button
            type="button"
            className="auth-btn"
            style={{ backgroundColor: "#2d6a4f" }}
            onClick={() => setShowMedia(!showMedia)}
          >
            {showMedia ? "Hide Media Options" : "Add Media"}
          </button>

          {showMedia && (
            <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
              <h3 style={{ marginBottom: "0.5rem" }}>Update Profile Picture</h3>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoChange}
                style={{ marginBottom: "1rem" }}
              />
              {formData.profilePhoto && (
                <img
                  src={`http://localhost:5000${formData.profilePhoto}`}
                  alt="Profile preview"
                  style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px", marginBottom: "1rem" }}
                />
              )}

              <h3 style={{ marginBottom: "0.5rem" }}>Add Photos to Album</h3>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAlbumPhotosChange}
              />
              {uploading && <p style={{ marginTop: "0.5rem" }}>Uploading...</p>}
            </div>
          )}
          <button type="button" className="auth-btn" style={{ backgroundColor: "#2d6a4f" }}>
            Add Requirements
          </button>
          <button type="button" className="auth-btn" style={{ backgroundColor: "#2d6a4f" }}>
            Add Vaccination Status
          </button>

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
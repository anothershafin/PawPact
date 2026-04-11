import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPetById, updatePet, uploadImage } from "../services/api";
import "../styles/Auth.css";
import { toastError, toastSuccess } from "../utils/toast";

const EditPet = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const galleryInputRef = useRef(null);
  const vaccYesRef = useRef(null);

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
    adoptionStatus: "available",
    profilePhoto: "",
    photos: [],
    coverPhoto: "",
    vaccinationStatus: "Not Vaccinated",
    lifestyleRequirements: { ...defaultLifestyleRequirements },
  });

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
          profilePhoto: data.profilePhoto || "",
          photos: Array.isArray(data.photos) ? data.photos : [],
          coverPhoto: data.coverPhoto || "",
          vaccinationStatus: data.vaccinationStatus || "Not Vaccinated",
          lifestyleRequirements: {
            ...defaultLifestyleRequirements,
            ...(data.lifestyleRequirements || {}),
          },
        });
      } catch (error) {
        console.error("Failed to fetch pet:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [id]);

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

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      const results = await Promise.all(files.map((f) => uploadImage(f)));
      const uploadedUrls = results.map((r) => r.data.url);
      setFormData((p) => {
        const nextPhotos = [...(p.photos || []), ...uploadedUrls];
        return {
          ...p,
          photos: nextPhotos,
          coverPhoto: p.coverPhoto || nextPhotos[0] || "",
        };
      });
      toastSuccess("Media added.");
    } catch (err) {
      toastError(err.response?.data?.message || err.message || "Failed to upload media");
    } finally {
      e.target.value = "";
    }
  };

  const removeGalleryPhoto = (url) => {
    setFormData((p) => {
      const nextPhotos = (p.photos || []).filter((x) => x !== url);
      const nextCover = p.coverPhoto === url ? nextPhotos[0] || "" : p.coverPhoto;
      return { ...p, photos: nextPhotos, coverPhoto: nextCover };
    });
  };

  const setCover = (url) => setFormData((p) => ({ ...p, coverPhoto: url }));

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
            <span className="auth-label">Vaccinated</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", textTransform: "none", fontWeight: 400 }}>
                <input
                  ref={vaccYesRef}
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
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", textTransform: "none", fontWeight: 400 }}>
                <input
                  type="radio"
                  name="vaccinationStatus"
                  checked={formData.vaccinationStatus === "Partially Vaccinated"}
                  onChange={() => setVaccinationStatus("Partially Vaccinated")}
                />
                Partially
              </label>
            </div>
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

          <h3 className="auth-subtitle" style={{ marginTop: 8, marginBottom: 4 }}>
            Lifestyle requirements (match scoring)
          </h3>
          <p style={{ fontSize: "0.9rem", opacity: 0.85, marginBottom: 12 }}>
            Use &quot;Any&quot; when a dimension does not matter. Adopters see a match % on the pet profile based on their questionnaire.
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

          <div className="auth-field">
            <label className="auth-label">Media Gallery</label>
            <input
              ref={galleryInputRef}
              className="auth-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              style={{ display: "none" }}
            />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {(formData.photos || []).map((url) => (
                <div key={url} style={{ width: 110 }}>
                  <img
                    src={url}
                    alt="media"
                    style={{ width: 110, height: 80, objectFit: "cover", borderRadius: 10, border: url === formData.coverPhoto ? "2px solid #2d6a4f" : "1px solid #e6e6e6" }}
                  />
                  <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                    <button type="button" className="auth-btn" style={{ padding: "8px 10px" }} onClick={() => setCover(url)}>
                      Cover
                    </button>
                    <button type="button" className="auth-btn" style={{ padding: "8px 10px" }} onClick={() => removeGalleryPhoto(url)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Make legacy buttons actually work */}
          <button
            type="button"
            className="auth-btn"
            style={{ backgroundColor: "#2d6a4f" }}
            onClick={() => galleryInputRef.current?.click()}
          >
            Add Media
          </button>
          <button
            type="button"
            className="auth-btn"
            style={{ backgroundColor: "#2d6a4f" }}
            onClick={() => vaccYesRef.current?.focus()}
          >
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
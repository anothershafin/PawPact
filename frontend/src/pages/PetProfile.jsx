import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toastError, toastInfo, toastSuccess } from "../utils/toast";
import {
  addPetToShortlistLabel,
  addVaccination,
  createApplication,
  createShortlistLabel,
  deleteVaccination,
  getMatchScoreForPet,
  getPetById,
  getShortlist,
} from "../services/api";
import "../styles/PetProfile.css";
import { vaccinationShortLabel } from "../utils/vaccinationDisplay";
import { formatPetRequirement, formatUserAnswer } from "../utils/questionnaireDisplay";

const PetProfile = () => {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shortlist, setShortlist] = useState([]);
  const [score, setScore] = useState(null);
  const [scoreErr, setScoreErr] = useState("");
  const [vaccForm, setVaccForm] = useState({ title: "", scheduledAt: "", notes: "" });

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

  useEffect(() => {
    const run = async () => {
      setScore(null);
      setScoreErr("");
      if (userInfo?.role !== "adopter") {
        setShortlist([]);
        return;
      }
      try {
        const sl = await getShortlist().then((r) => r.data).catch(() => []);
        setShortlist(sl);
      } catch {
        setShortlist([]);
      }
      try {
        const { data } = await getMatchScoreForPet(id);
        setScore(data);
      } catch (e) {
        setScoreErr(e.response?.data?.message || "Match score unavailable");
      }
    };
    run();
  }, [id, userInfo?.role, userInfo?._id]);

  // Check if logged in user is the owner of this pet
  const isOwner = userInfo && pet && pet.owner && (
    pet.owner._id === userInfo._id || pet.owner === userInfo._id
  );

  const addToCompare = () => {
    const key = "comparePetIds";
    let ids = [];
    try {
      ids = JSON.parse(localStorage.getItem(key) || "[]");
      if (!Array.isArray(ids)) ids = [];
    } catch {
      ids = [];
    }
    if (ids.includes(id)) {
      toastInfo("Already in compare.");
      return;
    }
    if (ids.length >= 3) {
      toastInfo("You can compare up to 3 pets.");
      return;
    }
    ids.push(id);
    localStorage.setItem(key, JSON.stringify(ids));
    toastSuccess("Added to compare.");
  };

  const addToShortlist = async () => {
    try {
      let labels = shortlist;
      if (!labels || labels.length === 0) {
        const title = "Favourites";
        const created = await createShortlistLabel(title);
        labels = created.data;
        setShortlist(labels);
      }
      const labelId = labels[0]._id;
      await addPetToShortlistLabel(labelId, id);
      toastSuccess(`Saved to "${labels[0].title}".`);
    } catch (e) {
      toastError(e.response?.data?.message || "Failed to save to shortlist");
    }
  };

  const apply = async () => {
    try {
      const message = window.prompt("Optional message to the pet parent?");
      await createApplication(id, message || "");
      toastSuccess("Application submitted.");
    } catch (e) {
      toastError(e.response?.data?.message || "Failed to submit application");
    }
  };

  const addVacc = async (e) => {
    e.preventDefault();
    try {
      await addVaccination(id, vaccForm);
      const refreshed = await getPetById(id);
      setPet(refreshed.data);
      setVaccForm({ title: "", scheduledAt: "", notes: "" });
      toastSuccess("Vaccination entry added.");
    } catch (e2) {
      toastError(e2.response?.data?.message || "Failed to add vaccination entry");
    }
  };

  const removeVacc = async (vaccinationId) => {
    try {
      await deleteVaccination(id, vaccinationId);
      const refreshed = await getPetById(id);
      setPet(refreshed.data);
      toastSuccess("Vaccination entry removed.");
    } catch (e2) {
      toastError(e2.response?.data?.message || "Failed to remove vaccination entry");
    }
  };

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
          <span className="petprofile-vaccine">Vaccinated: {vaccinationShortLabel(pet.vaccinationStatus)}</span>
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

        {userInfo?.role === "adopter" && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            <button className="petprofile-edit-btn" type="button" onClick={addToShortlist}>
              Save to shortlist
            </button>
            <button className="petprofile-edit-btn" type="button" onClick={addToCompare}>
              Add to compare
            </button>
            <button className="petprofile-edit-btn" type="button" onClick={apply}>
              Apply to adopt
            </button>
          </div>
        )}

        {userInfo?.role === "adopter" && (
          <div style={{ marginBottom: 12 }}>
            <strong>Lifestyle match:</strong>{" "}
            {score ? (
              <div style={{ marginTop: 4 }}>
                <span style={{ fontWeight: 800 }}>{score.score}%</span>
                {score.scoringNote ? (
                  <p style={{ fontSize: "0.92rem", opacity: 0.85, marginTop: 6, fontWeight: 400, maxWidth: 520 }}>
                    {score.scoringNote}
                  </p>
                ) : null}
                {Array.isArray(score.breakdown) && score.breakdown.length > 0 ? (
                  <details style={{ marginTop: 10 }}>
                    <summary style={{ cursor: "pointer", fontWeight: 600 }}>How this score was calculated</summary>
                    <ul style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: "0.9rem", maxWidth: 560 }}>
                      {score.breakdown.map((row) => (
                        <li key={row.key} style={{ marginBottom: 8, opacity: row.counted ? 1 : 0.7 }}>
                          <strong>{row.label}:</strong> Your answer — {formatUserAnswer(row.key, row.userAnswer)}; Pet
                          preference — {formatPetRequirement(row.key, row.petNeed)}
                          {!row.counted
                            ? " (does not change score)"
                            : row.ok
                              ? " — match"
                              : " — no match"}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </div>
            ) : (
              <span style={{ opacity: 0.75 }}>
                {scoreErr === "Questionnaire not completed" || String(scoreErr || "").toLowerCase().includes("questionnaire") ? (
                  <>
                    Complete the{" "}
                    <Link to="/questionnaire" style={{ fontWeight: 700, color: "#2d6a4f" }}>
                      lifestyle questionnaire
                    </Link>{" "}
                    to see your match score.
                  </>
                ) : (
                  scoreErr || "Loading..."
                )}
              </span>
            )}
          </div>
        )}

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

      <div className="petprofile-details" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Vaccination Schedule</h3>
        {pet.vaccinationSchedule && pet.vaccinationSchedule.length > 0 ? (
          <ul className="petprofile-req-list">
            {pet.vaccinationSchedule
              .slice()
              .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
              .map((v) => (
                <li key={v._id} className="petprofile-req-item" style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span>
                    <strong>{v.title}</strong> — {new Date(v.scheduledAt).toLocaleString()} ({v.status})
                    {v.notes ? <span style={{ opacity: 0.75 }}> — {v.notes}</span> : null}
                  </span>
                  {isOwner && (
                    <button type="button" className="petprofile-edit-btn" onClick={() => removeVacc(v._id)}>
                      Delete
                    </button>
                  )}
                </li>
              ))}
          </ul>
        ) : (
          <p className="petprofile-no-req">No scheduled vaccinations</p>
        )}

        {isOwner && (
          <form onSubmit={addVacc} style={{ display: "grid", gap: 10, marginTop: 12 }}>
            <input
              className="auth-input"
              placeholder="Title (e.g. Rabies)"
              value={vaccForm.title}
              onChange={(e) => setVaccForm((p) => ({ ...p, title: e.target.value }))}
              required
            />
            <input
              className="auth-input"
              type="datetime-local"
              value={vaccForm.scheduledAt}
              onChange={(e) => setVaccForm((p) => ({ ...p, scheduledAt: e.target.value }))}
              required
            />
            <input
              className="auth-input"
              placeholder="Notes (optional)"
              value={vaccForm.notes}
              onChange={(e) => setVaccForm((p) => ({ ...p, notes: e.target.value }))}
            />
            <button type="submit" className="auth-btn">
              Add vaccination time
            </button>
          </form>
        )}
      </div>

      {/* Vaccination info at bottom */}
      <div className="petprofile-vaccination-bar">
        <p>Vaccinated: {vaccinationShortLabel(pet.vaccinationStatus)}</p>
      </div>
    </div>
  );
};

export default PetProfile;
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toastError, toastInfo, toastSuccess } from "../utils/toast";
import {
  createShortlistLabel,
  deleteShortlistLabel,
  getPetById,
  getShortlist,
  removePetFromShortlistLabel,
  renameShortlistLabel,
} from "../services/api";

const Shortlist = () => {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");

  const [expanded, setExpanded] = useState({});
  const [petCache, setPetCache] = useState({});

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const compareIds = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("comparePetIds") || "[]");
    } catch {
      return [];
    }
  }, []);

  const refresh = async () => {
    const { data } = await getShortlist();
    setLabels(data);
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await refresh();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const loadPet = async (petId) => {
    if (petCache[petId]) return;
    const { data } = await getPetById(petId);
    setPetCache((p) => ({ ...p, [petId]: data }));
  };

  const toggleExpanded = async (labelId) => {
    setExpanded((p) => ({ ...p, [labelId]: !p[labelId] }));
    const label = labels.find((l) => l._id === labelId);
    if (label) {
      for (const id of label.petIds || []) {
        await loadPet(id);
      }
    }
  };

  const onCreateLabel = async () => {
    try {
      if (!newTitle.trim()) return;
      await createShortlistLabel(newTitle.trim());
      setNewTitle("");
      await refresh();
      toastSuccess("Label created.");
    } catch (e) {
      toastError(e.response?.data?.message || "Failed to create label");
    }
  };

  const onRename = async (labelId) => {
    const title = window.prompt("New title?");
    if (!title) return;
    try {
      await renameShortlistLabel(labelId, title);
      await refresh();
      toastSuccess("Label renamed.");
    } catch (e) {
      toastError(e.response?.data?.message || "Failed to rename label");
    }
  };

  const onDelete = async (labelId) => {
    if (!window.confirm("Delete this label?")) return;
    try {
      await deleteShortlistLabel(labelId);
      await refresh();
      toastSuccess("Label deleted.");
    } catch (e) {
      toastError(e.response?.data?.message || "Failed to delete label");
    }
  };

  const onRemovePet = async (labelId, petId) => {
    try {
      await removePetFromShortlistLabel(labelId, petId);
      await refresh();
      toastSuccess("Removed from label.");
    } catch (e) {
      toastError(e.response?.data?.message || "Failed to remove pet");
    }
  };

  if (!userInfo || userInfo.role !== "adopter") {
    return (
      <div style={{ padding: 24 }}>
        <h2>Shortlist</h2>
        <p>This page is for adopters.</p>
        <Link to="/login">Log in</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Shortlist</h2>
        <Link to="/discover">Discover pets</Link>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <input
          className="auth-input"
          placeholder='New label (e.g. "Favourites")'
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button className="auth-btn" type="button" onClick={onCreateLabel}>
          Create
        </button>
      </div>

      {loading ? (
        <p style={{ marginTop: 16 }}>Loading...</p>
      ) : labels.length === 0 ? (
        <p style={{ marginTop: 16 }}>No labels yet. Create one above.</p>
      ) : (
        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {labels.map((label) => (
            <div key={label._id} style={{ border: "1px solid #e6e6e6", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button className="auth-btn" type="button" onClick={() => toggleExpanded(label._id)}>
                    {expanded[label._id] ? "Hide" : "Show"}
                  </button>
                  <div>
                    <div style={{ fontWeight: 700 }}>{label.title}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{(label.petIds || []).length} pets</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="auth-btn" type="button" onClick={() => onRename(label._id)}>
                    Rename
                  </button>
                  <button className="auth-btn" type="button" onClick={() => onDelete(label._id)}>
                    Delete
                  </button>
                </div>
              </div>

              {expanded[label._id] && (
                <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                  {(label.petIds || []).length === 0 ? (
                    <div style={{ opacity: 0.7 }}>No pets in this label yet.</div>
                  ) : (
                    (label.petIds || []).map((petId) => {
                      const pet = petCache[petId];
                      return (
                        <div
                          key={petId}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 12,
                            borderTop: "1px solid #f0f0f0",
                            paddingTop: 10,
                          }}
                        >
                          <div style={{ display: "flex", gap: 12 }}>
                            <div style={{ width: 56, height: 56, borderRadius: 10, background: "#f4f4f4" }}>
                              {pet?.profilePhoto ? (
                                <img
                                  src={pet.profilePhoto}
                                  alt={pet.name}
                                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }}
                                />
                              ) : null}
                            </div>
                            <div>
                              <Link to={`/pet/${petId}`} style={{ fontWeight: 700 }}>
                                {pet ? `${pet.name} (${pet.breed})` : "Loading..."}
                              </Link>
                              <div style={{ fontSize: 12, opacity: 0.75 }}>{pet ? `${pet.upazilla}, ${pet.district}` : ""}</div>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <button
                              className="auth-btn"
                              type="button"
                              onClick={() => {
                                const ids = Array.isArray(compareIds) ? [...compareIds] : [];
                                if (ids.includes(petId)) {
                                  toastInfo("Already in compare.");
                                  return;
                                }
                                if (ids.length >= 3) {
                                  toastInfo("You can compare up to 3 pets.");
                                  return;
                                }
                                ids.push(petId);
                                localStorage.setItem("comparePetIds", JSON.stringify(ids));
                                toastSuccess("Added to compare.");
                              }}
                            >
                              Add to compare
                            </button>
                            <button className="auth-btn" type="button" onClick={() => onRemovePet(label._id, petId)}>
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Shortlist;


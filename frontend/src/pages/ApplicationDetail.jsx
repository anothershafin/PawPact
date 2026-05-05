import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getApplications, 
  addObservationUpdate, 
  submitObservationResponse,
  deleteObservationUpdate 
} from "../services/api";
import { toast } from "react-toastify";

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const isAdopter = userInfo.role === "adopter";

  // New update form state
  const [newUpdate, setNewUpdate] = useState({
    title: "",
    description: "",
    dueDate: ""
  });

  // Response form state
  const [response, setResponse] = useState({
    note: "",
    photos: []
  });

  useEffect(() => {
    fetchApplicationDetail();
  }, [id]);

  const fetchApplicationDetail = async () => {
    try {
      const { data } = await getApplications();
      const app = data.find(a => a._id === id);
      
      if (!app) {
        toast.error("Application not found");
        navigate("/applications");
        return;
      }
      
      setApplication(app);
    } catch (error) {
      console.error("Error fetching application:", error);
      toast.error("Failed to load application details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    
    if (!newUpdate.title || !newUpdate.dueDate) {
      toast.error("Title and due date are required");
      return;
    }

    try {
      const { data } = await addObservationUpdate(id, newUpdate);
      setApplication(data);
      setNewUpdate({ title: "", description: "", dueDate: "" });
      setShowAddUpdate(false);
      toast.success("Observation update added successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add update");
    }
  };

  const handleSubmitResponse = async (updateId) => {
    if (!response.note.trim()) {
      toast.error("Please provide a response note");
      return;
    }

    try {
      const { data } = await submitObservationResponse(id, updateId, response);
      setApplication(data);
      setResponse({ note: "", photos: [] });
      setSelectedUpdate(null);
      toast.success("Response submitted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit response");
    }
  };

  const handleDeleteUpdate = async (updateId) => {
    if (!window.confirm("Are you sure you want to delete this update?")) return;

    try {
      const { data } = await deleteObservationUpdate(id, updateId);
      setApplication(data);
      toast.success("Update deleted successfully");
    } catch (error) {
      toast.error("Failed to delete update");
    }
  };

  const getUpdateStatusBadge = (update) => {
    const now = new Date();
    const dueDate = new Date(update.dueDate);
    
    if (update.status === 'completed') {
      return { text: '✓ Completed', color: '#4caf50', bg: '#e8f5e9' };
    } else if (dueDate < now) {
      return { text: '⚠ Overdue', color: '#f44336', bg: '#ffebee' };
    } else {
      return { text: '⏳ Pending', color: '#ff9800', bg: '#fff3e0' };
    }
  };

  const getDaysRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return `${Math.abs(diff)} days overdue`;
    if (diff === 0) return 'Due today';
    if (diff === 1) return 'Due tomorrow';
    return `${diff} days remaining`;
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", fontSize: "18px", color: "#666" }}>
        Loading application details...
      </div>
    );
  }

  if (!application) return null;

  return (
    <div style={{ padding: "50px 20px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <button 
        onClick={() => navigate("/applications")}
        style={{
          marginBottom: "20px",
          padding: "10px 20px",
          background: "#f1f5f9",
          border: "1px solid #cbd5e1",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "0.95rem",
          color: "#475569"
        }}
      >
        ← Back to Applications
      </button>

      {/* Application Overview Card */}
      <div style={{ background: "white", borderRadius: "16px", padding: "30px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", marginBottom: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "20px" }}>
          <div>
            <h1 style={{ margin: "0 0 10px 0", color: "#1e293b", fontSize: "2rem" }}>
              {application.pet?.name}
            </h1>
            <p style={{ margin: 0, color: "#64748b" }}>
              Application Status: <strong style={{ color: "#2d6a4f" }}>{application.status}</strong>
            </p>
          </div>
          <span style={{
            padding: "8px 16px",
            borderRadius: "20px",
            fontSize: "0.85rem",
            fontWeight: "bold",
            background: "#e8f5e9",
            color: "#2e7d32"
          }}>
            {application.status}
          </span>
        </div>

        {application.observationPeriod?.startDate && (
          <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "10px", marginTop: "20px" }}>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#475569" }}>
              <strong>🔍 Observation Period:</strong><br/>
              {new Date(application.observationPeriod.startDate).toLocaleDateString()} - {new Date(application.observationPeriod.endDate).toLocaleDateString()}
              <span style={{ marginLeft: "10px", color: "#64748b" }}>
                ({application.observationPeriod.durationDays} days)
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Observation Updates Section */}
      <div style={{ background: "white", borderRadius: "16px", padding: "30px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <h2 style={{ margin: 0, color: "#1e293b", fontSize: "1.5rem" }}>
            📋 Observation Updates
          </h2>
          
          {!isAdopter && application.status === 'accepted' && (
            <button
              onClick={() => setShowAddUpdate(!showAddUpdate)}
              style={{
                padding: "10px 20px",
                background: "#2d6a4f",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.95rem"
              }}
            >
              {showAddUpdate ? "Cancel" : "+ Add Update"}
            </button>
          )}
        </div>

        {/* Add Update Form (Pet Parent Only) */}
        {showAddUpdate && !isAdopter && (
          <form onSubmit={handleAddUpdate} style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", marginBottom: "25px" }}>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#334155", fontSize: "0.9rem" }}>
                Update Title *
              </label>
              <input
                type="text"
                value={newUpdate.title}
                onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                placeholder="e.g., Bath the cat"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.95rem"
                }}
                required
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#334155", fontSize: "0.9rem" }}>
                Description (Optional)
              </label>
              <textarea
                value={newUpdate.description}
                onChange={(e) => setNewUpdate({ ...newUpdate, description: e.target.value })}
                placeholder="Additional instructions or notes..."
                rows="3"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.95rem",
                  fontFamily: "inherit"
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#334155", fontSize: "0.9rem" }}>
                Due Date *
              </label>
              <input
                type="date"
                value={newUpdate.dueDate}
                onChange={(e) => setNewUpdate({ ...newUpdate, dueDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.95rem"
                }}
                required
              />
            </div>

            <button
              type="submit"
              style={{
                padding: "12px 24px",
                background: "#2d6a4f",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.95rem"
              }}
            >
              Add Update
            </button>
          </form>
        )}

        {/* Updates List */}
        {application.observationUpdates && application.observationUpdates.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {application.observationUpdates
              .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
              .map((update) => {
                const badge = getUpdateStatusBadge(update);
                const isExpanded = selectedUpdate === update._id;
                
                return (
                  <div 
                    key={update._id}
                    style={{
                      border: `2px solid ${badge.color}`,
                      borderRadius: "12px",
                      padding: "20px",
                      background: badge.bg,
                      transition: "all 0.2s"
                    }}
                  >
                    {/* Update Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "15px" }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: "0 0 8px 0", color: "#1e293b", fontSize: "1.1rem" }}>
                          {update.title}
                        </h3>
                        <div style={{ display: "flex", gap: "15px", fontSize: "0.85rem", color: "#64748b" }}>
                          <span>📅 {new Date(update.dueDate).toLocaleDateString()}</span>
                          <span>{getDaysRemaining(update.dueDate)}</span>
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <span style={{
                          padding: "6px 12px",
                          borderRadius: "16px",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          background: badge.color,
                          color: "white"
                        }}>
                          {badge.text}
                        </span>
                        
                        {!isAdopter && update.status !== 'completed' && (
                          <button
                            onClick={() => handleDeleteUpdate(update._id)}
                            style={{
                              padding: "6px 12px",
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "0.75rem"
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {update.description && (
                      <p style={{ margin: "0 0 15px 0", color: "#475569", fontSize: "0.9rem", fontStyle: "italic" }}>
                        {update.description}
                      </p>
                    )}

                    {/* Adopter Response Section */}
                    {update.adopterResponse?.note ? (
                      <div style={{ background: "white", padding: "15px", borderRadius: "8px", marginTop: "15px" }}>
                        <p style={{ margin: "0 0 8px 0", fontWeight: "600", color: "#334155", fontSize: "0.9rem" }}>
                          ✅ Adopter Response:
                        </p>
                        <p style={{ margin: "0 0 8px 0", color: "#475569", fontSize: "0.9rem" }}>
                          {update.adopterResponse.note}
                        </p>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>
                          Submitted: {new Date(update.adopterResponse.submittedAt).toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      isAdopter && update.status !== 'completed' && (
                        <div style={{ marginTop: "15px" }}>
                          {isExpanded ? (
                            <div style={{ background: "white", padding: "15px", borderRadius: "8px" }}>
                              <textarea
                                value={response.note}
                                onChange={(e) => setResponse({ ...response, note: e.target.value })}
                                placeholder="Describe what you did (e.g., Bath completed successfully)"
                                rows="3"
                                style={{
                                  width: "100%",
                                  padding: "10px",
                                  borderRadius: "6px",
                                  border: "1px solid #cbd5e1",
                                  fontSize: "0.9rem",
                                  marginBottom: "10px",
                                  fontFamily: "inherit"
                                }}
                              />
                              <div style={{ display: "flex", gap: "10px" }}>
                                <button
                                  onClick={() => handleSubmitResponse(update._id)}
                                  style={{
                                    padding: "10px 20px",
                                    background: "#2d6a4f",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    fontSize: "0.9rem"
                                  }}
                                >
                                  Submit Response
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedUpdate(null);
                                    setResponse({ note: "", photos: [] });
                                  }}
                                  style={{
                                    padding: "10px 20px",
                                    background: "#f1f5f9",
                                    color: "#475569",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "0.9rem"
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setSelectedUpdate(update._id)}
                              style={{
                                padding: "10px 20px",
                                background: "#2d6a4f",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "600",
                                fontSize: "0.9rem",
                                width: "100%"
                              }}
                            >
                              Submit Response
                            </button>
                          )}
                        </div>
                      )
                    )}
                  </div>
                );
              })}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
            <p style={{ fontSize: "3rem", margin: "0 0 10px 0" }}>📋</p>
            <p style={{ margin: 0, fontSize: "1.1rem" }}>
              {isAdopter 
                ? "No observation updates yet. The pet parent will add tasks for you to complete."
                : "No observation updates yet. Click 'Add Update' to create tasks for the adopter."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationDetail;
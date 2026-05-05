import React, { useState, useEffect } from "react";
import { getApplications, updateAppStatus } from "../services/api";
import { toast } from "react-toastify";
import { addObservationTask, replyToObservationTask } from "../services/api";
const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ description: "", date: "" });
  const [replies, setReplies] = useState({}); // To hold dynamic input for multiple tasks
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // Example: Applications.jsx or similar
  useEffect(() => {
  const fetchApplications = async () => {
    try {
      const { data } = await getApplications();
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications.");
    } finally {
      setLoading(false);  // ✅ ADD THIS - Always runs, even on error
    }
  };
  
  fetchApplications();
}, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateAppStatus(id, newStatus);
      setApplications(applications.map(app => app._id === id ? { ...app, status: newStatus } : app));
      toast.success(`Application marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'accepted': return { bg: '#e8f5e9', text: '#2e7d32', border: '#4caf50' };
      case 'rejected': return { bg: '#ffebee', text: '#c62828', border: '#f44336' };
      case 'under review': return { bg: '#fff8e1', text: '#f57f17', border: '#ffb300' };
      default: return { bg: '#e3f2fd', text: '#1565c0', border: '#2196f3' };
    }
  };

  const handleAddTask = async (appId) => {
    if (!newTask.description || !newTask.date) return toast.warning("Please fill out task details.");
    setTaskSubmitting(true);
    try {
      const { data } = await addObservationTask(appId, { taskDescription: newTask.description, dueDate: newTask.date });
      // Update local state to show the new task instantly
      setApplications(applications.map(app => app._id === appId ? data : app));
      setNewTask({ description: "", date: "" }); // reset form
      toast.success("Observation task added!");
    } catch (error) {
      toast.error("Failed to add task.");
    } finally {
      setTaskSubmitting(false);
    }
  };

  const handleReplyTask = async (appId, taskId) => {
    const replyText = replies[taskId];
    if (!replyText) return toast.warning("Please enter a reply.");
    try {
      const { data } = await replyToObservationTask(appId, taskId, { adopterReply: replyText });
      setApplications(applications.map(app => app._id === appId ? data : app));
      toast.success("Update submitted to owner!");
    } catch (error) {
      toast.error("Failed to submit update.");
    }
  };

  const handleReplyChange = (taskId, text) => {
    setReplies(prev => ({ ...prev, [taskId]: text }));
  };


  if (loading) return <div style={{ padding: "40px", textAlign: "center", fontSize: "18px", color: "#666" }}>Fetching applications...</div>;

  return (
    <div style={{ padding: "50px 20px", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ color: "#1e293b", fontSize: "2.5rem", margin: "0 0 10px 0" }}>
          {userInfo.role === "adopter" ? "My Applications 📝" : "Application Workflow 📋"}
        </h1>
        <p style={{ color: "#64748b", fontSize: "1.1rem", margin: 0 }}>
          Manage and track your pet adoption requests efficiently.
        </p>
      </div>

      {applications.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "50px", marginBottom: "15px" }}>📭</div>
          <h2 style={{ color: "#334155", margin: "0 0 10px 0" }}>No Applications Yet</h2>
          <p style={{ color: "#94a3b8" }}>{userInfo.role === "adopter" ? "You haven't applied for any pets yet. Go browse the feed!" : "You haven't received any adoption applications for your pets yet."}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "25px", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
          {applications.map(app => {
            const colors = getStatusColor(app.status);
            return (
              <div key={app._id} style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.06)", transition: "transform 0.2s", display: "flex", flexDirection: "column" }}>
                
                {/* Header Card */}
                <div style={{ background: colors.bg, padding: "20px", borderBottom: `3px solid ${colors.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin: 0, color: colors.text, fontSize: "1.2rem" }}>{app.pet?.name || "Unknown Pet"}</h3>
                  <span style={{ background: colors.text, color: "white", padding: "6px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>
                    {app.status}
                  </span>
                </div>

                {/* Body Content */}
                <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column", gap: "15px" }}>
                  
                  {/* View for Pet Parents */}
                  {userInfo.role !== "adopter" && app.adopter && (
                    <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <p style={{ margin: "0 0 8px 0", fontSize: "0.9rem", color: "#64748b" }}><strong style={{ color: "#334155" }}>👤 Applicant:</strong> {app.adopter.name}</p>
                      <p style={{ margin: "0 0 8px 0", fontSize: "0.9rem", color: "#64748b" }}><strong style={{ color: "#334155" }}>📞 Contact:</strong> {app.adopter.phone}</p>
                      <p style={{ margin: "0 0 8px 0", fontSize: "0.9rem", color: "#64748b" }}><strong style={{ color: "#334155" }}>📍 Location:</strong> {app.adopter.district}</p>
                      <div style={{ marginTop: "10px", padding: "10px", background: "white", borderRadius: "8px", fontStyle: "italic", color: "#475569", fontSize: "0.9rem" }}>
                        "{app.message}"
                      </div>
                    </div>
                  )}

                  {/* View for Adopters */}
                  {userInfo.role === "adopter" && (
                    <div style={{ color: "#475569", fontSize: "0.95rem" }}>
                      <p style={{ margin: "0 0 10px 0" }}>📅 <strong>Applied on:</strong> {new Date(app.createdAt).toLocaleDateString()}</p>
                      <div style={{ background: "#f1f5f9", padding: "12px", borderRadius: "8px", fontStyle: "italic" }}>
                        "{app.message}"
                      </div>
                    </div>
                  )}

                  {/* Interactive Status Changer for Pet Parents */}
                  {userInfo.role !== "adopter" && (
                    <div style={{ marginTop: "auto", paddingTop: "15px", borderTop: "1px solid #f1f5f9" }}>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>Update Status</label>
                      <select 
                        value={app.status} 
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.95rem", backgroundColor: "white", cursor: "pointer", fontWeight: "500", color: "#334155" }}
                      >
                        <option value="submitted">Submitted</option>
                        <option value="under review">Under Review</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  )}
                </div>
                {/* --- FR-15 OBSERVATION PERIOD UI --- */}
                {app.status === 'accepted' && (
                  <div style={{ background: "#e8f5e9", border: "1px solid #c8e6c9", borderRadius: "8px", padding: "15px", marginTop: "15px" }}>
                    <h4 style={{ color: "#2e7d32", margin: "0 0 15px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                      🔍 Observation Period Updates
                    </h4>

                    {/* Display existing tasks */}
                    {app.observationTasks && app.observationTasks.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "15px" }}>
                        {app.observationTasks.map((task) => (
                          <div key={task._id} style={{ background: "white", padding: "12px", borderRadius: "6px", borderLeft: task.isCompleted ? "4px solid #4caf50" : "4px solid #ff9800" }}>
                            <p style={{ margin: "0 0 5px 0", fontWeight: "bold", color: "#334155" }}>{task.taskDescription}</p>
                            <p style={{ margin: "0 0 10px 0", fontSize: "0.85rem", color: "#64748b" }}>
                              📅 Due: {new Date(task.dueDate).toLocaleDateString()}
                            </p>

                            {/* Adopter Reply Box */}
                            {userInfo.role === "adopter" && !task.isCompleted && (
                              <div style={{ display: "flex", gap: "10px" }}>
                                <input 
                                  type="text" 
                                  placeholder="e.g. Bath completed today!" 
                                  value={replies[task._id] || ""}
                                  onChange={(e) => handleReplyChange(task._id, e.target.value)}
                                  style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                                />
                                <button onClick={() => handleReplyTask(app._id, task._id)} style={{ background: "#2196f3", color: "white", border: "none", borderRadius: "4px", padding: "0 15px", cursor: "pointer" }}>
                                  Submit
                                </button>
                              </div>
                            )}

                            {/* Completed Reply Display */}
                            {task.isCompleted && (
                              <div style={{ background: "#f1f8e9", padding: "8px", borderRadius: "4px", fontSize: "0.9rem", color: "#33691e" }}>
                                <strong>Adopter Reply:</strong> {task.adopterReply}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: "0.9rem", color: "#666", fontStyle: "italic", marginBottom: "15px" }}>No tasks assigned yet.</p>
                    )}

                    {/* Parent: Set Updates Form */}
                    {userInfo.role !== "adopter" && (
                      <div style={{ display: "flex", gap: "10px", borderTop: "1px solid #c8e6c9", paddingTop: "15px" }}>
                        <input 
                          type="text" 
                          placeholder="New task (e.g. Bathe the cat)" 
                          value={newTask.description}
                          onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                          style={{ flex: 2, padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                        />
                        <input 
                          type="date" 
                          value={newTask.date}
                          onChange={(e) => setNewTask({...newTask, date: e.target.value})}
                          style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                        />
                        <button 
                          onClick={() => handleAddTask(app._id)}
                          disabled={taskSubmitting}
                          style={{ background: "#2e7d32", color: "white", border: "none", borderRadius: "4px", padding: "0 15px", cursor: "pointer" }}
                        >
                          Set Update
                        </button>
                      </div>
                    )}
                  </div>
                )}
                              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Applications;
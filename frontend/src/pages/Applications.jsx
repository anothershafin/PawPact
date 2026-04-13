import React, { useState, useEffect } from "react";
import { getApplications, updateAppStatus } from "../services/api";
import { toast } from "react-toastify";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const { data } = await getApplications();
        setApplications(data);
      } catch (error) {
        toast.error("Failed to load applications.");
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateAppStatus(id, newStatus);
      setApplications(applications.map(app => app._id === id ? { ...app, status: newStatus } : app));
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'accepted': return '#4caf50';
      case 'rejected': return '#f44336';
      case 'under review': return '#ff9800';
      default: return '#2196f3';
    }
  };

  if (loading) return <div style={{ padding: "20px", textAlign: "center" }}>Loading applications...</div>;

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}>
        {userInfo.role === "adopter" ? "My Applications 📝" : "Application Review Workflow 📋"}
      </h1>

      {applications.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666" }}>No applications found.</p>
      ) : (
        <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {applications.map(app => (
            <div key={app._id} style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.08)", borderTop: `5px solid ${getStatusColor(app.status)}` }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h3 style={{ margin: 0, color: "#333" }}>{app.pet?.name || "Unknown Pet"}</h3>
                <span style={{ background: getStatusColor(app.status), color: "white", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", textTransform: "capitalize" }}>
                  {app.status}
                </span>
              </div>

              {/* View for Pet Parents */}
              {userInfo.role !== "adopter" && app.adopter && (
                <div style={{ background: "#f9f9f9", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "14px" }}>
                  <p style={{ margin: "0 0 5px 0" }}><strong>Applicant:</strong> {app.adopter.name}</p>
                  <p style={{ margin: "0 0 5px 0" }}><strong>Contact:</strong> {app.adopter.phone}</p>
                  <p style={{ margin: 0 }}><strong>Message:</strong> "{app.message}"</p>
                </div>
              )}

              {/* View for Adopters */}
              {userInfo.role === "adopter" && (
                <div style={{ marginBottom: "15px", fontSize: "14px", color: "#666" }}>
                  <p>Applied on: {new Date(app.createdAt).toLocaleDateString()}</p>
                  <p>Message sent: "{app.message}"</p>
                </div>
              )}

              {/* Status Update Dropdown for Pet Parents */}
              {userInfo.role !== "adopter" && (
                <div style={{ marginTop: "15px", borderTop: "1px solid #eee", paddingTop: "15px" }}>
                  <label style={{ fontSize: "14px", fontWeight: "bold", marginRight: "10px" }}>Set Status:</label>
                  <select 
                    value={app.status} 
                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
                    style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc", outline: "none" }}
                  >
                    <option value="submitted">Submitted</option>
                    <option value="under review">Under Review</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;
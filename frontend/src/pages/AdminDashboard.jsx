import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import {
  adminGetAllUsers,
  adminDeleteUser,
  adminGetAllReports,
  adminUpdateReportStatus,
  adminDeleteReport,
  adminDeletePet,
} from "../services/api";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [tab, setTab] = useState("reports");
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userInfo || userInfo.role !== "admin") return;
    const fetchAll = async () => {
      try {
        const [u, r] = await Promise.all([adminGetAllUsers(), adminGetAllReports()]);
        setUsers(u.data);
        setReports(r.data);
      } catch (err) {
        toast.error("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [userInfo]);

  if (!userInfo || userInfo.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      await adminDeleteUser(id);
      setUsers(users.filter((u) => u._id !== id));
      toast.success("User deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleDeletePet = async (petId) => {
    if (!window.confirm("Delete this pet listing permanently?")) return;
    try {
      await adminDeletePet(petId);
      setReports(reports.filter((r) => r.reportedPet?._id !== petId));
      toast.success("Pet deleted");
    } catch (err) {
      toast.error("Failed to delete pet");
    }
  };

  const handleReportStatus = async (id, status) => {
    try {
      await adminUpdateReportStatus(id, status);
      setReports(reports.map((r) => (r._id === id ? { ...r, status } : r)));
      toast.success(`Report marked ${status}`);
    } catch (err) {
      toast.error("Failed to update report");
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm("Delete this report?")) return;
    try {
      await adminDeleteReport(id);
      setReports(reports.filter((r) => r._id !== id));
      toast.success("Report deleted");
    } catch (err) {
      toast.error("Failed to delete report");
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading admin dashboard...</div>;

  return (
    <div style={{ padding: "40px 20px", maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ color: "#1e293b", marginBottom: 8 }}>Admin Dashboard 🛡️</h1>
      <p style={{ color: "#64748b", marginBottom: 25 }}>Review reports, manage users, and remove harmful content.</p>

      <div style={{ display: "flex", gap: 10, marginBottom: 25, borderBottom: "2px solid #e2e8f0" }}>
        <button onClick={() => setTab("reports")} style={tabBtn(tab === "reports")}>Reports ({reports.length})</button>
        <button onClick={() => setTab("users")} style={tabBtn(tab === "users")}>Users ({users.length})</button>
      </div>

      {tab === "reports" && (
        <div style={{ display: "grid", gap: 15 }}>
          {reports.length === 0 ? (
            <p style={{ color: "#64748b" }}>No reports yet.</p>
          ) : (
            reports.map((r) => (
              <div key={r._id} style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
                  <div>
                    <span style={badgeStyle(r.status)}>{r.status}</span>
                    <strong style={{ marginLeft: 10 }}>{r.reportType.toUpperCase()} REPORT</strong>
                  </div>
                  <small style={{ color: "#94a3b8" }}>{new Date(r.createdAt).toLocaleString()}</small>
                </div>
                <p><strong>Reason:</strong> {r.reason}</p>
                {r.details && <p><strong>Details:</strong> {r.details}</p>}
                <p><strong>Reported by:</strong> {r.reportedBy?.name || "Unknown"} ({r.reportedBy?.email})</p>
                {r.reportType === "user" && r.reportedUser && (
                  <p><strong>Target user:</strong> {r.reportedUser.name} ({r.reportedUser.email})</p>
                )}
                {r.reportType === "pet" && r.reportedPet && (
                  <p><strong>Target pet:</strong> {r.reportedPet.name} ({r.reportedPet.breed})</p>
                )}
                {r.evidence && (
                  <p><strong>Evidence:</strong> <a href={r.evidence} target="_blank" rel="noreferrer">View</a></p>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  <select value={r.status} onChange={(e) => handleReportStatus(r._id, e.target.value)} style={selectStyle}>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  {r.reportType === "pet" && r.reportedPet && (
                    <button onClick={() => handleDeletePet(r.reportedPet._id)} style={dangerBtn}>Delete Pet</button>
                  )}
                  {r.reportType === "user" && r.reportedUser && (
                    <button onClick={() => handleDeleteUser(r.reportedUser._id)} style={dangerBtn}>Delete User</button>
                  )}
                  <button onClick={() => handleDeleteReport(r._id)} style={ghostBtn}>Dismiss Report</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "users" && (
        <div style={{ display: "grid", gap: 10 }}>
          {users.map((u) => (
            <div key={u._id} style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{u.name}</strong> <span style={{ color: "#64748b" }}>({u.role})</span>
                <div style={{ fontSize: 13, color: "#64748b" }}>{u.email} • {u.phone} • {u.district}</div>
              </div>
              {u.role !== "admin" && (
                <button onClick={() => handleDeleteUser(u._id)} style={dangerBtn}>Delete</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const tabBtn = (active) => ({
  padding: "10px 20px",
  background: active ? "#2196f3" : "transparent",
  color: active ? "white" : "#64748b",
  border: "none",
  borderRadius: "8px 8px 0 0",
  cursor: "pointer",
  fontWeight: "bold",
});

const cardStyle = { background: "white", padding: 18, borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" };
const dangerBtn = { padding: "8px 14px", background: "#ef4444", color: "white", border: "none", borderRadius: 6, cursor: "pointer" };
const ghostBtn = { padding: "8px 14px", background: "transparent", color: "#64748b", border: "1px solid #cbd5e1", borderRadius: 6, cursor: "pointer" };
const selectStyle = { padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1" };
const badgeStyle = (status) => ({
  padding: "4px 10px",
  borderRadius: 12,
  background: status === "resolved" ? "#dcfce7" : status === "reviewed" ? "#fef3c7" : "#fee2e2",
  color: status === "resolved" ? "#166534" : status === "reviewed" ? "#92400e" : "#991b1b",
  fontSize: 12,
  fontWeight: "bold",
});

export default AdminDashboard;
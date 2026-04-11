import React, { useEffect, useState } from "react";
import { createReport, getMyReports } from "../services/api";
import { toastError, toastSuccess } from "../utils/toast";

const Reports = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [items, setItems] = useState([]);
  const [targetType, setTargetType] = useState("pet");
  const [targetId, setTargetId] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");

  const refresh = async () => {
    const { data } = await getMyReports();
    setItems(data);
  };

  useEffect(() => {
    if (!userInfo) return;
    refresh().catch(console.error);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await createReport({ targetType, targetId, reason });
      setTargetId("");
      setReason("");
      await refresh();
      toastSuccess("Report submitted.");
    } catch (err) {
      toastError(err.response?.data?.message || "Failed to submit report");
    }
  };

  if (!userInfo) return <div style={{ padding: 24 }}>Please log in.</div>;

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0 }}>Reports</h2>
      {msg ? <div style={{ marginBottom: 10 }}>{msg}</div> : null}

      <form onSubmit={submit} style={{ display: "grid", gap: 10, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
          <select className="auth-input auth-select" value={targetType} onChange={(e) => setTargetType(e.target.value)}>
            <option value="pet">Pet</option>
            <option value="user">User</option>
            <option value="contract">Contract</option>
          </select>
          <input className="auth-input" placeholder="Target ID" value={targetId} onChange={(e) => setTargetId(e.target.value)} required />
        </div>
        <textarea className="auth-input" style={{ minHeight: 90 }} placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} required />
        <button className="auth-btn" type="submit">
          Submit report
        </button>
      </form>

      <h3 style={{ marginTop: 0 }}>My reports</h3>
      {items.length === 0 ? (
        <div style={{ opacity: 0.7 }}>No reports.</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((r) => (
            <div key={r._id} style={{ border: "1px solid #e6e6e6", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {r.targetType} — {r.targetId}
                  </div>
                  <div style={{ opacity: 0.85, marginTop: 6 }}>{r.reason}</div>
                </div>
                <div style={{ fontWeight: 700, textTransform: "capitalize" }}>{r.status}</div>
              </div>
              {r.adminNotes ? <div style={{ marginTop: 8, opacity: 0.75 }}>Admin: {r.adminNotes}</div> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;


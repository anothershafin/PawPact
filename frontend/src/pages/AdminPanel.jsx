import React, { useEffect, useState } from "react";
import { toastError, toastSuccess } from "../utils/toast";
import {
  adminListPets,
  adminListReports,
  adminListUsers,
  adminSetPetStatus,
  adminUpdateReport,
  adminVerifyUser,
} from "../services/api";

const AdminPanel = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [tab, setTab] = useState("reports");
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [pets, setPets] = useState([]);

  const refresh = async () => {
    try {
      const [r, u, p] = await Promise.all([
        adminListReports().then((x) => x.data).catch(() => []),
        adminListUsers().then((x) => x.data).catch(() => []),
        adminListPets().then((x) => x.data).catch(() => []),
      ]);
      setReports(r);
      setUsers(u);
      setPets(p);
      toastSuccess("Refreshed.");
    } catch (e) {
      toastError(e.response?.data?.message || "Failed to refresh");
    }
  };

  useEffect(() => {
    if (userInfo?.role !== "admin") return;
    refresh().catch(console.error);
  }, []);

  if (!userInfo) return <div style={{ padding: 24 }}>Please log in.</div>;
  if (userInfo.role !== "admin") return <div style={{ padding: 24 }}>Forbidden.</div>;

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0 }}>Admin Panel</h2>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <button className="auth-btn" type="button" onClick={() => setTab("reports")}>
          Reports
        </button>
        <button className="auth-btn" type="button" onClick={() => setTab("users")}>
          Users
        </button>
        <button className="auth-btn" type="button" onClick={() => setTab("pets")}>
          Pets
        </button>
        <button className="auth-btn" type="button" onClick={refresh}>
          Refresh
        </button>
      </div>

      {tab === "reports" && (
        <div style={{ display: "grid", gap: 10 }}>
          {reports.map((r) => (
            <div key={r._id} style={{ border: "1px solid #e6e6e6", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {r.targetType}: {r.targetId}
                  </div>
                  <div style={{ opacity: 0.85, marginTop: 6 }}>{r.reason}</div>
                  <div style={{ opacity: 0.75, fontSize: 12, marginTop: 6 }}>
                    Reporter: {r.reporter?.name} ({r.reporter?.email})
                  </div>
                </div>
                <div style={{ fontWeight: 700 }}>{r.status}</div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                {["open", "triaged", "resolved", "rejected"].map((s) => (
                  <button
                    key={s}
                    className="auth-btn"
                    type="button"
                    onClick={async () => {
                      try {
                        await adminUpdateReport(r._id, { status: s });
                        toastSuccess("Report updated.");
                        await refresh();
                      } catch (e) {
                        toastError(e.response?.data?.message || "Failed to update report");
                      }
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div style={{ display: "grid", gap: 10 }}>
          {users.map((u) => (
            <div key={u._id} style={{ border: "1px solid #e6e6e6", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {u.name} ({u.role})
                  </div>
                  <div style={{ opacity: 0.75, fontSize: 12 }}>{u.email}</div>
                </div>
                <div style={{ fontWeight: 700 }}>{u.isVerified ? "Verified" : "Not verified"}</div>
              </div>
              <div style={{ marginTop: 10 }}>
                <button
                  className="auth-btn"
                  type="button"
                  disabled={u.isVerified}
                  onClick={async () => {
                    try {
                      await adminVerifyUser(u._id);
                      toastSuccess("User verified.");
                      await refresh();
                    } catch (e) {
                      toastError(e.response?.data?.message || "Failed to verify user");
                    }
                  }}
                >
                  Verify
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "pets" && (
        <div style={{ display: "grid", gap: 10 }}>
          {pets.map((p) => (
            <div key={p._id} style={{ border: "1px solid #e6e6e6", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontWeight: 700 }}>
                  {p.name} ({p.breed})
                </div>
                <div style={{ fontWeight: 700 }}>{p.adoptionStatus}</div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                {["available", "paused", "withdrawn"].map((s) => (
                  <button
                    key={s}
                    className="auth-btn"
                    type="button"
                    onClick={async () => {
                      try {
                        await adminSetPetStatus(p._id, s);
                        toastSuccess("Pet status updated.");
                        await refresh();
                      } catch (e) {
                        toastError(e.response?.data?.message || "Failed to update pet");
                      }
                    }}
                  >
                    Set {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;


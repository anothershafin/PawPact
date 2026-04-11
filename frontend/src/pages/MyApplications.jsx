import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyApplications, withdrawApplication } from "../services/api";
import { toastError, toastSuccess } from "../utils/toast";

const MyApplications = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const { data } = await getMyApplications();
    setApps(data);
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await refresh();
      } catch (e) {
        toastError(e.response?.data?.message || "Failed to load applications");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const withdraw = async (id) => {
    if (!window.confirm("Withdraw this application?")) return;
    try {
      await withdrawApplication(id);
      await refresh();
      toastSuccess("Application withdrawn.");
    } catch (e) {
      toastError(e.response?.data?.message || "Failed to withdraw application");
    }
  };

  if (!userInfo || userInfo.role !== "adopter") {
    return (
      <div style={{ padding: 24 }}>
        <h2>My Applications</h2>
        <p>This page is for adopters.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>My Applications</h2>
        <Link to="/discover">Discover</Link>
      </div>

      {loading ? (
        <p style={{ marginTop: 16 }}>Loading...</p>
      ) : apps.length === 0 ? (
        <p style={{ marginTop: 16 }}>No applications yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {apps.map((a) => (
            <div key={a._id} style={{ border: "1px solid #e6e6e6", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <Link to={`/pet/${a.pet?._id}`} style={{ fontWeight: 700 }}>
                    {a.pet?.name} ({a.pet?.breed})
                  </Link>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>{a.pet ? `${a.pet.upazilla}, ${a.pet.district}` : ""}</div>
                </div>
                <div style={{ textTransform: "capitalize", fontWeight: 700 }}>{a.status?.replace("_", " ")}</div>
              </div>
              {a.message ? <div style={{ marginTop: 8, opacity: 0.85 }}>Message: {a.message}</div> : null}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button className="auth-btn" type="button" disabled={a.status === "withdrawn"} onClick={() => withdraw(a._id)}>
                  Withdraw
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;


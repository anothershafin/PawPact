import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApplicationsForMyPets, updateApplicationStatus } from "../services/api";
import { toastError, toastSuccess } from "../utils/toast";

const ReviewApplications = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const { data } = await getApplicationsForMyPets();
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

  const setStatus = async (id, status) => {
    try {
      await updateApplicationStatus(id, status);
      await refresh();
      toastSuccess("Status updated.");
    } catch (e) {
      toastError(e.response?.data?.message || "Failed to update status");
    }
  };

  if (!userInfo || userInfo.role !== "petparent") {
    return (
      <div style={{ padding: 24 }}>
        <h2>Applications</h2>
        <p>This page is for pet parents.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Applications for My Pets</h2>
        <Link to="/pets">My Pets</Link>
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
                  <div style={{ fontSize: 12, opacity: 0.75 }}>
                    Adopter: {a.adopter?.name} ({a.adopter?.email})
                  </div>
                </div>
                <div style={{ textTransform: "capitalize", fontWeight: 700 }}>{a.status?.replace("_", " ")}</div>
              </div>

              {a.message ? <div style={{ marginTop: 8, opacity: 0.85 }}>Message: {a.message}</div> : null}

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
                <button className="auth-btn" type="button" onClick={() => setStatus(a._id, "submitted")}>
                  Submitted
                </button>
                <button className="auth-btn" type="button" onClick={() => setStatus(a._id, "under_review")}>
                  Under review
                </button>
                <button className="auth-btn" type="button" onClick={() => setStatus(a._id, "accepted")}>
                  Accept
                </button>
                <button className="auth-btn" type="button" onClick={() => setStatus(a._id, "rejected")}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewApplications;


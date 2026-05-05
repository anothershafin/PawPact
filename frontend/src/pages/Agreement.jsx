import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApplicationById, confirmAgreement } from "../services/api";
import { toast } from "react-toastify";

const Agreement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getApplicationById(id);
        setApp(data);
      } catch (err) {
        toast.error("Failed to load agreement");
        navigate("/applications");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading agreement...</div>;
  if (!app) return null;

  const isAdopter = app.adopter._id === userInfo._id;
  const isParent = app.petParent._id === userInfo._id;
  const myConfirmed = isAdopter ? app.agreement?.adopterConfirmed : app.agreement?.parentConfirmed;
  const otherConfirmed = isAdopter ? app.agreement?.parentConfirmed : app.agreement?.adopterConfirmed;
  const bothConfirmed = app.agreement?.adopterConfirmed && app.agreement?.parentConfirmed;

  const handleConfirm = async () => {
    if (!checked) return toast.error("Please tick the box to agree first");
    try {
      setConfirming(true);
      const { data } = await confirmAgreement(id);
      setApp(data);
      toast.success("Agreement confirmed!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to confirm agreement");
    } finally {
      setConfirming(false);
    }
  };

  const myName = isAdopter ? app.adopter.name : app.petParent.name;

  return (
    <div style={{ padding: "40px 20px", maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ color: "#1e293b" }}>Adoption Agreement 📜</h1>
      <p style={{ color: "#64748b", marginBottom: 20 }}>
        For pet <strong>{app.pet.name}</strong> ({app.pet.breed})
      </p>

      <div style={{ background: "white", padding: 30, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", marginBottom: 25 }}>
        <h2 style={{ color: "#334155", marginTop: 0 }}>The Agreement</h2>

        {isParent && (
          <div style={{ marginBottom: 20, padding: 15, background: "#f8fafc", borderRadius: 8, lineHeight: 1.7 }}>
            I, <strong>{myName}</strong>, am the pet parent of <strong>{app.pet.name}</strong>. I have reviewed the
            adopter <strong>{app.adopter.name}</strong> and I am willing to give my pet for adoption to them. I confirm
            that all information about my pet is accurate and I will support the adopter through the transition.
          </div>
        )}
        {isAdopter && (
          <div style={{ marginBottom: 20, padding: 15, background: "#f8fafc", borderRadius: 8, lineHeight: 1.7 }}>
            I, <strong>{myName}</strong>, am the adopter of <strong>{app.pet.name}</strong>. I am willing to follow all
            the requirements set by the pet parent <strong>{app.petParent.name}</strong>, provide a safe and loving home,
            cover the pet's care needs, and respect the 14-day observation period.
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: myConfirmed ? "default" : "pointer" }}>
            <input
              type="checkbox"
              checked={myConfirmed || checked}
              disabled={myConfirmed}
              onChange={(e) => setChecked(e.target.checked)}
              style={{ width: 20, height: 20 }}
            />
            <span>I have read and agree to the terms above.</span>
          </label>
        </div>

        {!myConfirmed ? (
          <button onClick={handleConfirm} disabled={confirming || !checked}
            style={{ padding: "12px 24px", background: checked ? "#2ecc71" : "#cbd5e1", color: "white", border: "none", borderRadius: 8, fontSize: 16, fontWeight: "bold", cursor: checked ? "pointer" : "not-allowed" }}>
            {confirming ? "Confirming..." : "Confirm Agreement"}
          </button>
        ) : (
          <div style={{ padding: 12, background: "#dcfce7", color: "#166534", borderRadius: 8, fontWeight: "bold" }}>
            ✅ You have confirmed this agreement.
          </div>
        )}
      </div>

      <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <h3 style={{ color: "#334155", marginTop: 0 }}>Confirmation Status</h3>
        <p style={{ margin: "8px 0" }}>
          {app.agreement?.adopterConfirmed ? "✅" : "⏳"} Adopter ({app.adopter.name}) {app.agreement?.adopterConfirmed ? "confirmed" : "pending"}
        </p>
        <p style={{ margin: "8px 0" }}>
          {app.agreement?.parentConfirmed ? "✅" : "⏳"} Pet Parent ({app.petParent.name}) {app.agreement?.parentConfirmed ? "confirmed" : "pending"}
        </p>
        {bothConfirmed && (
          <div style={{ marginTop: 15, padding: 15, background: "#dcfce7", color: "#166534", borderRadius: 8, fontWeight: "bold", textAlign: "center" }}>
            🎉 Both parties have confirmed! The adoption is now mutually agreed upon.
          </div>
        )}
        {myConfirmed && !otherConfirmed && (
          <p style={{ marginTop: 15, color: "#92400e" }}>
            Waiting for the other party to confirm.
          </p>
        )}
      </div>

      <button onClick={() => navigate("/applications")} style={{ marginTop: 20, padding: "10px 20px", background: "transparent", border: "1px solid #cbd5e1", borderRadius: 8, cursor: "pointer" }}>
        ← Back to Applications
      </button>
    </div>
  );
};

export default Agreement;
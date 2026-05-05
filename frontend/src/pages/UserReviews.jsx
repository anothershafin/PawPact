import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getReviewsForUser, getUserById } from "../services/api";
import { toast } from "react-toastify";

const Star = ({ filled }) => (
  <span style={{ color: filled ? "#fbbf24" : "#d1d5db", fontSize: 22 }}>★</span>
);

const UserReviews = () => {
  const { userId: paramId } = useParams();
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const targetId = paramId || userInfo?._id;
  const isOwnPage = !paramId || paramId === userInfo?._id;

  const [data, setData] = useState({ reviews: [], averageRating: 0, totalReviews: 0 });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!targetId) return;
    const fetchData = async () => {
      try {
        const [revRes, profRes] = await Promise.all([
          getReviewsForUser(targetId),
          getUserById(targetId),
        ]);
        setData(revRes.data);
        setProfile(profRes.data);
      } catch (err) {
        toast.error("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [targetId]);

  if (!userInfo) return <div style={{ padding: 40, textAlign: "center" }}>Please log in.</div>;
  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading reviews...</div>;

  return (
    <div style={{ padding: "40px 20px", maxWidth: 900, margin: "0 auto", position: "relative" }}>
      <button onClick={() => navigate("/add-review")} style={{
        position: "fixed", bottom: 30, right: 30,
        background: "#2ecc71", color: "white", border: "none",
        padding: "14px 22px", borderRadius: 30, fontSize: 16, fontWeight: "bold",
        cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", zIndex: 100,
      }}>
        + Add Review
      </button>

      <h1 style={{ color: "#1e293b" }}>
        {isOwnPage ? "Reviews & Ratings" : `Reviews for ${profile?.name || "User"}`} ⭐
      </h1>

      <div style={{ background: "white", padding: 25, borderRadius: 12, marginBottom: 30, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontSize: 48, fontWeight: "bold", color: "#1e293b" }}>
            {data.averageRating.toFixed(1)}
          </div>
          <div>
            <div>{[1, 2, 3, 4, 5].map((i) => <Star key={i} filled={i <= Math.round(data.averageRating)} />)}</div>
            <div style={{ color: "#64748b", marginTop: 4 }}>
              Based on {data.totalReviews} review{data.totalReviews === 1 ? "" : "s"}
            </div>
          </div>
        </div>
      </div>

      <h2 style={{ color: "#334155" }}>All Reviews</h2>
      {data.reviews.length === 0 ? (
        <p style={{ color: "#94a3b8", padding: 20 }}>No reviews yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 15 }}>
          {data.reviews.map((r) => (
            <div key={r._id} style={{ background: "white", padding: 18, borderRadius: 10, boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <strong>{r.reviewer?.name || "Anonymous"}</strong>
                <small style={{ color: "#94a3b8" }}>{new Date(r.createdAt).toLocaleDateString()}</small>
              </div>
              <div style={{ marginBottom: 8 }}>
                {[1, 2, 3, 4, 5].map((i) => <Star key={i} filled={i <= r.rating} />)}
              </div>
              {r.comment && <p style={{ margin: 0, color: "#475569" }}>{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {!isOwnPage && (
        <Link to="/view-profile" style={{ display: "inline-block", marginTop: 20, color: "#2196f3" }}>
          ← Back to your profile
        </Link>
      )}
    </div>
  );
};

export default UserReviews;
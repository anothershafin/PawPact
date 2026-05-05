import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchUsersForReview, createReview } from "../services/api";
import { toast } from "react-toastify";

const AddReview = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSearch = async (value) => {
    setSearchTerm(value);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    try {
      const { data } = await searchUsersForReview(value);
      setResults(data);
    } catch (err) {
      // ignore
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return toast.error("Please select a user to review");
    if (rating < 1) return toast.error("Please select a rating");

    try {
      setSubmitting(true);
      await createReview({ reviewedUser: selected._id, rating, comment });
      toast.success("Review submitted!");
      navigate(`/reviews/${selected._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ color: "#1e293b" }}>Add a Review ✍️</h1>
      <p style={{ color: "#64748b", marginBottom: 25 }}>Search for a user and rate them out of 5 stars.</p>

      <form onSubmit={handleSubmit} style={{ background: "white", padding: 25, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: 8 }}>Search user by name</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Type at least 2 characters..."
          style={{ width: "100%", padding: 12, border: "1px solid #cbd5e1", borderRadius: 8, marginBottom: 10, boxSizing: "border-box" }}
          disabled={!!selected}
        />

        {!selected && results.length > 0 && (
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, marginBottom: 15, maxHeight: 250, overflowY: "auto" }}>
            {results.map((u) => (
              <div key={u._id}
                onClick={() => { setSelected(u); setResults([]); setSearchTerm(u.name); }}
                style={{ padding: 12, cursor: "pointer", borderBottom: "1px solid #f1f5f9" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={(e) => e.currentTarget.style.background = "white"}>
                <strong>{u.name}</strong> <span style={{ color: "#64748b", fontSize: 13 }}>({u.role})</span>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{u.email}</div>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div style={{ background: "#e0f2fe", padding: 12, borderRadius: 8, marginBottom: 15, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Reviewing: <strong>{selected.name}</strong> ({selected.role})</span>
            <button type="button" onClick={() => { setSelected(null); setSearchTerm(""); }}
              style={{ background: "transparent", border: "none", color: "#2196f3", cursor: "pointer" }}>Change</button>
          </div>
        )}

        <label style={{ display: "block", fontWeight: "bold", marginBottom: 8 }}>Your rating</label>
        <div style={{ marginBottom: 15 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              style={{ fontSize: 36, cursor: "pointer", color: (hoverRating || rating) >= star ? "#fbbf24" : "#d1d5db" }}>★</span>
          ))}
          <span style={{ marginLeft: 10, color: "#64748b" }}>{rating > 0 ? `${rating}/5` : "Click a star"}</span>
        </div>

        <label style={{ display: "block", fontWeight: "bold", marginBottom: 8 }}>Comment (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="4"
          placeholder="Share your experience..."
          style={{ width: "100%", padding: 12, border: "1px solid #cbd5e1", borderRadius: 8, marginBottom: 20, boxSizing: "border-box", resize: "vertical" }}
        />

        <button type="submit" disabled={submitting}
          style={{ width: "100%", padding: 14, background: "#2ecc71", color: "white", border: "none", borderRadius: 8, fontSize: 16, fontWeight: "bold", cursor: "pointer" }}>
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
};

export default AddReview;
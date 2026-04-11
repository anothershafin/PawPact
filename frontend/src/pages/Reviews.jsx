import React, { useEffect, useState } from "react";
import { createReview, getMyContracts } from "../services/api";
import { toastError, toastSuccess } from "../utils/toast";

const Reviews = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [contracts, setContracts] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!userInfo) return;
    getMyContracts()
      .then((r) => setContracts(r.data))
      .catch(console.error);
  }, [userInfo]);

  const review = async (contract) => {
    setMsg("");
    const toUserId = window.prompt("Enter the user ID to review (other party):");
    const rating = window.prompt("Rating 1-5:");
    const text = window.prompt("Optional review text:");
    if (!toUserId || !rating) return;
    try {
      await createReview({ contractId: contract._id, toUserId, rating: Number(rating), text: text || "" });
      toastSuccess("Review submitted.");
      setMsg("Review submitted.");
    } catch (e) {
      toastError(e.response?.data?.message || "Failed to submit review");
    }
  };

  if (!userInfo) return <div style={{ padding: 24 }}>Please log in.</div>;

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0 }}>Reviews</h2>
      {msg ? <div style={{ marginBottom: 10 }}>{msg}</div> : null}
      <p style={{ opacity: 0.75 }}>
        After a contract is <strong>closed adopted</strong>, you can submit a review.
      </p>
      <div style={{ display: "grid", gap: 10 }}>
        {contracts.map((c) => (
          <div key={c._id} style={{ border: "1px solid #e6e6e6", borderRadius: 12, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontWeight: 700 }}>
                {c.pet?.name} ({c.pet?.breed})
              </div>
              <div style={{ fontWeight: 700 }}>{c.status}</div>
            </div>
            <div style={{ marginTop: 10 }}>
              <button className="auth-btn" type="button" disabled={c.status !== "closed_adopted"} onClick={() => review(c)}>
                Write review
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;


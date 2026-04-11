import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyContracts } from "../services/api";

const Contracts = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const { data } = await getMyContracts();
        setItems(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (!userInfo) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Contracts</h2>
        <p>Please log in.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0 }}>Observation Contracts</h2>
      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p>No contracts yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((c) => (
            <div key={c._id} style={{ border: "1px solid #e6e6e6", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <Link to={`/contracts/${c._id}`} style={{ fontWeight: 700 }}>
                    {c.pet?.name} ({c.pet?.breed})
                  </Link>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>
                    {new Date(c.startDate).toLocaleDateString()} → {new Date(c.endDate).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ fontWeight: 700, textTransform: "capitalize" }}>{c.status?.replace("_", " ")}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Contracts;


import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPetById } from "../services/api";
import { vaccinationShortLabel } from "../utils/vaccinationDisplay";

const getCompareIds = () => {
  try {
    const ids = JSON.parse(localStorage.getItem("comparePetIds") || "[]");
    return Array.isArray(ids) ? ids.slice(0, 3) : [];
  } catch {
    return [];
  }
};

const ComparePets = () => {
  const [ids, setIds] = useState(getCompareIds());
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = useMemo(() => pets.filter(Boolean), [pets]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await Promise.all(ids.map((id) => getPetById(id).then((r) => r.data).catch(() => null)));
        setPets(res);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [ids]);

  const remove = (petId) => {
    const next = ids.filter((i) => i !== petId);
    localStorage.setItem("comparePetIds", JSON.stringify(next));
    setIds(next);
  };

  const clear = () => {
    localStorage.removeItem("comparePetIds");
    setIds([]);
  };

  const rows = [
    { key: "breed", label: "Breed" },
    { key: "age", label: "Age" },
    { key: "district", label: "District" },
    { key: "upazilla", label: "Upazilla" },
    { key: "vaccinationStatus", label: "Vaccinated", map: (v) => vaccinationShortLabel(v) },
    { key: "pottyTrained", label: "Potty Trained", map: (v) => (v ? "Yes" : "No") },
    { key: "adoptionStatus", label: "Adoption Status" },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Compare Pets</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/discover">Discover</Link>
          <button className="auth-btn" type="button" onClick={clear}>
            Clear
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ marginTop: 16 }}>Loading...</p>
      ) : ids.length === 0 ? (
        <p style={{ marginTop: 16 }}>
          No pets selected for comparison. Go to <Link to="/discover">Discover</Link> and add up to 3 pets.
        </p>
      ) : (
        <div style={{ overflowX: "auto", marginTop: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #e6e6e6" }}>Attribute</th>
                {columns.map((pet) => (
                  <th key={pet._id} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #e6e6e6" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                      <Link to={`/pet/${pet._id}`} style={{ fontWeight: 700 }}>
                        {pet.name}
                      </Link>
                      <button className="auth-btn" type="button" onClick={() => remove(pet._id)}>
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0", fontWeight: 700 }}>{row.label}</td>
                  {columns.map((pet) => (
                    <td key={pet._id + row.key} style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                      {row.map ? row.map(pet[row.key]) : String(pet[row.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0", fontWeight: 700 }}>Requirements</td>
                {columns.map((pet) => (
                  <td key={pet._id + "req"} style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                    {pet.requirements && pet.requirements.length ? (
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {pet.requirements.map((r, idx) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    ) : (
                      <span style={{ opacity: 0.7 }}>None</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ComparePets;


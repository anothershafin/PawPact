import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listPets } from "../services/api";
import "../styles/Pets.css";
import { vaccinationShortLabel } from "../utils/vaccinationDisplay";

const DiscoverPets = () => {
  const [q, setQ] = useState("");
  const [district, setDistrict] = useState("");
  const [upazilla, setUpazilla] = useState("");
  const [breed, setBreed] = useState("");
  const [vaccinationStatus, setVaccinationStatus] = useState("");
  const [page, setPage] = useState(1);

  const [data, setData] = useState({ items: [], total: 0, limit: 12, page: 1 });
  const [loading, setLoading] = useState(true);

  const params = useMemo(
    () => ({
      q: q || undefined,
      district: district || undefined,
      upazilla: upazilla || undefined,
      breed: breed || undefined,
      vaccinationStatus: vaccinationStatus || undefined,
      page,
      limit: 12,
      adoptionStatus: "available",
    }),
    [q, district, upazilla, breed, vaccinationStatus, page]
  );

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await listPets(params);
        setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [params]);

  const totalPages = Math.max(1, Math.ceil((data.total || 0) / (data.limit || 12)));

  return (
    <div className="pets-container">
      <div className="pets-header" style={{ justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>Discover Pets</h2>
        <Link to="/compare" className="pets-add-btn">
          Compare
        </Link>
      </div>

      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <input className="auth-input" placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
        <input className="auth-input" placeholder="District" value={district} onChange={(e) => setDistrict(e.target.value)} />
        <input className="auth-input" placeholder="Upazilla" value={upazilla} onChange={(e) => setUpazilla(e.target.value)} />
        <input className="auth-input" placeholder="Breed" value={breed} onChange={(e) => setBreed(e.target.value)} />
        <input
          className="auth-input"
          placeholder="Vaccination Status"
          value={vaccinationStatus}
          onChange={(e) => setVaccinationStatus(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="pets-loading">Loading pets...</p>
      ) : data.items.length === 0 ? (
        <p className="pets-empty">No pets found.</p>
      ) : (
        <div className="pets-grid" style={{ marginTop: 14 }}>
          {data.items.map((pet) => (
            <div key={pet._id} className="pet-card-wrapper">
              <Link to={`/pet/${pet._id}`} className="pet-card">
                <div className="pet-card-image">
                  {pet.profilePhoto ? (
                    <img src={pet.profilePhoto} alt={pet.name} className="pet-card-img" />
                  ) : (
                    <div className="pet-card-no-image"></div>
                  )}
                </div>
                <div className="pet-card-info">
                  <h3 className="pet-card-name">
                    {pet.name} ({pet.breed})
                  </h3>
                  <p className="pet-card-detail">{pet.age}</p>
                  <p className="pet-card-detail">
                    {pet.upazilla}, {pet.district}
                  </p>
                  <span className="pet-card-vaccine">Vaccinated: {vaccinationShortLabel(pet.vaccinationStatus)}</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }}>
        <button className="pets-add-btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Prev
        </button>
        <div style={{ alignSelf: "center" }}>
          Page {data.page} / {totalPages}
        </div>
        <button className="pets-add-btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
};

export default DiscoverPets;


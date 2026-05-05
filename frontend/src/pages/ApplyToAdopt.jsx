import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPetById, submitApplication } from "../services/api"; // Ensure you have submitApplication in api.js
import { toast } from "react-toastify";
import "../styles/Auth.css";

const ApplyToAdopt = () => {
  const { id } = useParams(); // pet ID
  const navigate = useNavigate();
  
  const [pet, setPet] = useState(null);
  const [checkedRequirements, setCheckedRequirements] = useState([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const { data } = await getPetById(id);
        setPet(data);
      } catch (error) {
        toast.error("Failed to load pet details.");
      }
    };
    fetchPet();
  }, [id]);

  const handleCheckboxChange = (req) => {
    if (checkedRequirements.includes(req)) {
      setCheckedRequirements(checkedRequirements.filter(r => r !== req));
    } else {
      setCheckedRequirements([...checkedRequirements, req]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Send the application to your backend
      await submitApplication({ petId: id, message });
      toast.success("Application submitted successfully!");
      navigate("/applications"); // Redirect back to their applications list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!pet) return <div className="auth-container">Loading...</div>;

  // Determine if the user has checked every box
  const allRequirementsMet = pet.requirements.length === 0 || checkedRequirements.length === pet.requirements.length;

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: "600px" }}>
        <h2 className="auth-title">Apply to Adopt {pet.name}</h2>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Requirements Checklist Block */}
          {pet.requirements.length > 0 && (
            <div className="auth-field" style={{ background: "#f8fafc", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <label className="auth-label" style={{ color: "#c62828" }}>
                Mandatory Requirements (Must check all)
              </label>
              
              {pet.requirements.map((req, index) => (
                <div key={index} style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                  <input
                    type="checkbox"
                    id={`req-${index}`}
                    checked={checkedRequirements.includes(req)}
                    onChange={() => handleCheckboxChange(req)}
                    style={{ width: "20px", height: "20px", cursor: "pointer" }}
                  />
                  <label htmlFor={`req-${index}`} style={{ cursor: "pointer", fontSize: "0.95rem" }}>
                    {req}
                  </label>
                </div>
              ))}
            </div>
          )}

          <div className="auth-field" style={{ marginTop: "20px" }}>
            <label className="auth-label">Message to Owner (Optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="auth-input"
              rows="4"
              placeholder="Tell the owner why you'd be a great fit!"
            />
          </div>

          <button 
            type="submit" 
            className="auth-btn" 
            disabled={!allRequirementsMet || submitting}
            style={{ 
              backgroundColor: allRequirementsMet ? "#2d6a4f" : "#94a3b8",
              cursor: allRequirementsMet ? "pointer" : "not-allowed",
              marginTop: "20px"
            }}
          >
            {submitting ? "Sending..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyToAdopt;
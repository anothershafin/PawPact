import React, { useState } from "react";
import { updateLifestyleAnswers } from "../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Questionnaire = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
  
  const [answers, setAnswers] = useState(userInfo.lifestyleAnswers || {
    homeVibe: "", weekendActivity: "", timeAvailable: "", 
    experience: "", housing: "", budget: ""
  });

  const handleChange = (e) => setAnswers({ ...answers, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await updateLifestyleAnswers(answers);
      const updatedUser = { ...userInfo, lifestyleAnswers: data };
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      toast.success("Questionnaire saved! Our AI algorithm has updated your match scores. ✨");
      navigate("/pets");
    } catch (error) {
      toast.error("Failed to save questionnaire.");
    }
  };

  const selectStyle = { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ced4da", fontSize: "15px", marginTop: "8px", backgroundColor: "#f8f9fa" };
  const labelStyle = { display: "block", fontWeight: "600", color: "#2c3e50" };

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", padding: "40px", background: "white", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
      <h1 style={{ textAlign: "center", color: "#1a252f", marginBottom: "10px" }}>Adopter Compatibility Quiz 🐾</h1>
      <p style={{ textAlign: "center", color: "#7f8c8d", marginBottom: "35px", fontSize: "16px" }}>
        Answer these 6 quick questions. Our algorithm will compare your lifestyle against the needs of every pet to calculate your unique Match Score!
      </p>
      
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
        
        <div>
          <label style={labelStyle}>1. What best describes your housing situation?</label>
          <select name="housing" value={answers.housing} onChange={handleChange} required style={selectStyle}>
            <option value="">Choose an option...</option>
            <option value="Apartment (No Yard)">Apartment (No Yard)</option>
            <option value="House with Fenced Yard">House with Fenced Yard</option>
            <option value="Farm / Rural property">Farm / Rural property</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>2. What is your experience level with pets?</label>
          <select name="experience" value={answers.experience} onChange={handleChange} required style={selectStyle}>
            <option value="">Choose an option...</option>
            <option value="First-time Owner">First-time Owner (I'm learning!)</option>
            <option value="Some Experience">Some Experience (Grew up with pets)</option>
            <option value="Expert">Expert (Can handle training & special needs)</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>3. How much time can you dedicate to pet activities daily?</label>
          <select name="timeAvailable" value={answers.timeAvailable} onChange={handleChange} required style={selectStyle}>
            <option value="">Choose an option...</option>
            <option value="Minimal (Quick walks)">Minimal (Quick walks & evening cuddles)</option>
            <option value="Moderate (1-2 hours)">Moderate (1-2 hours of dedicated playtime)</option>
            <option value="High (I'm home all day)">High (I'm home all day / Work from home)</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>4. What is the vibe of your home?</label>
          <select name="homeVibe" value={answers.homeVibe} onChange={handleChange} required style={selectStyle}>
            <option value="">Choose an option...</option>
            <option value="Quiet & Relaxed">Quiet & Relaxed (Great for shy/older pets)</option>
            <option value="Active & Bustling">Active & Bustling (Kids, visitors, noisy)</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>5. What does your typical weekend look like?</label>
          <select name="weekendActivity" value={answers.weekendActivity} onChange={handleChange} required style={selectStyle}>
            <option value="">Choose an option...</option>
            <option value="Chilling at home">Chilling at home with movies</option>
            <option value="Exploring the outdoors">Exploring the outdoors / Hiking</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>6. Pets can be expensive. What is your care budget?</label>
          <select name="budget" value={answers.budget} onChange={handleChange} required style={selectStyle}>
            <option value="">Choose an option...</option>
            <option value="Basic">Basic (Food & Routine Vet Care)</option>
            <option value="Moderate">Moderate (Can afford emergency care/grooming)</option>
            <option value="Spoiled">Spoiled (No expense spared!)</option>
          </select>
        </div>

        <button type="submit" style={{ padding: "16px", background: "#2ecc71", color: "white", border: "none", borderRadius: "8px", fontSize: "18px", cursor: "pointer", marginTop: "20px", fontWeight: "bold", letterSpacing: "1px", transition: "0.3s" }} onMouseEnter={(e) => e.target.style.background = "#27ae60"} onMouseLeave={(e) => e.target.style.background = "#2ecc71"}>
          Generate My Matches
        </button>
      </form>
    </div>
  );
};

export default Questionnaire;
import React, { useState } from "react";
import { updateLifestyleAnswers } from "../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Questionnaire = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
  
  const [answers, setAnswers] = useState(userInfo.lifestyleAnswers || {
    homeVibe: "",
    weekendActivity: "",
    timeAvailable: "",
  });

  const handleChange = (e) => {
    setAnswers({ ...answers, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await updateLifestyleAnswers(answers);
      const updatedUser = { ...userInfo, lifestyleAnswers: data };
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      
      toast.success("Questionnaire saved! We'll use this to find your perfect match. ✨");
      navigate("/pets");
    } catch (error) {
      toast.error("Failed to save questionnaire.");
    }
  };

  return (
    <div style={{ maxWidth: "650px", margin: "40px auto", padding: "40px", background: "white", borderRadius: "12px", boxShadow: "0 8px 20px rgba(0,0,0,0.05)" }}>
      <h1 style={{ textAlign: "center", color: "#2c3e50", marginBottom: "10px" }}>Adopter Questionnaire 🐾</h1>
      <p style={{ textAlign: "center", color: "#7f8c8d", marginBottom: "35px", fontSize: "16px" }}>
        Tell us a little about your lifestyle so we can help calculate your match score with our pets!
      </p>
      
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
        
        <div>
          <label style={{ display: "block", fontWeight: "600", color: "#34495e", marginBottom: "10px" }}>
            1. How would you describe the vibe of your home?
          </label>
          <select name="homeVibe" value={answers.homeVibe} onChange={handleChange} required style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ced4da", fontSize: "15px" }}>
            <option value="">Choose an option...</option>
            <option value="Quiet & Relaxed">Quiet & Relaxed (Great for shy or older pets)</option>
            <option value="Active & Bustling">Active & Bustling (Kids, visitors, lots of movement)</option>
            <option value="Somewhere in between">Somewhere in between</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontWeight: "600", color: "#34495e", marginBottom: "10px" }}>
            2. What does your typical weekend look like?
          </label>
          <select name="weekendActivity" value={answers.weekendActivity} onChange={handleChange} required style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ced4da", fontSize: "15px" }}>
            <option value="">Choose an option...</option>
            <option value="Chilling at home">Chilling at home with movies and snacks</option>
            <option value="Exploring the outdoors">Exploring the outdoors / Hiking / Parks</option>
            <option value="Running errands">Running errands and socializing</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontWeight: "600", color: "#34495e", marginBottom: "10px" }}>
            3. How much time can you dedicate to pet activities daily?
          </label>
          <select name="timeAvailable" value={answers.timeAvailable} onChange={handleChange} required style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ced4da", fontSize: "15px" }}>
            <option value="">Choose an option...</option>
            <option value="Quick walks and cuddles">Just quick walks and evening cuddles</option>
            <option value="1-2 hours of playtime">1-2 hours of dedicated playtime/walking</option>
            <option value="I'm home all day">I'm home all day and ready for anything!</option>
          </select>
        </div>

        <button type="submit" style={{ padding: "14px", background: "#3498db", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer", marginTop: "20px", fontWeight: "bold", transition: "background 0.3s" }} onMouseEnter={(e) => e.target.style.background = "#2980b9"} onMouseLeave={(e) => e.target.style.background = "#3498db"}>
          Save My Answers
        </button>
      </form>
    </div>
  );
};

export default Questionnaire;
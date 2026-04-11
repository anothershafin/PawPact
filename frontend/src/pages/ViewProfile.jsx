import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserProfile, sendOtp, verifyOtp } from "../services/api";
import "../styles/ViewProfile.css";

const ViewProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getUserProfile();
        setUser(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const getRoleName = (role) => {
    if (role === "adopter") return "Adopter";
    if (role === "petparent") return "Pet Parent";
    if (role === "admin") return "Admin";
    return role;
  };

  const handleSendOtp = async () => {
    try {
      setError("");
      setMessage("");

      const { data } = await sendOtp();

      setMessage(`OTP sent successfully. Demo OTP: ${data.otp}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setError("");
      setMessage("");

      const { data } = await verifyOtp(otp);

      setUser({ ...user, isVerified: true });
      setMessage(data.message);
      setOtp("");
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <p className="profile-loading">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <p className="profile-loading">Could not load profile.</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-top-actions">
        <button className="profile-placeholder-btn">Favourite Pets</button>
      </div>

      <div className="profile-card">
        <h2 className="profile-heading">My Profile</h2>

        <div className="profile-field">
          <span className="profile-label">Name:</span>
          <span className="profile-value">{user.name}</span>
        </div>

        <div className="profile-field">
          <span className="profile-label">Email:</span>
          <span className="profile-value">{user.email}</span>
        </div>

        <div className="profile-field">
          <span className="profile-label">Phone Number:</span>
          <span className="profile-value">{user.phone}</span>
        </div>

        <div className="profile-field">
          <span className="profile-label">Role:</span>
          <span className="profile-value">{getRoleName(user.role)}</span>
        </div>

        <div className="profile-field">
          <span className="profile-label">Upazilla:</span>
          <span className="profile-value">{user.upazilla}</span>
        </div>

        <div className="profile-field">
          <span className="profile-label">District:</span>
          <span className="profile-value">{user.district}</span>
        </div>

        {user.isVerified ? (
          <span className="verified-badge">✔ Verified</span>
        ) : (
          <div>
            <p className="profile-not-verified">You are not verified yet.</p>

            <div className="profile-actions">
              <button className="profile-placeholder-btn" onClick={handleSendOtp}>
                Send OTP
              </button>

              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <button className="profile-placeholder-btn" onClick={handleVerifyOtp}>
                Verify OTP
              </button>
            </div>

            {message && <p style={{ color: "green", marginTop: "10px" }}>{message}</p>}
            {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
          </div>
        )}

        <div className="profile-actions">
          <Link to="/edit-profile" className="profile-edit-btn">
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
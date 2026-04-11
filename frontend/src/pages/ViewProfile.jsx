import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserProfile } from "../services/api";
import "../styles/ViewProfile.css";

const ViewProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
          <p className="profile-verified">Verified</p>
        ) : (
          <p className="profile-not-verified">You are not verified yet.</p>
        )}

        <div className="profile-actions">
          <button className="profile-placeholder-btn">Verify Profile</button>
          <Link to="/edit-profile" className="profile-edit-btn">
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
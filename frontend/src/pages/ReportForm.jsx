import React, { useState } from "react";
import { createReport } from "../services/api";
import "../styles/ReportForm.css";

const ReportForm = () => {
  const [formData, setFormData] = useState({
    reportType: "user",
    reportedUser: "",
    reportedPet: "",
    reason: "",
    details: "",
    evidence: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reasonOptions = [
    "Fake or misleading information",
    "Suspicious adoption activity",
    "Abuse or harassment",
    "Spam",
    "Inappropriate content",
    "Animal welfare concern",
    "Scam or fraud concern",
    "Other",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "reportType" && value === "user"
        ? { reportedPet: "" }
        : {}),
      ...(name === "reportType" && value === "pet"
        ? { reportedUser: "" }
        : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!formData.reason) {
      setError("Please select a reason.");
      return;
    }

    if (formData.reportType === "user" && !formData.reportedUser.trim()) {
      setError("Please enter a reported user ID.");
      return;
    }

    if (formData.reportType === "pet" && !formData.reportedPet.trim()) {
      setError("Please enter a reported pet ID.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        reportType: formData.reportType,
        reason: formData.reason,
        details: formData.details,
        evidence: formData.evidence,
        reportedUser:
          formData.reportType === "user" ? formData.reportedUser.trim() : "",
        reportedPet:
          formData.reportType === "pet" ? formData.reportedPet.trim() : "",
      };

      const { data } = await createReport(payload);

      setMessage(data.message || "Report submitted successfully.");
      setFormData({
        reportType: "user",
        reportedUser: "",
        reportedPet: "",
        reason: "",
        details: "",
        evidence: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="report-page">
      <div className="report-layout">
        <section className="report-card">
          <div className="report-header">
            <p className="report-eyebrow">Safety & Moderation</p>
            <h1 className="report-title">Submit a Report</h1>
            <p className="report-subtitle">
              Help us keep PawPact safe for adopters, pet parents, and pets.
            </p>
          </div>

          {message && (
            <div className="report-message success">
              <strong>Success:</strong> {message}
            </div>
          )}

          {error && (
            <div className="report-message error">
              <strong>Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="report-form">
            <div className="report-section">
              <h3 className="section-title">What are you reporting?</h3>

              <div className="report-group">
                <label className="report-label" htmlFor="reportType">
                  Report Type
                </label>
                <select
                  id="reportType"
                  name="reportType"
                  className="report-select"
                  value={formData.reportType}
                  onChange={handleChange}
                >
                  <option value="user">User</option>
                  <option value="pet">Pet Listing</option>
                </select>
              </div>

              {formData.reportType === "user" && (
                <div className="report-group">
                  <label className="report-label" htmlFor="reportedUser">
                    Reported User ID
                  </label>
                  <input
                    id="reportedUser"
                    type="text"
                    name="reportedUser"
                    className="report-input"
                    value={formData.reportedUser}
                    onChange={handleChange}
                    placeholder="Enter user MongoDB ID"
                  />
                  <p className="report-help">
                    Paste the MongoDB user ID of the account you want to report.
                  </p>
                </div>
              )}

              {formData.reportType === "pet" && (
                <div className="report-group">
                  <label className="report-label" htmlFor="reportedPet">
                    Reported Pet ID
                  </label>
                  <input
                    id="reportedPet"
                    type="text"
                    name="reportedPet"
                    className="report-input"
                    value={formData.reportedPet}
                    onChange={handleChange}
                    placeholder="Enter pet MongoDB ID"
                  />
                  <p className="report-help">
                    Paste the MongoDB pet ID of the listing you want to report.
                  </p>
                </div>
              )}
            </div>

            <div className="report-section">
              <h3 className="section-title">Why are you reporting this?</h3>

              <div className="report-group">
                <label className="report-label" htmlFor="reason">
                  Reason
                </label>
                <select
                  id="reason"
                  name="reason"
                  className="report-select"
                  value={formData.reason}
                  onChange={handleChange}
                >
                  <option value="">Select a reason</option>
                  {reasonOptions.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              <div className="report-group">
                <label className="report-label" htmlFor="details">
                  Details
                </label>
                <textarea
                  id="details"
                  name="details"
                  className="report-textarea"
                  value={formData.details}
                  onChange={handleChange}
                  placeholder="Describe what happened and why you are reporting it."
                  rows="6"
                />
                <p className="report-help">
                  Include useful context so the admin can review the issue faster.
                </p>
              </div>
            </div>

            <div className="report-section">
              <h3 className="section-title">Evidence</h3>

              <div className="report-group">
                <label className="report-label" htmlFor="evidence">
                  Evidence Link / Image URL
                </label>
                <input
                  id="evidence"
                  type="text"
                  name="evidence"
                  className="report-input"
                  value={formData.evidence}
                  onChange={handleChange}
                  placeholder="Paste screenshot link or image URL (optional)"
                />
                <p className="report-help">
                  Optional, but recommended. Screenshots or image links help support
                  the report.
                </p>
              </div>

              {formData.evidence.trim() && (
                <div className="report-preview">
                  <span className="preview-label">Evidence Preview:</span>
                  <a
                    href={formData.evidence}
                    target="_blank"
                    rel="noreferrer"
                    className="preview-link"
                  >
                    Open evidence link
                  </a>
                </div>
              )}
            </div>

            <div className="report-footer">
              <button
                type="submit"
                className="report-button"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        </section>

        <aside className="report-side-panel">
          <h2 className="side-title">Reporting Guide</h2>

          <div className="side-box">
            <h4>When should I report?</h4>
            <p>
              Report users or listings that appear misleading, abusive, suspicious,
              unsafe, or inappropriate.
            </p>
          </div>

          <div className="side-box">
            <h4>What evidence helps?</h4>
            <p>
              Add a screenshot link, image URL, or another supporting reference that
              helps explain the issue.
            </p>
          </div>

          <div className="side-box">
            <h4>What happens next?</h4>
            <p>
              Your report is stored with a <strong>pending</strong> status so an
              admin can review it later.
            </p>
          </div>

          <div className="side-box summary-box">
            <h4>Live Summary</h4>
            <p>
              <strong>Type:</strong>{" "}
              {formData.reportType === "user" ? "User" : "Pet Listing"}
            </p>
            <p>
              <strong>Target:</strong>{" "}
              {formData.reportType === "user"
                ? formData.reportedUser || "Not entered"
                : formData.reportedPet || "Not entered"}
            </p>
            <p>
              <strong>Reason:</strong> {formData.reason || "Not selected"}
            </p>
            <p>
              <strong>Status After Submit:</strong> Pending
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ReportForm;
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getQuestionnaire, saveQuestionnaireAnswers } from "../services/api";
import { toastError, toastSuccess } from "../utils/toast";

const defaultAnswers = {
  homeType: "apartment",
  activityLevel: "medium",
  timeAvailable: "medium",
  goodWithKids: "no",
  goodWithOtherPets: "no",
  experienceLevel: "firstTime",
};

const Questionnaire = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({ ...defaultAnswers });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const { data } = await getQuestionnaire();
        setQuestions(data.questions || []);
        if (data.savedAnswers && typeof data.savedAnswers === "object") {
          setAnswers((prev) => ({ ...prev, ...data.savedAnswers }));
        }
      } catch (e) {
        const msg = e.response?.data?.message || "Failed to load questionnaire";
        setError(msg);
        toastError(msg);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const set = (key, value) => setAnswers((p) => ({ ...p, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      setSaving(true);
      await saveQuestionnaireAnswers(answers);
      setSuccess("Saved. Open any pet profile to see your match score.");
      toastSuccess("Lifestyle questionnaire saved.");
    } catch (e2) {
      const msg = e2.response?.data?.message || "Failed to save";
      setError(msg);
      toastError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!userInfo || userInfo.role !== "adopter") {
    return (
      <div style={{ padding: 24 }}>
        <h2>Questionnaire</h2>
        <p>This page is for adopters.</p>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Lifestyle Questionnaire</h2>
        <p className="auth-subtitle">
          Your answers are compared to each pet&apos;s lifestyle requirements (set by the pet parent). Match scores appear on pet profiles after you save.
        </p>

        {loading ? <p>Loading...</p> : null}
        {error ? <div className="auth-error">{error}</div> : null}
        {success ? <div className="auth-success">{success}</div> : null}

        {!loading && (
          <form onSubmit={submit} className="auth-form">
            {questions.map((q) => (
              <div key={q.key} className="auth-field">
                <label className="auth-label">{q.label}</label>
                <select className="auth-input auth-select" value={answers[q.key]} onChange={(e) => set(q.key, e.target.value)}>
                  {q.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <button type="submit" className="auth-btn" disabled={saving}>
              {saving ? "Saving..." : "Save answers"}
            </button>
          </form>
        )}

        {!loading && (
          <p className="auth-switch" style={{ marginTop: 18 }}>
            <Link to="/discover" className="auth-switch-link">
              Browse pets
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Questionnaire;


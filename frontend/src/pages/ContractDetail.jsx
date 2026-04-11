import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toastError, toastSuccess } from "../utils/toast";
import {
  answerCheckIn,
  confirmContractCompletion,
  createCheckIn,
  getContractById,
  postObservationUpdate,
  requestReturn,
} from "../services/api";

const ContractDetail = () => {
  const { id } = useParams();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const [updateNotes, setUpdateNotes] = useState("");
  const [checkinQ, setCheckinQ] = useState("");
  const [checkinDue, setCheckinDue] = useState("");

  const refresh = async () => {
    const { data: d } = await getContractById(id);
    setData(d);
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await refresh();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const postUpdate = async (e) => {
    e.preventDefault();
    try {
      await postObservationUpdate(id, { notes: updateNotes });
      setUpdateNotes("");
      await refresh();
      toastSuccess("Update posted.");
    } catch (e2) {
      toastError(e2.response?.data?.message || "Failed to post update");
    }
  };

  const addCheckin = async (e) => {
    e.preventDefault();
    try {
      await createCheckIn(id, { question: checkinQ, dueAt: checkinDue });
      setCheckinQ("");
      setCheckinDue("");
      await refresh();
      toastSuccess("Check-in created.");
    } catch (e2) {
      toastError(e2.response?.data?.message || "Failed to create check-in");
    }
  };

  const answer = async (checkinId) => {
    const answerText = window.prompt("Your answer:");
    if (!answerText) return;
    try {
      await answerCheckIn(id, checkinId, { answerText });
      await refresh();
      toastSuccess("Answer submitted.");
    } catch (e2) {
      toastError(e2.response?.data?.message || "Failed to submit answer");
    }
  };

  const confirm = async () => {
    try {
      await confirmContractCompletion(id);
      await refresh();
      toastSuccess("Confirmation saved.");
    } catch (e2) {
      toastError(e2.response?.data?.message || "Failed to confirm");
    }
  };

  const ret = async () => {
    if (!window.confirm("Request return?")) return;
    try {
      await requestReturn(id);
      await refresh();
      toastSuccess("Return requested.");
    } catch (e2) {
      toastError(e2.response?.data?.message || "Failed to request return");
    }
  };

  if (!userInfo) return <div style={{ padding: 24 }}>Please log in.</div>;
  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!data) return <div style={{ padding: 24 }}>Not found.</div>;

  const { contract, updates, checkins } = data;

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0 }}>
        Contract: {contract.pet?.name} ({contract.pet?.breed})
      </h2>
      <div style={{ opacity: 0.8 }}>
        {new Date(contract.startDate).toLocaleString()} → {new Date(contract.endDate).toLocaleString()}
      </div>
      <div style={{ marginTop: 8, fontWeight: 700 }}>Status: {contract.status?.replace("_", " ")}</div>

      <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        <button className="auth-btn" type="button" onClick={confirm}>
          Confirm completion
        </button>
        {userInfo.role === "petparent" ? (
          <button className="auth-btn" type="button" onClick={ret}>
            Request return
          </button>
        ) : null}
      </div>

      {userInfo.role === "adopter" && contract.status === "active" && (
        <form onSubmit={postUpdate} style={{ marginTop: 16, display: "grid", gap: 10 }}>
          <h3 style={{ margin: 0 }}>Post update</h3>
          <textarea
            className="auth-input"
            style={{ minHeight: 90 }}
            value={updateNotes}
            onChange={(e) => setUpdateNotes(e.target.value)}
            placeholder="How is the observation going?"
            required
          />
          <button className="auth-btn" type="submit">
            Post update
          </button>
        </form>
      )}

      {userInfo.role === "petparent" && contract.status === "active" && (
        <form onSubmit={addCheckin} style={{ marginTop: 16, display: "grid", gap: 10 }}>
          <h3 style={{ margin: 0 }}>Create check-in question</h3>
          <input className="auth-input" value={checkinQ} onChange={(e) => setCheckinQ(e.target.value)} placeholder="Question" required />
          <input className="auth-input" type="datetime-local" value={checkinDue} onChange={(e) => setCheckinDue(e.target.value)} required />
          <button className="auth-btn" type="submit">
            Create check-in
          </button>
        </form>
      )}

      <div style={{ marginTop: 18 }}>
        <h3 style={{ marginBottom: 8 }}>Check-ins</h3>
        {checkins.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No check-ins.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {checkins.map((c) => (
              <div key={c._id} style={{ border: "1px solid #e6e6e6", borderRadius: 12, padding: 12 }}>
                <div style={{ fontWeight: 700 }}>{c.question}</div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>Due: {new Date(c.dueAt).toLocaleString()}</div>
                <div style={{ marginTop: 8 }}>
                  {c.answeredAt ? (
                    <div>
                      <div style={{ opacity: 0.75, fontSize: 12 }}>Answered: {new Date(c.answeredAt).toLocaleString()}</div>
                      <div>{c.answerText}</div>
                    </div>
                  ) : userInfo.role === "adopter" ? (
                    <button className="auth-btn" type="button" onClick={() => answer(c._id)}>
                      Answer
                    </button>
                  ) : (
                    <div style={{ opacity: 0.7 }}>Waiting for adopter response.</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 18 }}>
        <h3 style={{ marginBottom: 8 }}>Updates</h3>
        {updates.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No updates yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {updates.map((u) => (
              <div key={u._id} style={{ border: "1px solid #e6e6e6", borderRadius: 12, padding: 12 }}>
                <div style={{ fontSize: 12, opacity: 0.75 }}>{new Date(u.createdAt).toLocaleString()}</div>
                <div style={{ marginTop: 6 }}>{u.notes}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractDetail;


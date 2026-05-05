import React, { useState, useEffect } from "react";
import { sendChatMessage, getApplicationDetails, requestReturn } from "../services/api";
import { toast } from "react-toastify";

const ObservationPeriod = ({ applicationId, onClose, onApplicationUpdate }) => {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // Fetch application details
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        console.log("Fetching application with ID:", applicationId);
        const { data } = await getApplicationDetails(applicationId);
        console.log("Application data received:", data);
        setApplication(data);
        if (data.remainingObservationTime) {
          setTimeRemaining(Math.ceil(data.remainingObservationTime / 1000));
        }
      } catch (error) {
        console.error("Error fetching application:", error);
        toast.error(error.response?.data?.message || "Failed to load application details");
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();

    // Refresh every 5 seconds to get updated data
    const interval = setInterval(fetchApplication, 5000);
    return () => clearInterval(interval);
  }, [applicationId]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null) return;

    if (timeRemaining <= 0) {
      toast.info("✅ Observation period completed - Adoption finalized!");
      if (onApplicationUpdate) onApplicationUpdate();
      setTimeout(() => onClose(), 2000);
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, onClose, onApplicationUpdate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendQuestion = async () => {
    if (!checkInQuestion.trim() || !dueDate) {
      toast.warning("Please enter question and due date");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await sendCheckInQuestion(applicationId, checkInQuestion, dueDate);
      setApplication(data.application);
      setCheckInQuestion("");
      setDueDate("");
      toast.success("Check-in question sent!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send question");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatMessage.trim()) {
      toast.warning("Please enter a message");
      return;
    }

    setSubmitting(true);
    try {
      await sendChatMessage(applicationId, chatMessage);
      // Fetch updated application to get new message
      const { data } = await getApplicationDetails(applicationId);
      setApplication(data);
      setChatMessage("");
      toast.success("Message sent!");
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestReturn = async () => {
    if (!window.confirm("Are you sure you want to request a return? This will cancel the adoption.")) {
      return;
    }

    setSubmitting(true);
    try {
      await requestReturn(applicationId, "");
      toast.success("Return request submitted - Adoption cancelled");
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to request return");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;
  }

  if (!application) {
    return <div style={{ padding: "40px", textAlign: "center", color: "red" }}>Application not found</div>;
  }

  const isAdopter = application.adopter._id === userInfo._id;
  const isPetParent = application.petParent._id === userInfo._id;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          🐾 Observation Period - {application.pet.name}
        </h2>
        <button onClick={onClose} style={styles.closeBtn}>✕</button>
      </div>

      {/* Timer Section */}
      <div style={styles.timerCard}>
        <h3 style={{ margin: "0 0 15px 0" }}>⏱️ Observation Timer</h3>
        <div style={styles.timerDisplay}>
          {timeRemaining !== null ? formatTime(timeRemaining) : "Loading..."}
        </div>
        <p style={styles.timerText}>
          {timeRemaining === 0 
            ? "✅ Observation period completed - Adoption finalized!" 
            : "Time remaining for observation period"}
        </p>

        {/* Return Request Button - Only for adopter */}
        {isAdopter && application.status === "under review" && (
          <button 
            onClick={handleRequestReturn}
            disabled={submitting}
            style={{...styles.returnButton, opacity: submitting ? 0.6 : 1}}
          >
            🔄 Request Return
          </button>
        )}
      </div>

      {/* Chat Section */}
      {application.status === "under review" && (
        <div style={styles.card}>
          <h3 style={{ margin: "0 0 15px 0" }}>💬 Chat with {isPetParent ? application.adopter.name : application.petParent.name}</h3>
          
          {/* Messages Display */}
          <div style={styles.chatBox}>
            {application.chatMessages && application.chatMessages.length > 0 ? (
              application.chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  style={{
                    ...styles.message,
                    justifyContent: msg.sender._id === userInfo._id ? "flex-end" : "flex-start"
                  }}
                >
                  <div 
                    style={{
                      ...styles.messageBubble,
                      background: msg.sender._id === userInfo._id ? "#007bff" : "#e9ecef",
                      color: msg.sender._id === userInfo._id ? "white" : "black"
                    }}
                  >
                    <strong style={{ fontSize: "0.8rem" }}>{msg.sender.name}</strong>
                    <p style={{ margin: "5px 0 0 0" }}>{msg.message}</p>
                    <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center", color: "#999" }}>No messages yet. Start the conversation!</p>
            )}
          </div>

          {/* Chat Input */}
          <div style={styles.chatInput}>
            <textarea
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type your message..."
              style={styles.chatTextarea}
            />
            <button 
              onClick={handleSendChat}
              disabled={submitting}
              style={{...styles.button, opacity: submitting ? 0.6 : 1}}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "30px 20px",
    background: "#f8f9fa",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    borderBottom: "2px solid #dee2e6",
    paddingBottom: "15px"
  },
  title: {
    margin: 0,
    color: "#1e293b",
    fontSize: "1.8rem"
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#666"
  },
  timerCard: {
    background: "white",
    padding: "25px",
    borderRadius: "10px",
    marginBottom: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    textAlign: "center",
    border: "2px solid #ffc107"
  },
  timerDisplay: {
    fontSize: "3rem",
    fontWeight: "bold",
    color: "#ffc107",
    margin: "15px 0",
    fontFamily: "monospace"
  },
  timerText: {
    color: "#666",
    margin: "15px 0"
  },
  returnButton: {
    background: "#ff6b6b",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
    marginTop: "15px",
    fontWeight: "bold",
    transition: "background 0.3s"
  },
  card: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
  },
  chatBox: {
    background: "#f8f9fa",
    padding: "15px",
    borderRadius: "6px",
    maxHeight: "300px",
    overflowY: "auto",
    marginBottom: "15px"
  },
  message: {
    display: "flex",
    marginBottom: "10px"
  },
  messageBubble: {
    padding: "10px 15px",
    borderRadius: "8px",
    maxWidth: "70%",
    wordBreak: "break-word"
  },
  chatInput: {
    display: "flex",
    gap: "10px"
  },
  chatTextarea: {
    flex: 1,
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "0.95rem",
    fontFamily: "Arial, sans-serif",
    minHeight: "60px",
    boxSizing: "border-box"
  }
};

export default ObservationPeriod;

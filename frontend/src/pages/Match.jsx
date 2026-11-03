import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../context/AlertContext";

const API_URL = import.meta.env.VITE_API_URL 
  || (import.meta.env.PROD ? "https://lostlink-wbtc.onrender.com" : "http://localhost:5000");

// Before a match is confirmed the server does not send the photo at all (only hasImage),
// so there is nothing to un-blur: show a placeholder instead.
function MatchPhoto({ item, confirmed, alt }) {
  if (confirmed) {
    if (!item.image) return null;

    return (
      <div className="mb-2">
        <img
          src={item.image}
          alt={alt}
          className="img-fluid rounded"
          style={{ maxHeight: "150px", objectFit: "cover", width: "100%" }}
        />
      </div>
    );
  }

  if (!item.hasImage) return null;

  return (
    <div
      className="mb-2 d-flex flex-column justify-content-center align-items-center rounded"
      style={{ height: "150px", background: "#e9ecef", color: "#555", fontWeight: "bold" }}
    >
      <span style={{ fontSize: "28px" }}>📷</span>
      <span>Confirm to View</span>
    </div>
  );
}

function Match() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API_URL}/api/matches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMatches(res.data);
    } catch (err) {
      console.log("MATCH FETCH ERROR:", err);
      showAlert("Failed to load matches", "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmMatch = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(`${API_URL}/api/matches/confirm`,
        { matchId: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showAlert("Match confirmed 🎉", "success");

      await fetchMatches();

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (err) {
      console.log("CONFIRM ERROR:", err);
      showAlert("Failed to confirm match", "error");
    }
  };

  const openChat = (match) => {
    const userId = JSON.parse(
      atob(localStorage.getItem("token").split(".")[1])
    ).id;

    let receiverId;

    if (match.lostItem.user === userId) {
      receiverId = match.foundItem.user;
    } else {
      receiverId = match.lostItem.user;
    }

    navigate("/chat", {
      state: {
        matchId: match.matchId,
        receiverId,
      },
    });
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <p>🔍 Finding best matches...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3 className="mb-4 fw-bold">🔗 Your Matches</h3>

      {matches.length === 0 && (
        <p className="text-muted text-center">No matches found</p>
      )}

      <div className="row">
        {matches.map((m) => (
          <div className="col-md-6 mb-4" key={m.matchId}>
            <div className="card shadow-lg p-3 border-0">

              <div className="d-flex justify-content-between align-items-center">
                <span className="badge bg-dark">
                  {(m.score * 100).toFixed(0)}% Match
                </span>

                {m.distance !== undefined && (
                  <small className="text-muted">
                    📍 {m.distance.toFixed(2)} km
                  </small>
                )}
              </div>

              <span
                className={`badge mt-2 ${
                  m.status === "confirmed"
                    ? "bg-success"
                    : "bg-warning text-dark"
                }`}
              >
                {m.status}
              </span>

              <hr />

              <h6 className="fw-bold">Lost Item</h6>
              <p><strong>{m.lostItem.title}</strong></p>

              <MatchPhoto item={m.lostItem} confirmed={m.status === "confirmed"} alt="lost" />

              <p className="text-muted small">{m.lostItem.description}</p>

              <h6 className="fw-bold mt-3">Found Item</h6>
              <p><strong>{m.foundItem.title}</strong></p>

              <MatchPhoto item={m.foundItem} confirmed={m.status === "confirmed"} alt="found" />

              <p className="text-muted small">{m.foundItem.description}</p>

              {m.status !== "confirmed" ? (
                <button
                  className="btn btn-primary w-100 mt-2"
                  onClick={() => confirmMatch(m.matchId)}
                >
                  Confirm Match
                </button>
              ) : (
                <button
                  className="btn btn-success w-100 mt-2"
                  onClick={() => openChat(m)}
                >
                  💬 Chat
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {matches.length > 0 && (
        <button
          onClick={() => openChat(matches[0])}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            borderRadius: "50%",
            width: "60px",
            height: "60px",
            fontSize: "24px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
          }}
        >
          💬
        </button>
      )}
    </div>
  );
}

export default Match;
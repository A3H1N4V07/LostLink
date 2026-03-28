import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../context/AlertContext";

function Match() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/api/matches", {
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

      await axios.post(
        "http://localhost:5000/api/matches/confirm",
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

              {m.lostItem.image && (
                <div className="position-relative mb-2">
                  <img
                    src={m.lostItem.image}
                    alt="lost"
                    className="img-fluid rounded"
                    style={{
                      maxHeight: "150px",
                      objectFit: "cover",
                      width: "100%",
                      filter: m.status === "confirmed" ? "none" : "blur(8px)",
                    }}
                  />

                  {m.status !== "confirmed" && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                      style={{
                        background: "rgba(0,0,0,0.4)",
                        color: "#fff",
                        fontWeight: "bold",
                        borderRadius: "8px"
                      }}>
                      Confirm to View
                    </div>
                  )}
                </div>
              )}

              <p className="text-muted small">{m.lostItem.description}</p>

              <h6 className="fw-bold mt-3">Found Item</h6>
              <p><strong>{m.foundItem.title}</strong></p>

              {m.foundItem.image && (
                <div className="position-relative mb-2">
                  <img
                    src={m.foundItem.image}
                    alt="found"
                    className="img-fluid rounded"
                    style={{
                      maxHeight: "150px",
                      objectFit: "cover",
                      width: "100%",
                      filter: m.status === "confirmed" ? "none" : "blur(8px)",
                    }}
                  />

                  {m.status !== "confirmed" && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                      style={{
                        background: "rgba(0,0,0,0.4)",
                        color: "#fff",
                        fontWeight: "bold",
                        borderRadius: "8px"
                      }}>
                      Confirm to View
                    </div>
                  )}
                </div>
              )}

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
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Link, useLocation } from "react-router-dom";
import { useAlert } from "../context/AlertContext";

const API_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? "https://lostlink-wbtc.onrender.com" : "http://localhost:5000");

const socket = io(API_URL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

const getUserId = (userObj) => {
  if (!userObj) return null;
  if (typeof userObj === "object") return userObj._id || userObj.id;
  return userObj;
};

const formatTime = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

function Chat() {
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [thread, setThread] = useState({ matchId: null, list: [] });
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const listRef = useRef(null);
  const location = useLocation();
  const { showAlert } = useAlert();

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = user._id || user.id;
  const token = localStorage.getItem("token");

  // The Matches page opens a chat with navigate("/chat", { state: { matchId } })
  const requestedId = location.state?.matchId;
  const selectedId =
    activeId ?? (matches.some((m) => m.matchId === requestedId) ? requestedId : null);
  const selected = matches.find((m) => m.matchId === selectedId) || null;
  const messages = thread.matchId === selectedId ? thread.list : [];

  // 1. Load the user's confirmed matches (only confirmed matches can chat)
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    axios
      .get(`${API_URL}/api/matches`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!cancelled) setMatches(res.data.filter((m) => m.status === "confirmed"));
      })
      .catch((err) => console.error("Fetch matches error:", err))
      .finally(() => {
        if (!cancelled) setLoadingMatches(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  // 2. For the open chat: join its room, load the history, listen for new messages
  useEffect(() => {
    if (!selectedId) return;

    let cancelled = false;

    const joinRoom = () => socket.emit("joinRoom", selectedId);

    joinRoom();
    // rooms are lost if the socket reconnects (e.g. the free server woke up), so join again
    socket.on("connect", joinRoom);

    axios
      .get(`${API_URL}/api/messages/${selectedId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (!cancelled) setThread({ matchId: selectedId, list: res.data });
      })
      .catch((err) => console.error("Load messages error:", err));

    const onReceive = (msg) => {
      if (msg.matchId !== selectedId) return; // ignore messages from other chats
      setThread((prev) =>
        prev.matchId === selectedId
          ? { matchId: selectedId, list: [...prev.list, msg] }
          : prev
      );
    };

    socket.on("receiveMessage", onReceive);

    return () => {
      cancelled = true;
      socket.off("connect", joinRoom);
      socket.off("receiveMessage", onReceive);
    };
  }, [selectedId, token]);

  // 3. Keep the newest message in view
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length, selectedId]);

  const sendMessage = async () => {
    const body = text.trim();
    if (!body || !selected || sending) return;

    const lostUser = getUserId(selected.lostItem?.user);
    const foundUser = getUserId(selected.foundItem?.user);
    const receiverId = lostUser === userId ? foundUser : lostUser;

    if (!receiverId) return;

    try {
      setSending(true);

      // 1. Save to the database (so the history survives a refresh)
      await axios.post(
        `${API_URL}/api/messages/send`,
        { matchId: selected.matchId, receiverId, text: body },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2. Broadcast to everyone in the room (including me) for instant delivery
      socket.emit("sendMessage", {
        matchId: selected.matchId,
        senderId: userId,
        receiverId,
        text: body,
        createdAt: new Date().toISOString(),
      });

      setText("");
    } catch (err) {
      console.error("Send message error:", err);
      showAlert("Message could not be sent", "error");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loadingMatches) {
    return (
      <div className="container mt-4 text-center">
        <p>💬 Loading your chats...</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="container mt-4 text-center">
        <h3 className="fw-bold mb-3">💬 Chat</h3>
        <p className="text-muted">
          No chats yet. A chat opens once you confirm a match.
        </p>
        <Link to="/matches" className="btn btn-primary">
          Go to Matches
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3 className="mb-3 fw-bold">💬 Chat</h3>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="list-group shadow-sm">
            {matches.map((m) => (
              <button
                type="button"
                key={m.matchId}
                className={`list-group-item list-group-item-action ${
                  m.matchId === selectedId ? "active" : ""
                }`}
                onClick={() => setActiveId(m.matchId)}
              >
                <div className="fw-semibold">
                  {m.lostItem.title} ↔ {m.foundItem.title}
                </div>
                <small>{(m.score * 100).toFixed(0)}% match</small>
              </button>
            ))}
          </div>
        </div>

        <div className="col-md-8">
          <div className="card shadow-sm border-0">
            {selected ? (
              <>
                <div className="card-header bg-white fw-semibold">
                  {selected.lostItem.title} ↔ {selected.foundItem.title}
                </div>

                <div
                  ref={listRef}
                  style={{
                    height: "380px",
                    overflowY: "auto",
                    background: "#f6f7f9",
                    padding: "16px",
                  }}
                >
                  {messages.length === 0 && (
                    <p className="text-muted text-center mt-5">
                      No messages yet. Say hello and arrange the handover. 👋
                    </p>
                  )}

                  {messages.map((m, i) => {
                    const mine = String(m.senderId) === String(userId);

                    return (
                      <div
                        key={m._id || `${m.createdAt}-${i}`}
                        className={`d-flex mb-2 ${mine ? "justify-content-end" : "justify-content-start"}`}
                      >
                        <div
                          style={{
                            maxWidth: "75%",
                            padding: "8px 12px",
                            borderRadius: "12px",
                            background: mine ? "#0d6efd" : "#fff",
                            color: mine ? "#fff" : "#212529",
                            border: mine ? "none" : "1px solid #dee2e6",
                            wordBreak: "break-word",
                          }}
                        >
                          <div>{m.text}</div>
                          <div
                            style={{
                              fontSize: "0.7rem",
                              opacity: 0.7,
                              textAlign: "right",
                            }}
                          >
                            {formatTime(m.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="card-footer bg-white">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type a message..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={sendMessage}
                      disabled={sending || !text.trim()}
                    >
                      {sending ? "Sending..." : "Send"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-body text-center text-muted py-5">
                Select a conversation to start chatting.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;

import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";

const socket = io("http://localhost:5000");

function Chat() {
  const [matches, setMatches] = useState([]);
  const [activeMatch, setActiveMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = user._id || user.id;

  const token = localStorage.getItem("token");

  const getUserId = (user) => {
    if (!user) return null;
    if (typeof user === "object") return user._id;
    return user;
  };

  //Fetch confirmed matches
  const fetchMatches = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/matches",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const confirmed = res.data.filter(m => m.status === "confirmed");
      setMatches(confirmed);

    } catch (err) {
      console.log("Fetch matches error:", err);
    }
  };

  //Load messages
  const loadMessages = async (matchId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/messages/${matchId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessages(res.data);

    } catch (err) {
      console.log("Load messages error:", err);
    }
  };

  useEffect(() => {
    fetchMatches();

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("receiveMessage");
  }, []);

  useEffect(() => {
    if (location.state?.matchId && matches.length > 0) {
      const match = matches.find(
        m => m.matchId === location.state.matchId
      );

      if (match) {
        openChat(match);
      }
    }
  }, [matches]);

  //Open chat
  const openChat = (match) => {
    setActiveMatch(match);
    loadMessages(match.matchId);
    socket.emit("joinRoom", match.matchId);
  };

  // Send message
  const sendMessage = async () => {
    if (!text.trim() || !activeMatch) return;

    const lostUser = getUserId(activeMatch?.lostItem?.user);
    const foundUser = getUserId(activeMatch?.foundItem?.user);

    let receiverId;

    if (lostUser === userId) {
      receiverId = foundUser;
    } else {
      receiverId = lostUser;
    }

    if (!receiverId) {
      console.log("Receiver not found!", activeMatch);
      return;
    }

    try {
      //Save in DB
      await axios.post(
        "http://localhost:5000/api/messages/send",
        {
          matchId: activeMatch.matchId,
          receiverId,
          text
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      //  Emit via socket
      socket.emit("sendMessage", {
        matchId: activeMatch.matchId,
        senderId: userId,
        receiverId,
        text
      });

      setText("");

    } catch (err) {
      console.log("Send message error:", err);
    }
  };

  return (
    <>
      <style>
        {`
          .chat-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .chat-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .chat-scroll::-webkit-scrollbar-thumb {
            background-color: rgba(0,0,0,0.2);
            border-radius: 10px;
          }
        `}
      </style>

      <div className="container mt-4 mb-5">
        <div className="row justify-content-center">

          <div className="col-md-4 pe-md-0">
            <div className="card shadow-sm border-0 rounded-start" style={{ height: "550px", overflow: "hidden", borderTopRightRadius: 0, borderBottomRightRadius: 0 }}>
              
              <div className="p-3 border-bottom d-flex align-items-center" style={{ backgroundColor: "#f0f2f5", height: "65px" }}>
                <h5 className="m-0 fw-bold text-dark" style={{ fontSize: "1.1rem" }}>Chats</h5>
              </div>

              <div className="chat-scroll" style={{ flex: 1, overflowY: "auto", backgroundColor: "#ffffff" }}>
                {matches.length === 0 && (
                  <div className="p-4 text-center text-muted small">No active chats</div>
                )}

                {matches.map((m) => {
                  const isActive = activeMatch?.matchId === m.matchId;
                  return (
                    <div
                      key={m.matchId}
                      className="d-flex align-items-center p-3 border-bottom"
                      style={{ 
                        cursor: "pointer", 
                        backgroundColor: isActive ? "#f0f2f5" : "#ffffff",
                        transition: "background-color 0.2s ease"
                      }}
                      onClick={() => openChat(m)}
                      onMouseEnter={(e) => { if(!isActive) e.currentTarget.style.backgroundColor = "#f5f6f6" }}
                      onMouseLeave={(e) => { if(!isActive) e.currentTarget.style.backgroundColor = "#ffffff" }}
                    >
                      <div 
                        className="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0" 
                        style={{ width: "48px", height: "48px", backgroundColor: "#00a884", color: "#fff", fontSize: "1.2rem" }}
                      >
                        📦
                      </div>
                      
                      <div className="ms-3 w-100 overflow-hidden">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <h6 className="m-0 text-truncate fw-bold text-dark" style={{ fontSize: "1rem" }}>
                            {m.lostItem.title}
                          </h6>
                        </div>
                        <div className="text-muted small text-truncate" style={{ fontSize: "0.85rem" }}>
                          Matches: {m.foundItem.title}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="col-md-8 ps-md-0">
            <div className="card shadow-sm border-0 rounded-end d-flex flex-column" style={{ height: "550px", borderLeft: "1px solid #e9edef", borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>

              {!activeMatch ? (
                <div className="d-flex flex-column justify-content-center align-items-center h-100" style={{ backgroundColor: "#f0f2f5" }}>
                  <div className="rounded-circle bg-white d-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: "120px", height: "120px" }}>
                    <span style={{ fontSize: "3rem" }}>💬</span>
                  </div>
                  <h4 className="fw-light text-secondary">Lost & Found Chat</h4>
                  <p className="text-muted small">Select a chat from the left menu to start messaging.</p>
                </div>
              ) : (
                <>
                  <div className="p-2 border-bottom d-flex align-items-center" style={{ backgroundColor: "#f0f2f5", height: "65px", zIndex: 10 }}>
                    <div 
                      className="rounded-circle d-flex justify-content-center align-items-center shadow-sm flex-shrink-0 ms-2" 
                      style={{ width: "40px", height: "40px", backgroundColor: "#00a884", color: "#fff" }}
                    >
                      📦
                    </div>
                    <div className="ms-3">
                      <h6 className="m-0 fw-bold text-dark">{activeMatch.lostItem.title}</h6>
                      <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                        Linked to: {activeMatch.foundItem.title}
                      </small>
                    </div>
                  </div>

                  <div
                    className="p-4 chat-scroll"
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      backgroundColor: "#efeae2", 
                    }}
                  >
                    {messages.length === 0 && (
                      <div className="text-center my-3">
                        <span className="bg-white px-3 py-1 rounded-pill text-muted small shadow-sm" style={{ fontSize: "0.8rem" }}>
                          This is the beginning of your chat
                        </span>
                      </div>
                    )}

                    {messages.map((m, i) => {
                      const isMe = m.senderId === userId;
                      return (
                        <div
                          key={i}
                          className={`d-flex ${isMe ? "justify-content-end" : "justify-content-start"} mb-3`}
                        >
                          <div
                            style={{
                              background: isMe ? "#d9fdd3" : "#ffffff", 
                              color: "#111b21",
                              padding: "8px 14px",
                              borderRadius: "8px",
                              borderTopRightRadius: isMe ? "0px" : "8px",
                              borderTopLeftRadius: isMe ? "8px" : "0px",
                              maxWidth: "65%",
                              boxShadow: "0 1px 0.5px rgba(11,20,26,.13)", 
                              fontSize: "0.95rem",
                              lineHeight: "1.4",
                              wordWrap: "break-word"
                            }}
                          >
                            {m.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 d-flex align-items-center" style={{ backgroundColor: "#f0f2f5" }}>
                    <input
                      className="form-control shadow-none border-0 px-4"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message"
                      style={{ 
                        borderRadius: "24px", 
                        height: "45px", 
                        backgroundColor: "#ffffff",
                        fontSize: "0.95rem"
                      }}
                    />

                    <button
                      className="btn border-0 ms-2 rounded-circle d-flex justify-content-center align-items-center flex-shrink-0"
                      onClick={sendMessage}
                      disabled={!text.trim()}
                      style={{ 
                        backgroundColor: text.trim() ? "#00a884" : "#aabac1", 
                        color: "white", 
                        width: "45px", 
                        height: "45px",
                        transition: "background-color 0.2s"
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                      </svg>
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default Chat;
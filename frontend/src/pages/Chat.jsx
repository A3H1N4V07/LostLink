import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

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

  // Fetch matches
  const fetchMatches = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/matches`,
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

  // Load messages
  const loadMessages = async (matchId) => {
    try {
      const res = await axios.get(
        `${API_URL}/api/messages/${matchId}`,
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

  // Open chat
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

    let receiverId = lostUser === userId ? foundUser : lostUser;

    if (!receiverId) return;

    try {
      await axios.post(
        `${API_URL}/api/messages/send`,
        {
          matchId: activeMatch.matchId,
          receiverId,
          text
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

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
    <div>Chat UI (same as your code)</div>
  );
}

export default Chat;
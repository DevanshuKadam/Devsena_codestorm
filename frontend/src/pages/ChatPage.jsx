import React, { useEffect, useMemo, useState } from "react";
import nalawadeSocket from "../lib/nalawadeSocket";
import EmployeeLogin from "../components/EmployeeLogin";
import ManagerLogin from "../components/ManagerLogin";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import { ThemeProvider, useTheme } from "../components/Theme";
import Navbar from "../components/Navbar";
import OwnerNavbar from "../components/OwnerNavbar";
import Particles from "../components/ui/magic/Particles";

export default function ChatPage({ role: forcedRole }) {
  const [user, setUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [active, setActive] = useState(null);

  const ENDPOINT = import.meta.env.VITE_SOCKET_ENDPOINT || "http://localhost:3000";

  const desiredPeerRole = useMemo(() => {
    if (!user && forcedRole) {
      return forcedRole === "manager" ? "employee" : "manager";
    }
    if (!user) return null;
    return user.role === "manager" ? "employee" : "manager";
  }, [user, forcedRole]);

  useEffect(() => {
    if (!user) return;

    const handleUsers = (list) => {
      // list is array of { username, role }
      const peers = (list || [])
        .filter(u => u.username !== user.username)
        .filter(u => (user.role === "manager" ? u.role === "employee" : u.role === "manager"))
        .map(u => u.username);
      setOnlineUsers(peers);

      // For employees, auto-select first available manager if none selected
      if (user.role === "employee" && !active && peers.length > 0) {
        setActive(peers[0]);
      }
    };

    nalawadeSocket.on("users", handleUsers);

    const queryRole = user.role === "manager" ? "employee" : "manager";
    fetch(`${ENDPOINT}/users?role=${encodeURIComponent(queryRole)}`)
      .then(res => res.json())
      .then(data => {
        const peers = (data.users || [])
          .filter(u => u.username !== user.username)
          .map(u => u.username);
        setOnlineUsers(peers);
        if (user.role === "employee" && !active && peers.length > 0) {
          setActive(peers[0]);
        }
      })
      .catch(err => console.warn("Failed to fetch users:", err));

    return () => nalawadeSocket.off("users", handleUsers);
  }, [user, ENDPOINT, active]);

  if (!user) {
    return forcedRole === "manager" ? (
      <ManagerLogin onLogin={setUser} />
    ) : (
      <EmployeeLogin onLogin={setUser} />
    );
  }

  return (
    <ThemeProvider role={user.role}>
      <div className="min-h-screen relative overflow-hidden">
        {user.role === "manager" ? <OwnerNavbar /> : <Navbar />}
        <Particles count={35} />
        <div className="relative z-10 pt-20">
          <ChatAppContent onlineUsers={onlineUsers} active={active} setActive={setActive} user={user} />
        </div>
      </div>
    </ThemeProvider>
  );
}

function ChatAppContent({ onlineUsers, active, setActive, user }) {
  const theme = useTheme();

  return (
    <div style={{
      display: "flex",
      height: "calc(100vh - 80px)",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: theme.background,
      color: theme.text,
      borderRadius: 12,
      margin: "0 16px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      overflow: 'hidden',
      transition: 'box-shadow 300ms ease'
    }}>
      <ChatList users={onlineUsers} onSelect={setActive} selected={active} />
      {active ? (
        <ChatWindow me={user.username} other={active} socket={nalawadeSocket} />
      ) : (
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '1.2rem',
          color: theme.text,
          opacity: 0.9,
          transition: 'opacity 300ms ease'
        }}>
          Select a user to start chatting 👋
        </div>
      )}
    </div>
  );
}
// src/pages/EmployeeChat.jsx
import React, { useEffect, useMemo, useState } from "react";
import nalawadeSocket from "../lib/nalawadeSocket";
import { ThemeProvider, useTheme } from "../components/Theme";
import Navbar from "../components/Navbar";
import Particles from "../components/ui/magic/Particles";

function generateUsername(role) {
  const id = Math.floor(Math.random() * 1000);
  return role === "employee" ? `Employee${id}` : `Manager${id}`;
}

export default function EmployeeChat() {
  const [user] = useState({
    username: generateUsername("employee"),
    role: "employee",
  });
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [active, setActive] = useState(null);

  const ENDPOINT =
    import.meta.env.VITE_SOCKET_ENDPOINT || "http://localhost:3000";

  const desiredPeerRole = useMemo(
    () => (user ? "manager" : null),
    [user]
  );

  useEffect(() => {
    const handleUsers = (list) => {
      const peers = (list || [])
        .filter((u) => u.username !== user.username)
        .filter((u) => u.role === "manager")
        .map((u) => u.username);
      setOnlineUsers(peers);
      if (!active && peers.length > 0) setActive(peers[0]);
    };

    nalawadeSocket.on("users", handleUsers);

    fetch(`${ENDPOINT}/users?role=manager`)
      .then((res) => res.json())
      .then((data) => {
        const peers = (data.users || [])
          .filter((u) => u.username !== user.username)
          .map((u) => u.username);
        setOnlineUsers(peers);
        if (!active && peers.length > 0) setActive(peers[0]);
      })
      .catch((err) => console.warn("Failed to fetch users:", err));

    return () => nalawadeSocket.off("users", handleUsers);
  }, [user, ENDPOINT, active]);

  return (
    <ThemeProvider role="employee">
      <div className="min-h-screen relative overflow-hidden">
        <Navbar />
        <Particles count={35} />
        <div className="relative z-10 pt-20">
          <ChatAppContent
            onlineUsers={onlineUsers}
            active={active}
            setActive={setActive}
            user={user}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}

function ChatAppContent({ onlineUsers, active, setActive, user }) {
  const theme = useTheme();

  return (
    <div
      className="flex rounded-xl shadow-lg mx-4 overflow-hidden"
      style={{
        height: "calc(100vh - 100px)",
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-white/90 dark:bg-gray-900/80">
        <h2 className="p-4 font-semibold text-lg border-b border-gray-200">
          Online Managers
        </h2>
        <ul>
          {onlineUsers.length > 0 ? (
            onlineUsers.map((u) => (
              <li
                key={u}
                onClick={() => setActive(u)}
                className={`p-3 cursor-pointer flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  active === u ? "bg-gray-200 dark:bg-gray-700" : ""
                }`}
              >
                <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                <span>{u}</span>
              </li>
            ))
          ) : (
            <li className="p-4 italic text-gray-500">No managers online</li>
          )}
        </ul>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-white/95 dark:bg-gray-800/90">
        {active ? (
          <>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Chat with {active}</h3>
              <span className="text-sm text-gray-500">{user.username}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="self-start bg-gray-200 text-black px-3 py-2 rounded-lg max-w-xs">
                Hello 👋
              </div>
              <div className="self-end bg-blue-500 text-white px-3 py-2 rounded-lg max-w-xs">
                Hi there!
              </div>
            </div>
            <div className="p-3 border-t border-gray-200 flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-500 text-lg">
            Select a manager to start chatting 👋
          </div>
        )}
      </div>
    </div>
  );
}

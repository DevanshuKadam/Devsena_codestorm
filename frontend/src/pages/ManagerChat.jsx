import React, { useEffect, useMemo, useState } from "react";
import nalawadeSocket from "../lib/nalawadeSocket";
import { ThemeProvider } from "../components/Theme";
import OwnerNavbar from "../components/OwnerNavbar";
import Particles from "../components/ui/magic/Particles";

function generateUsername(role) {
  const id = Math.floor(Math.random() * 1000);
  return role === "manager" ? `Manager${id}` : `Employee${id}`;
}

export default function ManagerChat() {
  const [user] = useState({
    username: generateUsername("manager"),
    role: "manager",
  });
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [active, setActive] = useState(null);

  const ENDPOINT =
    import.meta.env.VITE_SOCKET_ENDPOINT || "http://localhost:3000";

  const desiredPeerRole = useMemo(
    () => (user ? "employee" : null),
    [user]
  );

  useEffect(() => {
    const handleUsers = (list) => {
      const peers = (list || [])
        .filter((u) => u.username !== user.username)
        .filter((u) => u.role === "employee")
        .map((u) => u.username);
      setOnlineUsers(peers);
    };

    nalawadeSocket.on("users", handleUsers);

    fetch(`${ENDPOINT}/users?role=employee`)
      .then((res) => res.json())
      .then((data) => {
        const peers = (data.users || [])
          .filter((u) => u.username !== user.username)
          .map((u) => u.username);
        setOnlineUsers(peers);
      })
      .catch((err) => console.warn("Failed to fetch users:", err));

    return () => nalawadeSocket.off("users", handleUsers);
  }, [user, ENDPOINT]);

  return (
    <ThemeProvider role="manager">
      <div className="min-h-screen relative overflow-hidden">
        <OwnerNavbar />
        <Particles count={25} />
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
  return (
    <div
      className="flex rounded-xl mx-4 overflow-hidden"
      style={{
        height: "calc(100vh - 100px)",
        backgroundColor: "#fff8f0", // cream base
        color: "#3e2f1c", // dark brown text
        boxShadow: "0 10px 30px rgba(60,40,20,0.15)",
      }}
    >
      {/* Sidebar */}
      <div className="w-64 border-r border-orange-200 bg-orange-50">
        <h2 className="p-4 font-bold text-lg border-b border-orange-200 text-brown-900">
          Online Employees
        </h2>
        <ul>
          {onlineUsers.length > 0 ? (
            onlineUsers.map((u) => (
              <li
                key={u}
                onClick={() => setActive(u)}
                className={`p-3 cursor-pointer flex items-center gap-2 hover:bg-orange-100 ${
                  active === u ? "bg-orange-200" : ""
                }`}
              >
                <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                <span>{u}</span>
              </li>
            ))
          ) : (
            <li className="p-4 italic text-brown-500">
              No employees online
            </li>
          )}
        </ul>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-cream-100">
        {active ? (
          <>
            <div className="p-4 border-b border-orange-200 bg-orange-100 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-brown-900">
                Chat with {active}
              </h3>
              <span className="text-sm text-brown-600">
                {user.username}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="self-start bg-orange-200 text-brown-900 px-3 py-2 rounded-lg max-w-xs">
                Hello 👋
              </div>
              <div className="self-end bg-brown-600 text-white px-3 py-2 rounded-lg max-w-xs">
                Hi there!
              </div>
            </div>
            <div className="p-3 border-t border-orange-200 flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-lg border border-orange-300 focus:ring-2 focus:ring-orange-400 outline-none"
              />
              <button className="bg-brown-600 hover:bg-brown-700 text-white px-4 py-2 rounded-lg">
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-brown-600 text-lg">
            Select an employee to start chatting 👋
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import nalawadeSocket from "../lib/nalawadeSocket";

export default function ManagerLogin({ onLogin }) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    const role = "manager";
    nalawadeSocket.auth = { username, role };
    nalawadeSocket.connect();
    nalawadeSocket.once("connect", () => {
      nalawadeSocket.emit("register", { username, role });
      onLogin({ username, role });
    });
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#FFF3E0',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        padding: 40,
        borderRadius: 10,
        backgroundColor: '#fff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#FF9800', marginBottom: 20 }}>Manager Chat Login</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <input
            placeholder="Your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 8,
              border: '1px solid #FF9800',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            style={{
              padding: "12px 20px",
              backgroundColor: '#FF9800',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              transition: 'background-color 0.3s ease'
            }}
          >
            Enter Chat
          </button>
        </form>
      </div>
    </div>
  );
}
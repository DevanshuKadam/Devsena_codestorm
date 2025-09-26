import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "./Theme";

function makeRoom(a, b) {
  return [a, b].sort().join("#");
}

export default function ChatWindow({ me, other, socket }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const room = makeRoom(me, other);
  const theme = useTheme();

  useEffect(() => {
    // Join the room
    socket.emit("join_room", { room });

    // Fetch previous messages
    fetch(`${import.meta.env.VITE_SOCKET_ENDPOINT}/rooms/${encodeURIComponent(room)}/messages`)
      .then(res => res.json())
      .then(data => setMessages(data.messages || []));

    // Handle incoming messages
    const handleMessage = (msg) => {
      if (makeRoom(msg.from, msg.to) === room) setMessages(prev => [...prev, msg]);
    };

    socket.on("private_message", handleMessage);
    return () => socket.off("private_message", handleMessage);
  }, [other, room]); // Add room to dependencies

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e?.preventDefault();
    if (!text.trim()) return;

    const payload = { from: me, to: other, content: text };
    socket.emit("private_message", payload);
    setText("");
  };

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      height: "100%",
      backgroundColor: theme.background
    }}>
      <div style={{
        padding: 15,
        borderBottom: `1px solid ${theme.card}`,
        backgroundColor: theme.card,
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        fontWeight: '600',
        fontSize: '1.2rem',
        color: theme.primary,
        position: 'sticky',
        top: 0,
        zIndex: 1
      }}>
        Chat with {other}
      </div>
      <div style={{
        flex: 1,
        padding: 20,
        overflowY: "auto",
        display: 'flex',
        flexDirection: 'column'
      }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.from === me ? "flex-end" : "flex-start",
              marginBottom: 12
            }}
          >
            <div
              style={{
                background: m.from === me ? theme.primary : theme.card,
                color: m.from === me ? '#fff' : theme.text,
                padding: "10px 15px",
                borderRadius: 15,
                maxWidth: "70%",
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                wordBreak: 'break-word',
                transition: 'transform 120ms ease',
              }}
            >
              <div>{m.content}</div>
              <div style={{
                fontSize: 10,
                color: m.from === me ? 'rgba(255,255,255,0.7)' : '#888',
                marginTop: 4,
                textAlign: m.from === me ? 'right' : 'left'
              }}>
                {new Date(m.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} style={{
        padding: 15,
        borderTop: `1px solid ${theme.card}`,
        backgroundColor: theme.card,
        display: 'flex',
        alignItems: 'center'
      }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Message ${other}...`}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 25,
            border: `1px solid ${theme.primary}`,
            outline: 'none',
            fontSize: '1rem'
          }}
        />
        <button
          type="submit"
          style={{
            padding: "12px 20px",
            marginLeft: 10,
            backgroundColor: theme.primary,
            color: '#fff',
            border: 'none',
            borderRadius: 25,
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'transform 120ms ease, background-color 0.3s ease'
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
import React from "react";
import { useTheme } from "./Theme";

export default function ChatList({ users, onSelect, selected }) {
  const theme = useTheme();

  return (
    <div style={{
      width: 280,
      borderRight: `1px solid ${theme.card}`,
      padding: 15,
      backgroundColor: theme.card,
      boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
      overflowY: 'auto',
      transition: 'transform 200ms ease',
    }}>
      <h3 style={{
        margin: '0 0 15px',
        color: theme.primary,
        fontSize: '1.4rem',
        fontWeight: '600'
      }}>Online Users</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {users.map(u => (
          <li
            key={u}
            onClick={() => onSelect(u)}
            style={{
              padding: "12px 10px",
              cursor: "pointer",
              background: selected === u ? theme.primary : "transparent",
              color: selected === u ? '#fff' : theme.text,
              borderRadius: 8,
              marginBottom: 5,
              transition: 'transform 120ms ease, box-shadow 200ms ease, background 200ms ease',
              fontWeight: selected === u ? 'bold' : 'normal',
              boxShadow: selected === u ? '0 2px 6px rgba(0,0,0,0.15)' : 'none'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {u}
          </li>
        ))}
      </ul>
    </div>
  );
}
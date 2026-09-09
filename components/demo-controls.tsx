"use client";
import { useEffect, useState } from "react";
export default function DemoControls() {
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState("");
  useEffect(() => setShow(new URLSearchParams(window.location.search).get("demo") === "1"), []);
  if (!show) return null;
  return (
    <aside className="demo-controls">
      <b>Demo controls</b>
      <small>
        Simulated current date:{" "}
        {new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </small>
      <button
        onClick={async () => {
          const r = await fetch("/api/demo", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "fast-forward" }),
          });
          setMsg((await r.json()).message);
          location.reload();
        }}
      >
        Fast-forward 7 days
      </button>
      <button onClick={() => setMsg("Run npx prisma db seed to reset demo data.")}>
        Reset demo data
      </button>
      {msg && <small>{msg}</small>}
    </aside>
  );
}

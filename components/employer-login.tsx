"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function EmployerLogin() {
  const router = useRouter();
  const [entityId, setEntityId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const response = await fetch("/api/employer/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entityId, passcode }) });
    const body = await response.json().catch(() => null) as { message?: string } | null;
    setBusy(false);
    if (!response.ok) { setMessage(body?.message ?? "Unable to sign in."); return; }
    router.replace("/employer/dashboard"); router.refresh();
  }

  return <main className="employer-page"><section className="employer-login-card"><p className="employer-kicker">Internal HR tool</p><h1>Employer portal</h1><p className="employer-muted">Review declarations and exit requests for your establishment.</p><form className="employer-form" onSubmit={submit}><label htmlFor="entityId">Establishment entity ID</label><input id="entityId" value={entityId} onChange={(event) => setEntityId(event.target.value)} placeholder="e.g. MHBAN0045612000" required /><label htmlFor="passcode">Passcode</label><input id="passcode" type="password" value={passcode} onChange={(event) => setPasscode(event.target.value)} required /><button className="employer-button" disabled={busy} type="submit">{busy ? "Signing in…" : "Sign in"}</button></form>{message && <p className="employer-message" role="alert">{message}</p>}<p className="employer-hint">Demo passcode: <code>demo1234</code></p></section></main>;
}

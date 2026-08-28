"use client";
import { useState, type FormEvent } from "react";

type FormState = { name: string; relation: string; dob: string; address: string; sharePercent: string };

export default function NominationClient({ initial }: { initial: any[] }) {
  const [nominees, setNominees] = useState(initial);
  const [form, setForm] = useState<FormState>({ name: "", relation: "", dob: "", address: "", sharePercent: "" });
  const [message, setMessage] = useState("");
  const total = nominees.reduce((n, nominee) => n + Number(nominee.sharePercent), 0);
  const fields: { key: keyof FormState; label: string; type: string }[] = [
    { key: "name", label: "Name", type: "text" },
    { key: "relation", label: "Relation", type: "text" },
    { key: "dob", label: "Date of birth", type: "date" },
    { key: "address", label: "Address", type: "text" },
    { key: "sharePercent", label: "Share %", type: "number" },
  ];
  async function submit(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/nominees", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error); return; }
    setNominees([...nominees, result]); setForm({ name: "", relation: "", dob: "", address: "", sharePercent: "" }); setMessage("Nominee added.");
  }
  return <section className="nomination-page"><h1>Nomination</h1>{!nominees.length && <div className="missing-banner">A nominee helps your family receive your PF and pension benefits without unnecessary delay.</div>}{message && <p className="claim-toast">{message}</p>}<div className="nominee-list">{nominees.map((nominee) => <article className="kyc-card" key={nominee.id}><h2>{nominee.name}</h2><p>{nominee.relation} · {Number(nominee.sharePercent)}% share</p><p>{nominee.address || "Address recorded"}</p></article>)}</div><form className="nominee-form" onSubmit={submit}><h2>Add nominee</h2>{fields.map((field) => <label key={field.key}>{field.label}<input type={field.type} value={form[field.key]} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} required /></label>)}<p>Total allocated: {total}% (must equal 100%)</p><button className="primary-button" disabled={total >= 100} type="submit">Add nominee</button></form></section>;
}

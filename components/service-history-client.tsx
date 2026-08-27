"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus, X } from "lucide-react";

type Establishment = { entityId: string; name: string; address: string; epfCode: string; city: string };
type Membership = {
  id: string;
  establishment: Establishment;
  doj: string;
  doe: string | null;
  exitReason: string | null;
  effectiveStatus: "PENDING" | "ACTIVE" | "ENDOFSERVICE";
  source: "HANDSHAKE" | "MIGRATED";
  effectiveVerification: "VERIFIED" | "UNVERIFIED" | "DISPUTED";
  concurrentAcknowledgedAt: string | null;
  exitRequestedAt: string | null;
  exitConfirmedAt: string | null;
  autoAccepted: boolean;
  daysUntilAutoAccept: number | null;
  verificationPending: boolean;
  verificationDaysRemaining: number | null;
};

const statusCopy = {
  PENDING: { label: "PENDING", detail: "Awaiting employer confirmation", className: "status-pending" },
  ACTIVE: { label: "ACTIVE", detail: "Active employment", className: "status-active" },
  ENDOFSERVICE: { label: "ENDOFSERVICE", detail: "Service ended", className: "status-ended" },
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

async function messageFrom(response: Response) {
  const body = await response.json().catch(() => null) as { message?: string } | null;
  return body?.message ?? "Something went wrong. Please try again.";
}

type Conflict = { membershipId: string; company: string };

export function ServiceHistoryClient({ memberships, concurrentWarning }: { memberships: Membership[]; concurrentWarning: string | null }) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [exitMembership, setExitMembership] = useState<Membership | null>(null);
  const [activeConflict, setActiveConflict] = useState<Conflict | null>(null);
  const [pendingAfterExit, setPendingAfterExit] = useState(false);
  const [entityId, setEntityId] = useState("");
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function closeDialogs() {
    setAddOpen(false); setExitMembership(null); setActiveConflict(null); setPendingAfterExit(false); setEstablishment(null); setMessage("");
  }

  async function lookupEstablishment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(""); setEstablishment(null); setBusy(true);
    const response = await fetch(`/api/establishments/lookup?entityId=${encodeURIComponent(entityId.trim())}`);
    setBusy(false); if (!response.ok) { setMessage(await messageFrom(response)); return; }
    setEstablishment(await response.json() as Establishment);
  }

  async function createMembership(options: { concurrentAcknowledged?: boolean; afterExitLoggedForMembershipId?: string } = {}) {
    if (!establishment) return;
    setBusy(true);
    const response = await fetch("/api/memberships", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entityId: establishment.entityId, ...options }) });
    setBusy(false);
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { code?: string; company?: string; membershipId?: string; message?: string } | null;
      if (body?.code === "ACTIVE_EMPLOYMENT_EXISTS" && body.company && body.membershipId) { setActiveConflict({ company: body.company, membershipId: body.membershipId }); return; }
      setMessage(body?.message ?? "Something went wrong. Please try again."); return;
    }
    closeDialogs(); router.refresh();
  }

  async function requestVerification(membershipId: string) {
    setBusy(true);
    const response = await fetch(`/api/memberships/${membershipId}/verification`, { method: "POST" });
    setBusy(false); if (!response.ok) { setMessage(await messageFrom(response)); return; }
    router.refresh();
  }

  async function logExit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!exitMembership) return;
    const form = new FormData(event.currentTarget); setBusy(true);
    const response = await fetch(`/api/memberships/${exitMembership.id}/exit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ doe: form.get("doe"), exitReason: form.get("exitReason") }) });
    setBusy(false); if (!response.ok) { setMessage(await messageFrom(response)); return; }
    const exitedId = exitMembership.id; setExitMembership(null);
    if (pendingAfterExit) { setPendingAfterExit(false); await createMembership({ afterExitLoggedForMembershipId: exitedId }); } else { closeDialogs(); router.refresh(); }
  }

  return (
    <section className="service-history-content">
      <div className="page-heading-row"><div><p className="dashboard-eyebrow">Employment record</p><h1>Service History</h1><p>Review each establishment linked to your UAN.</p></div><button className="primary-action" type="button" onClick={() => { setMessage(""); setAddOpen(true); }}><Plus aria-hidden="true" /> Add employer</button></div>
      {concurrentWarning && <div className="concurrent-banner" role="status"><strong>Concurrent employment needs your acknowledgement</strong><span>{concurrentWarning} have been active together for more than 60 days. Confirm that this is intentional.</span></div>}
      {memberships.length === 0 ? <div className="designed-empty"><Building2 aria-hidden="true" /><h2>No employers added yet</h2><p>Add an establishment to begin your service history.</p><button className="primary-action" type="button" onClick={() => setAddOpen(true)}><Plus aria-hidden="true" /> Add employer</button></div> : <div className="membership-list">
        {memberships.map((membership) => {
          const status = statusCopy[membership.effectiveStatus];
          const showProvenance = membership.source === "MIGRATED" && membership.effectiveVerification === "UNVERIFIED";
          return <article key={membership.id} className="membership-card">
            <div className="membership-card-top"><div><h2>{membership.establishment.name}</h2><p>{membership.establishment.city} <span>•</span> Entity ID: {membership.establishment.entityId}</p></div><span className={`status-chip ${status.className}`}>{status.label}</span></div>
            {showProvenance && <div className="provenance-row"><span className="provenance-badge">Imported from legacy EPFO · unverified</span>{membership.verificationPending ? <span className="status-chip status-pending">Verification requested · {membership.verificationDaysRemaining} days remaining</span> : <button className="secondary-action" type="button" disabled={busy} onClick={() => requestVerification(membership.id)}>Request verification</button>}</div>}
            <dl className="membership-details"><div><dt>Date of joining</dt><dd>{formatDate(membership.doj)}</dd></div><div><dt>Date of exit</dt><dd>{formatDate(membership.doe)}</dd></div><div><dt>Exit reason</dt><dd>{membership.exitReason ?? "—"}</dd></div></dl>
            <div className="membership-footer"><p>{status.detail}</p>{membership.autoAccepted ? <span className="status-chip status-ended">Auto-accepted — employer did not respond within 10 days</span> : membership.exitRequestedAt && !membership.exitConfirmedAt ? <span className="status-chip status-pending">Awaiting employer confirmation — auto-accepts in {membership.daysUntilAutoAccept} days</span> : membership.effectiveStatus === "ACTIVE" ? <button className="secondary-action" type="button" onClick={() => { setMessage(""); setExitMembership(membership); }}>Exit log</button> : null}</div>
          </article>;
        })}
      </div>}
      {(addOpen || exitMembership) && <div className="dialog-backdrop" role="presentation"><section className="app-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button className="dialog-close" type="button" aria-label="Close dialog" onClick={closeDialogs}><X /></button>
        {activeConflict && addOpen ? <><h2 id="dialog-title">Concurrent employment</h2><p>You&apos;re still marked as active at <strong>{activeConflict.company}</strong>. Most people forget to log their exit. Want to do it now?</p><div className="dialog-actions"><button className="primary-action" type="button" disabled={busy} onClick={() => { const conflictMembership = memberships.find((membership) => membership.id === activeConflict.membershipId); if (conflictMembership) { setAddOpen(false); setExitMembership(conflictMembership); setPendingAfterExit(true); } }}>Log exit now</button><button className="secondary-action" type="button" disabled={busy} onClick={() => createMembership({ concurrentAcknowledged: true })}>No, I work at both</button></div></> : addOpen ? <><h2 id="dialog-title">Add employer</h2><p>Search using the establishment entity ID to start a joint declaration.</p><form className="dialog-form" onSubmit={lookupEstablishment}><label htmlFor="entity-id">Entity ID</label><input id="entity-id" value={entityId} onChange={(event) => setEntityId(event.target.value)} required /><button className="primary-action" type="submit" disabled={busy}>{busy ? "Looking up…" : "Lookup establishment"}</button></form>{establishment && <div className="lookup-result"><h3>{establishment.name}</h3><p>{establishment.address}</p><p>{establishment.city} <span>•</span> EPF code: {establishment.epfCode}</p><button className="primary-action" type="button" disabled={busy} onClick={() => createMembership()}>Confirm and send joint declaration</button></div>}</> : exitMembership && <form className="dialog-form" onSubmit={logExit}><h2 id="dialog-title">Log your exit</h2><p>Record the end of your service with {exitMembership.establishment.name}.</p><label htmlFor="doe">Date of exit</label><input id="doe" name="doe" type="date" required /><label htmlFor="exitReason">Reason for exit</label><select id="exitReason" name="exitReason" required defaultValue=""><option value="" disabled>Select a reason</option><option>Resignation</option><option>Retirement</option><option>Termination</option><option>End of contract</option><option>Death</option><option>Other</option></select><button className="primary-action" type="submit" disabled={busy}>{busy ? "Saving…" : "Submit exit log"}</button></form>}
        {message && <p className="dialog-message" role="status">{message}</p>}
      </section></div>}
    </section>
  );
}

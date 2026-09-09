"use client";
import { useState } from "react";
import { formatDate } from "@/lib/format-date";
export default function ProfileKyc({ user }: { user: any }) {
  const [data, setData] = useState(user),
    [busy, setBusy] = useState(""),
    [otp, setOtp] = useState(""),
    [error, setError] = useState(""),
    [diff, setDiff] = useState<any>(null),
    [result, setResult] = useState<any>(null),
    [pan, setPan] = useState(user.pan || ""),
    [account, setAccount] = useState(user.bankAccountNumber || ""),
    [ifsc, setIfsc] = useState(user.bankIfsc || "");
  const verify = async (s: string) => {
    setError("");
    setResult(null);
    if (s === "aadhaar") {
      setBusy("aadhaar");
      setTimeout(() => setBusy("otp"), 3000);
      return;
    }
    setBusy(s);
    setTimeout(
      async () => {
        const r = await fetch("/api/profile/verify", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ section: s, pan, accountNumber: account, ifsc }),
        });
        const d = await r.json();
        setData({ ...data, ...d });
        setResult(d);
        setBusy("");
      },
      s === "pan" ? 2000 : 3000,
    );
  };
  const verifyOtp = async () => {
    if (otp !== "123456") {
      setError("Incorrect OTP. Use 123456 in this demo.");
      return;
    }
    const r = await fetch("/api/profile/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ section: "aadhaar" }),
    });
    setDiff((await r.json()).diff);
    setBusy("");
  };
  const accept = async () => {
    const r = await fetch("/api/profile/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ section: "aadhaar-accept", address: diff.address.new }),
    });
    const d = await r.json();
    setData({ ...data, address: diff.address.new, ...d });
    setDiff(null);
    setResult({ message: "Aadhaar details updated." });
  };
  const save = async (s: string) => {
    const body =
      s === "pan"
        ? { pan }
        : {
            accountNumber: account,
            ifsc,
            bankName: "HDFC Bank",
            bankBranch: "Koregaon Park, Pune",
          };
    const r = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ section: s, ...body }),
    });
    setResult({ message: r.ok ? "Saved. Re-verify to confirm." : "Unable to save." });
  };
  const status = (s: string) =>
    s === "VERIFIED" ? "Verified" : s === "MISMATCH" ? "Mismatch" : "Not verified";
  return (
    <section className="profile-page">
      <h1>Profile & verification</h1>
      {busy && (
        <p className="claim-toast">
          {busy === "otp"
            ? "Enter the 6-digit OTP sent to your Aadhaar-linked mobile."
            : busy === "pan"
              ? "Checking with Income Tax department…"
              : busy === "bank"
                ? "Sending ₹1 to verify the account…"
                : "Requesting OTP from UIDAI…"}
        </p>
      )}
      {error && <p className="claim-toast">{error}</p>}
      {result && (
        <p className="claim-toast">
          {result.message ||
            (result.panVerificationStatus === "VERIFIED"
              ? "Name on PAN matches your Aadhaar record"
              : result.panVerificationStatus
                ? `PAN registry name: ${result.registryName || "Aadhaar record mismatch"}`
                : result.bankVerificationStatus
                  ? `Account holder: ${result.accountHolderName || data.name} — matches your Aadhaar name.`
                  : "")}
        </p>
      )}
      <KycCard title="Aadhaar identity" badge="Verified" last={data.aadhaarVerifiedAt}>
        <dl>
          <dt>Name</dt>
          <dd>{data.name}</dd>
          <dt>Date of birth</dt>
          <dd>{formatDate(data.dob)}</dd>
          <dt>Address</dt>
          <dd>{data.address}</dd>
          <dt>UAN</dt>
          <dd>{data.uan}</dd>
          <dt>Aadhaar</dt>
          <dd>XXXX XXXX {data.aadhaarLast4}</dd>
        </dl>
        {busy === "otp" && (
          <>
            <label>OTP</label>
            <div className="otp-boxes">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <input
                  className="otp-box"
                  maxLength={1}
                  key={i}
                  value={otp[i] || ""}
                  onChange={(e) =>
                    setOtp(otp.slice(0, i) + e.target.value.replace(/\D/g, "") + otp.slice(i + 1))
                  }
                />
              ))}
            </div>
            <button className="primary-button" onClick={verifyOtp}>
              Verify OTP
            </button>
          </>
        )}
        {diff && (
          <div className="diff-panel">
            {Object.entries(diff).map(([k, v]: any) => (
              <p key={k}>
                <b>{k}</b>: <s>{v.old}</s> → {v.new}{" "}
                <span>{v.old === v.new ? "unchanged" : "changed"}</span>
              </p>
            ))}
            <button className="primary-button" onClick={accept}>
              Accept updated details
            </button>
          </div>
        )}
        {!busy && !diff && (
          <button className="primary-button" onClick={() => verify("aadhaar")}>
            Re-verify
          </button>
        )}
      </KycCard>
      <KycCard title="PAN" badge={status(data.panVerificationStatus)} last={data.panVerifiedAt}>
        <label>PAN</label>
        <input
          className="profile-input"
          value={pan}
          onChange={(e) => setPan(e.target.value.toUpperCase())}
        />
        <button className="secondary-action" onClick={() => save("pan")}>
          Save PAN
        </button>
        <button className="primary-button" onClick={() => verify("pan")}>
          Re-verify
        </button>
      </KycCard>
      <KycCard
        title="Bank account"
        badge={status(data.bankVerificationStatus)}
        last={data.bankVerifiedAt}
      >
        <label>Account number</label>
        <input
          className="profile-input"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
        />
        <label>IFSC</label>
        <input
          className="profile-input"
          value={ifsc}
          onChange={(e) => setIfsc(e.target.value.toUpperCase())}
        />
        <p>
          {data.bankName || "HDFC Bank"} · {data.bankBranch || "Koregaon Park, Pune"}
        </p>
        <button className="secondary-action" onClick={() => save("bank")}>
          Save bank details
        </button>
        <button className="primary-button" onClick={() => verify("bank")}>
          Re-verify
        </button>
        <small className="bank-note">
          Your bank details are yours to change. No employer approval needed.
        </small>
      </KycCard>
    </section>
  );
}
function KycCard({
  title,
  badge,
  last,
  children,
}: {
  title: string;
  badge: string;
  last: string | null;
  children: React.ReactNode;
}) {
  return (
    <article className="kyc-card">
      <div className="kyc-card-head">
        <h2>{title}</h2>
        <span className="status-chip status-active">{badge}</span>
      </div>
      <p className="muted">Last verified: {last ? formatDate(last) : "Never"}</p>
      {children}
    </article>
  );
}

"use client";

import { type ClipboardEvent, type FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { getMockEkycProfile } from "@/lib/mock-ekyc";
import { formatAadhaar, isValidAadhaar, normaliseAadhaar } from "@/lib/verhoeff";
import { Logo } from "@/components/logo";

type Mode = "login" | "signup";

const OTP = "123456";

async function readApiMessage(response: Response, fallback: string) {
  const result = (await response.json().catch(() => null)) as { message?: string } | null;
  return result?.message ?? fallback;
}

function OtpBoxes({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  function setDigit(index: number, input: string) {
    const digit = input.replace(/\D/g, "").slice(-1);
    const next = value.padEnd(6, " ").split("");
    next[index] = digit || " ";
    onChange(next.join("").replace(/\s/g, ""));
    if (digit && index < 5) refs.current[index + 1]?.focus();
  }

  function pasteOtp(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      event.preventDefault();
      onChange(pasted);
      refs.current[Math.min(pasted.length, 5)]?.focus();
    }
  }

  return (
    <div className="otp-boxes" aria-label="Six digit verification code">
      {Array.from({ length: 6 }, (_, index) => (
        <input
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          className="otp-box"
          inputMode="numeric"
          aria-label={`Digit ${index + 1}`}
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={value[index] ?? ""}
          onChange={(event) => setDigit(index, event.target.value)}
          onPaste={pasteOtp}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !value[index] && index > 0)
              refs.current[index - 1]?.focus();
          }}
        />
      ))}
    </div>
  );
}

export function AuthFlow({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState("");
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [message, setMessage] = useState("");
  const profile = getMockEkycProfile();
  const isSignup = mode === "signup";

  async function requestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!isValidAadhaar(aadhaar)) {
      setMessage("Enter a valid 12-digit Aadhaar number.");
      return;
    }
    setRequestingOtp(true);
    await new Promise((resolve) => window.setTimeout(resolve, 3_000));
    setRequestingOtp(false);
    setOtpRequested(true);
  }

  async function verifyAadhaarOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (otp !== OTP) {
      setMessage("For this simulated flow, enter 123456.");
      return;
    }
    if (isSignup) {
      setStep(2);
      return;
    }

    setVerifyingOtp(true);
    const response = await fetch("/api/auth/login/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aadhaar: normaliseAadhaar(aadhaar), otp }),
    });
    if (!response.ok) {
      setVerifyingOtp(false);
      setMessage(await readApiMessage(response, "We could not sign you in. Please try again."));
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }

  async function completeSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (emailOtp !== OTP) {
      setMessage("For this simulated flow, enter 123456.");
      return;
    }
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aadhaar: normaliseAadhaar(aadhaar), email, otp: emailOtp }),
    });
    if (!response.ok) {
      setMessage(
        await readApiMessage(response, "We could not complete registration. Please try again."),
      );
      return;
    }
    router.replace("/dashboard?welcome=1");
    router.refresh();
  }

  const aadhaarStep = (
    <>
      <h1 id="auth-heading" className="auth-title">
        {isSignup ? "Create your member account" : "Member sign in"}
      </h1>
      <p className="auth-copy">Verify your identity with Aadhaar to continue.</p>
      {!isSignup && <p className="auth-copy">Seeded-member demo Aadhaar: 1000 0005 4471.</p>}
      {!otpRequested ? (
        <form className="auth-form" onSubmit={requestOtp}>
          <label className="auth-label" htmlFor="aadhaar">
            Aadhaar number
          </label>
          <input
            id="aadhaar"
            className="auth-input"
            inputMode="numeric"
            autoComplete="off"
            placeholder="XXXX XXXX XXXX"
            value={formatAadhaar(aadhaar)}
            onChange={(event) => setAadhaar(normaliseAadhaar(event.target.value))}
          />
          <button className="auth-button" disabled={requestingOtp} type="submit">
            {requestingOtp ? "Requesting OTP from UIDAI" : "Request OTP"}
          </button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={verifyAadhaarOtp}>
          <p className="auth-copy">
            Enter the six-digit OTP sent to your Aadhaar-linked mobile number.
          </p>
          <OtpBoxes value={otp} onChange={setOtp} />
          <button className="auth-button" disabled={verifyingOtp} type="submit">
            {verifyingOtp ? "Verifying Aadhaar…" : "Verify Aadhaar"}
          </button>
        </form>
      )}
    </>
  );

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-heading">
        <div className="auth-brand">
          <Logo size="lg" />
        </div>
        {isSignup && (
          <ol className="auth-progress" aria-label="Registration progress">
            <li className={step >= 1 ? "is-current" : ""}>1. Aadhaar</li>
            <li className={step >= 2 ? "is-current" : ""}>2. Confirm</li>
            <li className={step >= 3 ? "is-current" : ""}>3. Email</li>
          </ol>
        )}
        {step === 1 && aadhaarStep}
        {isSignup && step === 2 && (
          <section>
            <h1 id="auth-heading" className="auth-title">
              Confirm your details
            </h1>
            <p className="auth-copy">These details were returned by the simulated eKYC service.</p>
            <dl className="ekyc-details">
              <div>
                <dt>Name</dt>
                <dd>{profile.name}</dd>
              </div>
              <div>
                <dt>Date of birth</dt>
                <dd>
                  {new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeZone: "UTC" }).format(
                    new Date(`${profile.dob}T00:00:00Z`),
                  )}
                </dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>{profile.address}</dd>
              </div>
            </dl>
            <div className="auth-actions">
              <button className="auth-button" type="button" onClick={() => setStep(3)}>
                These details are correct
              </button>
              <button
                className="auth-link-button"
                type="button"
                onClick={() =>
                  setMessage(
                    "For this demo, mismatches are recorded for follow-up; your details are unchanged.",
                  )
                }
              >
                Report a mismatch
              </button>
            </div>
          </section>
        )}
        {isSignup && step === 3 && (
          <form className="auth-form" onSubmit={completeSignup}>
            <h1 id="auth-heading" className="auth-title">
              Verify your email
            </h1>
            <p className="auth-copy">
              Enter your email and the simulated six-digit verification code.
            </p>
            <label className="auth-label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              className="auth-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <OtpBoxes value={emailOtp} onChange={setEmailOtp} />
            <button className="auth-button" type="submit">
              Create account
            </button>
          </form>
        )}
        {message && (
          <p className="auth-message" role="status">
            {message}
          </p>
        )}
        <p className="auth-switch">
          {isSignup ? "Already have an account? " : "New to EPFO Reimagined? "}
          <Link href={isSignup ? "/login" : "/signup"}>
            {isSignup ? "Sign in" : "Create an account"}
          </Link>
        </p>
        <p className="auth-note">
          Simulated UIDAI flow — production requires AUA/KUA licensing or DigiLocker eKYC.
        </p>
      </section>
    </main>
  );
}

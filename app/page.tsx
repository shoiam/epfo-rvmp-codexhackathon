import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";
import { Logo } from "@/components/logo";

export default async function HomePage() {
  const cookieStore = await cookies();
  const userId = await verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (userId) redirect("/dashboard");
  return <main className="landing-page"><section className="landing-copy"><Logo size="lg"/><p className="landing-eyebrow">EPFO · MEMBER SERVICES</p><div className="landing-main"><h1>Your provident fund.<br/>In your hands.</h1><p className="landing-subhead">See every rupee. Know whose desk your claim is on.<br/>Move it yourself.</p><div className="landing-actions"><Link className="landing-primary" href="/login">Sign in</Link><Link className="landing-secondary" href="/signup">Create account</Link></div></div><p className="landing-demo">Demo · Aadhaar 4444 4444 4471 · OTP 123456</p></section><aside className="landing-panel"><div><p className="landing-panel-kicker">EPFO REIMAGINED</p><h2>Control,<br/>made visible.</h2></div><div className="landing-stats"><p>60M+ members</p><p>15–30 day claim benchmark</p><p>1-click escalation</p></div></aside></main>;
}

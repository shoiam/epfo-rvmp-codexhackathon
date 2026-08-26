import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 text-navy"><span className="grid h-10 w-10 place-items-center rounded bg-navy font-bold text-white">EP</span><span className="font-semibold">EPFO Reimagined</span></div>
        <h1 className="mt-8 text-2xl font-semibold text-slate-900">Member sign in</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">A signed, secure member session will be implemented here. NextAuth is not used.</p>
        <Button asChild className="mt-8 w-full"><Link href="/dashboard">View portal scaffold</Link></Button>
      </section>
    </main>
  );
}

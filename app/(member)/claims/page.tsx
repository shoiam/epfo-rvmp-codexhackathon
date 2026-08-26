import Link from "next/link";

import { PlaceholderPage } from "@/components/placeholder-page";
import { Button } from "@/components/ui/button";

export default function ClaimsPage() {
  return <PlaceholderPage title="Claims" description="Track your submitted claims and see exactly where each one is in the process.">
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-dashed border-slate-300 bg-white px-6 py-10">
      <div><p className="font-medium text-slate-800">No claims to show</p><p className="mt-1 text-sm text-slate-500">Start a claim when you are ready.</p></div>
      <Button asChild><Link href="/claims/new">Start a claim</Link></Button>
    </div>
  </PlaceholderPage>;
}

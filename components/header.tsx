import Link from "next/link";
import { ChevronDown, Download, LogOut, UserRound } from "lucide-react";
import { getSessionUserId } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function Header() {
  const userId = await getSessionUserId();
  const user = userId ? await prisma.user.findUnique({ where: { id: userId }, select: { uan: true } }) : null;
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
      <Link href="/dashboard" className="flex items-center gap-3 font-semibold text-navy" aria-label="EPFO Reimagined dashboard">
        <span className="grid h-9 w-9 place-items-center rounded bg-navy text-sm font-bold text-white">EP</span>
        <span className="hidden sm:block">EPFO Reimagined</span>
      </Link>
      <details className="relative">
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-200 text-navy"><UserRound className="h-4 w-4" /></span>
          <span className="hidden text-left sm:block"><span className="block text-xs text-slate-500">UAN</span><span className="font-medium">{user?.uan ?? "Not signed in"}</span></span>
          <ChevronDown className="h-4 w-4" />
        </summary>
        <div className="absolute right-0 z-20 mt-2 w-56 rounded-md border border-slate-200 bg-white p-2 shadow-lg">
          <p className="px-3 py-2 text-xs text-slate-500">UAN: {user?.uan ?? "Available after sign-in"}</p>
          <Link href="/dashboard/passbook" className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-slate-100"><Download className="h-4 w-4" />Download Passbook</Link>
          <Link href="/profile" className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-slate-100"><UserRound className="h-4 w-4" />Profile</Link>
          <form action="/api/auth/logout" method="post">
            <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-red-700 hover:bg-red-50" type="submit"><LogOut className="h-4 w-4" />Logout</button>
          </form>
        </div>
      </details>
    </header>
  );
}

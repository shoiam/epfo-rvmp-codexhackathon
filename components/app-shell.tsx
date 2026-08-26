import type { ReactNode } from "react";

import { Header } from "@/components/header";
import { SidebarNav } from "@/components/sidebar-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="hidden min-h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-slate-200 bg-white pt-5 md:block">
          <p className="px-6 pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Member portal</p>
          <SidebarNav />
        </aside>
        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12">{children}</main>
      </div>
    </div>
  );
}

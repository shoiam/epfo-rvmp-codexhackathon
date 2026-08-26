import type { ReactNode } from "react";

export function PlaceholderPage({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <section className="mx-auto max-w-5xl">
      <p className="text-sm font-medium text-navy">EPFO member portal</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{description}</p>
      {children ?? (
        <div className="mt-10 rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="font-medium text-slate-800">Nothing to show yet</p>
          <p className="mt-1 text-sm text-slate-500">This space will show your member information once it is available.</p>
        </div>
      )}
    </section>
  );
}

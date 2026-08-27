# AGENTS.md
Read SPEC.md before any task. It is the source of truth.

Setup:  npm install && npx prisma migrate dev && npx prisma db seed
Verify: npm run build   (must pass with zero type errors before you finish)

Rules:
- Never install NextAuth. Auth is a signed httpOnly cookie holding userId.
- Time-based rules (10-day exit auto-accept, 7-day escalation) are DERIVED ON
  READ. Never add a cron, scheduler, or background job.
- Membership status logic lives only in lib/membership-status.ts.
- A reason a machine can catch pre-submission belongs in lib/preflight-rules.ts
  and must never appear in lib/return-reasons.ts.
- Indian number formatting throughout: ₹1,50,000 — not ₹150,000.
- All colour comes from CSS variables in globals.css. Never hardcode a hex or a
  Tailwind colour class (bg-blue-600, text-red-500) in a component.
- Status colours only via .status-* classes. Four states, four colours, no others.
- Do not restyle during feature work. Visual polish happens in one final pass.
- NEVER read membership.status directly in a component, route handler, or query
  filter. It is raw storage and is frequently stale by design.
  Always go through getEffectiveStatus() in lib/membership-status.ts.
  The seeded Cygnet membership stores ACTIVE but is truly ENDOFSERVICE — if a
  screen shows Cygnet as ACTIVE, that is the bug.
- Claim eligibility, advance limits, and preflight checks read from real
  membership and contribution data. Never hardcode a pass.
- Every claim amount and balance is computed from Contribution rows where
  depositedAt IS NOT NULL. Undeposited months never count toward a balance.

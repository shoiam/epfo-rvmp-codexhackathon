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

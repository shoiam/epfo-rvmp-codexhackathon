# EPFO Reimagined — Planned Scaffold

This is the intended file and route structure for the initial Next.js 15 App Router build. It is a plan only; no application code is created yet.

```text
.
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (member)/
│   │   ├── layout.tsx                         # Protected shell: header + sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── service-history/
│   │   │   └── page.tsx
│   │   ├── claims/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [claimId]/
│   │   │       └── page.tsx
│   │   ├── passbook/
│   │   │   └── page.tsx
│   │   ├── nomination/
│   │   │   └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── logout/route.ts
│   │   ├── claims/
│   │   │   ├── route.ts
│   │   │   └── [claimId]/
│   │   │       ├── route.ts
│   │   │       └── escalate/route.ts
│   │   ├── grievances/
│   │   │   └── route.ts
│   │   ├── nominees/
│   │   │   └── route.ts
│   │   └── passbook/
│   │       └── download/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                                # Redirects to login or dashboard
├── components/
│   ├── app-shell.tsx
│   ├── header.tsx
│   ├── sidebar-nav.tsx
│   ├── avatar-menu.tsx
│   ├── empty-state.tsx
│   ├── status-badge.tsx
│   ├── dashboard/
│   │   ├── balance-summary.tsx
│   │   ├── contribution-health.tsx
│   │   └── attention-panel.tsx
│   ├── service-history/
│   │   └── membership-timeline.tsx
│   ├── claims/
│   │   ├── claim-list.tsx
│   │   ├── claim-stage-timeline.tsx
│   │   ├── escalate-claim-button.tsx
│   │   └── claim-form.tsx
│   ├── passbook/
│   │   ├── contribution-table.tsx
│   │   ├── contribution-chart.tsx
│   │   └── raise-grievance-dialog.tsx
│   ├── nomination/
│   │   ├── nominee-list.tsx
│   │   └── nominee-form.tsx
│   └── ui/                                    # shadcn/ui generated primitives
├── lib/
│   ├── auth.ts                                # Signed cookie creation/verification
│   ├── auth-guard.ts                          # Protected-route helpers
│   ├── prisma.ts                              # Prisma client singleton
│   ├── permissions.ts                         # Ownership checks
│   ├── derived-status.ts                      # 10-day exit and 7-day escalation rules
│   ├── validations.ts                         # Input schemas
│   ├── format.ts
│   └── constants.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── types/
│   └── index.ts
├── public/
│   └── epfo-logo.svg
├── middleware.ts                              # Session-aware route protection
├── components.json                            # shadcn/ui configuration
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
├── .env.example                               # DATABASE_URL and cookie-signing secret
├── SPEC.md
└── SCAFFOLD.md
```

## Route Map

| Route | Purpose |
| --- | --- |
| `/login` | Member sign-in and signed session creation |
| `/dashboard` | PF/pension summary and attention items |
| `/service-history` | Membership and employer history |
| `/claims` | Claim list |
| `/claims/new` | Start a new claim |
| `/claims/[claimId]` | Claim details, documents, stages, and escalation action |
| `/passbook` | Contributions, trends, and missing-deposit grievance entry point |
| `/nomination` | Nominee management and share validation |
| `/profile` | Personal and contact information |
| `/api/auth/login` | Creates the signed `httpOnly` userId cookie |
| `/api/auth/logout` | Clears the session cookie |
| `/api/claims` | Claim creation/list mutations as needed |
| `/api/claims/[claimId]` | Claim-specific operations |
| `/api/claims/[claimId]/escalate` | Escalation submission after server-side eligibility check |
| `/api/grievances` | Grievance creation |
| `/api/nominees` | Nominee mutations |
| `/api/passbook/download` | Authenticated passbook export |

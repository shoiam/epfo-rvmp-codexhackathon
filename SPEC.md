# EPFO Reimagined — Product Specification

## 1. Purpose

EPFO Reimagined redesigns India’s Employees’ Provident Fund Organisation member portal around a single principle: members should have direct, understandable control over their PF and pension records.

The product makes employment memberships, monthly contributions, claim progress, nominees, and grievances easy to inspect and act on. It should feel trustworthy and official without being dense, opaque, or bureaucratic.

## 2. Technology Stack

| Area           | Choice                                          |
| -------------- | ----------------------------------------------- |
| Framework      | Next.js 15 using the App Router                 |
| Language       | TypeScript                                      |
| Styling        | Tailwind CSS                                    |
| Components     | shadcn/ui                                       |
| Database ORM   | Prisma                                          |
| Database       | PostgreSQL hosted on Neon                       |
| Charts         | Recharts                                        |
| Deployment     | Vercel                                          |
| Authentication | A signed, `httpOnly` cookie containing `userId` |

Authentication must not use NextAuth. The server verifies the signed cookie on each protected request and resolves its `userId` to the current user.

## 3. Data Model

Prisma models will represent the following entities and fields. Database constraints and relations should enforce the ownership paths described below.

### User

`User(id, uan, aadhaarLast4, name, dob, address, email, emailVerified)`

- `uan` is the member’s unique UAN.
- `aadhaarLast4` stores only the last four Aadhaar digits.
- A user has memberships, claims, nominees, and grievances.

### Establishment

`Establishment(id, entityId, name, address, epfCode, city)`

- An establishment can have many memberships.
- `entityId` identifies the employer entity; `epfCode` is the establishment EPF code.

### Membership

`Membership(id, userId, establishmentId, status PENDING|ACTIVE|ENDOFSERVICE, doj, doe, exitReason, joinDeclaredAt, joinConfirmedAt, exitRequestedAt, exitConfirmedAt)`

- Belongs to one user and one establishment.
- Has many contributions and claims.
- `doj` is the date of joining; `doe` is the date of exit when applicable.
- The declared/confirmed timestamps distinguish employee/employer workflow events.

### Contribution

`Contribution(id, membershipId, month, wages, eeShare, erShare, epsShare, depositedAt NULLABLE, interestCredited)`

- Belongs to one membership.
- `month` identifies the contribution period.
- `depositedAt = null` means the contribution has not yet been deposited and must be visibly flagged.
- May be referenced by grievances.

### Claim

`Claim(id, userId, membershipId, formType, amount, purpose, status, createdAt)`

- Belongs to one user and one membership.
- Has ordered claim stages and uploaded documents.

### ClaimStage

`ClaimStage(id, claimId, seq, stageName, officerName, officerDesignation, office, enteredAt, exitedAt, escalatedFrom)`

- Belongs to one claim.
- `seq` establishes the ordered journey through processing stages.
- `exitedAt` is nullable while a stage is current.
- `escalatedFrom`, if set, retains the source stage/escalation context.

### Document

`Document(id, claimId, docType, filename, sizeBytes, uploadedAt)`

- Belongs to one claim.
- Stores file metadata only; file-storage integration can be specified separately.

### Nominee

`Nominee(id, userId, name, relation, dob, sharePercent)`

- Belongs to one user.
- Nominee shares should total 100% for a completed nomination.

### Grievance

`Grievance(id, userId, contributionId, subject, status, createdAt)`

- Belongs to one user and concerns one contribution.
- Used to raise issues such as missing or incorrect deposits.

## 4. Derived Time-Based Rules

These rules are calculated when data is read. They must never depend on cron jobs, scheduled workers, or persistent status mutations solely caused by elapsed time.

### Unanswered exit request

When a membership has an `exitRequestedAt` value, no `exitConfirmedAt`, and the request is at least 10 days old, readers must treat it as `ENDOFSERVICE`.

- The effective read status is `ENDOFSERVICE`.
- The UI should communicate that the exit was deemed accepted after the response window elapsed.
- This effective status is derived; the stored membership status is not changed solely due to time passing.

### Stalled claim stage

The current claim stage unlocks an **Escalate** action when it has remained open for at least 7 days.

- A current stage is a `ClaimStage` with `exitedAt = null`.
- Eligibility is derived from `now - enteredAt >= 7 days`.
- The action must be unavailable before that threshold and clearly available afterwards.

All calculations should use a consistent server-side clock and make the time threshold clear in the interface.

## 5. Information Architecture

Authenticated members use a persistent left sidebar with these destinations:

1. Dashboard
2. Service History
3. Claims
4. Passbook
5. Nomination
6. Profile

The application header has:

- EPFO logo/wordmark at left.
- An avatar dropdown at right containing the member’s UAN, **Download Passbook**, **Profile**, and **Logout**.

The active navigation item must be visually distinct and every protected destination must resolve identity from the signed session cookie.

## 6. Screen Requirements

### Dashboard

Provide a member-first summary of PF and pension information, including active membership, balances/summary metrics, recent contribution health, and claims needing attention. Surface missing contributions and eligible claim escalations prominently but without alarmist language.

### Service History

Show all employer memberships in chronological form with employer details, joining/exit dates, reason for exit, and status. Pending employer confirmations and derived exit acceptance must be understandable and actionable where appropriate.

### Claims

List claims and provide a detailed claim view with amount, form type, purpose, documents, and an ordered stage timeline. For the current stage, render the escalation affordance only when its derived seven-day eligibility is met.

### Passbook

Present monthly contributions by membership, including wages, employee share, employer share, EPS share, interest, and deposit status. Use charts only where they clarify trends. Clearly mark contributions with no `depositedAt` as missing and make it possible to start a linked grievance.

### Nomination

Display and manage nominees, their relationship, dates of birth, and percentage shares. Show a clear completion/validation state for whether shares total 100%.

### Profile

Show the member’s UAN, masked Aadhaar reference, personal details, contact details, verification state, and address. Clearly separate immutable identity details from editable contact/address information if editing is introduced.

## 7. Visual and Interaction Design

- Use Inter as the application typeface.
- Use a restrained, government-appropriate visual system: deep navy as the primary color, white surfaces, amber for warnings, red for missing contributions, and green for active/healthy states.
- Favor generous whitespace, clear labels, strong hierarchy, and calm surfaces over dense tables or decorative effects.
- Use shadcn/ui primitives consistently for controls, menus, dialogs, sheets, tables, badges, and form feedback.
- Preserve accessible contrast, keyboard navigation, semantic landmarks, visible focus states, and descriptive labels for status indicators.
- Never rely on color alone to communicate a status; pair it with text and, where useful, an icon.
- Every list or collection view must have an intentional empty state with a concise explanation and an appropriate next action when one exists.
- Handle loading, error, and no-data states deliberately across all member-facing views.

## 8. Security and Privacy

- Store session identity only in a signed `httpOnly`, `Secure` (in production), `SameSite` cookie.
- Validate the cookie signature server-side and reject malformed, expired, or unknown user identities.
- Keep authorization server-side: a user may access only their memberships, contributions, claims, documents, nominees, and grievances.
- Do not expose full Aadhaar numbers; only `aadhaarLast4` is stored and displayed in masked form.
- Validate all user-supplied input and protect state-changing actions from CSRF according to the selected session implementation.
- Avoid logging sensitive personal or financial data.

## 9. Non-Goals for the Initial Build

- Employer, officer, or administrator portals.
- Real EPFO integration or production identity verification.
- Automated scheduled jobs for the two derived time-based rules.
- NextAuth or other third-party authentication frameworks.

# EPFO Reimagined demo smoke checklist

1. Seed the database with `npx prisma db seed` and confirm the summary reports 3 claims, 1 returned claim, and 2 missing Northwind deposits.
2. Open `/login`, use the seeded Aadhaar ending `4471`, enter OTP `123456`, and confirm redirect to `/dashboard`.
3. Open `/dashboard`: confirm Arjun's corpus, claim badge, missing-deposit badge, and nominee warning are populated.
4. Open `/dashboard/passbook`: confirm the missing banner, red March/April 2026 rows, and use **Raise grievance**. Confirm a success toast and a `Grievance` row in the database.
5. Open `/dashboard/claims`, select **Track claims**, expand the returned Form-31 claim, click its evidence link, and confirm the passbook opens at the affected row.
6. Return to the claim and click the recovery remedy. Confirm it reuses the existing contribution grievance and shows a confirmation toast.
7. Use `/employer/login` with a seeded establishment entity ID and `demo1234`; approve a pending declaration, return to member service history, refresh, and confirm the effective status is ACTIVE.
8. With `?demo=1`, click **Fast-forward 7 days** and confirm the pending exit auto-accepts and the open claim stage becomes escalation-eligible.

import { MembershipStatus, PrismaClient } from "@prisma/client";

import { canEscalateClaimStage } from "../lib/claim-stage-status";
import { getEffectiveStatus } from "../lib/membership-status";
import { formatFormType } from "../lib/claim-forms";

const prisma = new PrismaClient();

const DAY_MS = 24 * 60 * 60 * 1000;
const EPF_RATE = 0.12;
const EPS_RATE = 0.0833;
const EPS_WAGE_CAP = 15_000;
const ANNUAL_INTEREST_RATE = 0.0825;

function date(year: number, month: number, day = 1) {
  return new Date(Date.UTC(year, month - 1, day));
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * DAY_MS);
}

function addMonths(start: Date, months: number) {
  return date(start.getUTCFullYear(), start.getUTCMonth() + months + 1, 1);
}

function roundCurrency(amount: number) {
  return Math.round(amount * 100) / 100;
}

function formatMonth(month: Date) {
  return new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric", timeZone: "UTC" }).format(month);
}

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function createCygnetContributions(membershipId: string) {
  const start = date(2019, 7);
  let pfBalance = 0;

  return Array.from({ length: 46 }, (_, index) => {
    const month = addMonths(start, index);
    const wages = roundCurrency(45_000 + (23_000 * index) / 45);
    const eeShare = roundCurrency(wages * EPF_RATE);
    const epsShare = roundCurrency(Math.min(wages, EPS_WAGE_CAP) * EPS_RATE);
    const erShare = roundCurrency(wages * EPF_RATE - epsShare);
    const interestCredited = month.getUTCMonth() === 2 ? roundCurrency(pfBalance * ANNUAL_INTEREST_RATE) : 0;

    pfBalance += eeShare + erShare + interestCredited;

    return {
      membershipId,
      month,
      wages,
      eeShare,
      erShare,
      epsShare,
      depositedAt: new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 12)),
      interestCredited,
    };
  });
}

function createNorthwindContributions(membershipId: string) {
  const start = date(2023, 6);
  const missingDepositMonths = new Set(["2026-03-01", "2026-04-01"]);

  return Array.from({ length: 38 }, (_, index) => {
    const month = addMonths(start, index);
    const monthsSinceApril2024 = Math.max(0, (month.getUTCFullYear() - 2024) * 12 + month.getUTCMonth() - 3);
    const step = Math.floor(monthsSinceApril2024 / 12);
    const wages = Math.min(92_000, 78_000 + step * 5_000);
    const eeShare = roundCurrency(wages * EPF_RATE);
    const epsShare = roundCurrency(EPS_WAGE_CAP * EPS_RATE);
    const erShare = roundCurrency(wages * EPF_RATE - epsShare);
    const monthKey = month.toISOString().slice(0, 10);

    return {
      membershipId,
      month,
      wages,
      eeShare,
      erShare,
      epsShare,
      depositedAt: missingDepositMonths.has(monthKey)
        ? null
        : new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 12)),
      interestCredited: 0,
    };
  });
}

function createHalcyonContributions(membershipId: string) {
  const start = date(2016, 8);
  return Array.from({ length: 34 }, (_, index) => {
    const month = addMonths(start, index);
    const wages = roundCurrency(28_000 + (13_000 * index) / 33);
    const eeShare = roundCurrency(wages * EPF_RATE);
    const epsShare = roundCurrency(Math.min(wages, EPS_WAGE_CAP) * EPS_RATE);
    const erShare = roundCurrency(wages * EPF_RATE - epsShare);
    return {
      membershipId,
      month,
      wages,
      eeShare,
      erShare,
      epsShare,
      depositedAt: new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 12)),
      interestCredited: 0,
      source: "MIGRATED" as const,
    };
  });
}

async function clearExistingDemoData() {
  const demoUsers = await prisma.user.findMany({
    where: { uan: { in: ["100234567890", "100987654321"] } },
    select: { id: true },
  });
  const userIds = demoUsers.map((user) => user.id);

  if (userIds.length === 0) return;

  await prisma.$transaction([
    prisma.document.deleteMany({ where: { claim: { userId: { in: userIds } } } }),
    prisma.claimStage.deleteMany({ where: { claim: { userId: { in: userIds } } } }),
    prisma.claim.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.grievance.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.contribution.deleteMany({ where: { membership: { userId: { in: userIds } } } }),
    prisma.membership.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.nominee.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.user.deleteMany({ where: { id: { in: userIds } } }),
  ]);
}

async function main() {
  await clearExistingDemoData();

  const [cygnet, northwind, vertex, halcyon] = await Promise.all([
    prisma.establishment.upsert({
      where: { entityId: "MHBAN0045612000" },
      update: { name: "Cygnet Technologies Pvt Ltd", address: "Baner Road, Pune, Maharashtra", epfCode: "MHBAN0045612", city: "Pune" },
      create: { entityId: "MHBAN0045612000", name: "Cygnet Technologies Pvt Ltd", address: "Baner Road, Pune, Maharashtra", epfCode: "MHBAN0045612", city: "Pune" },
    }),
    prisma.establishment.upsert({
      where: { entityId: "KABLR0078934000" },
      update: { name: "Northwind Systems India", address: "Outer Ring Road, Bengaluru, Karnataka", epfCode: "KABLR0078934", city: "Bengaluru" },
      create: { entityId: "KABLR0078934000", name: "Northwind Systems India", address: "Outer Ring Road, Bengaluru, Karnataka", epfCode: "KABLR0078934", city: "Bengaluru" },
    }),
    prisma.establishment.upsert({
      where: { entityId: "TNCHN0011223000" },
      update: { name: "Vertex Analytics", address: "OMR, Chennai, Tamil Nadu", epfCode: "TNCHN0011223", city: "Chennai" },
      create: { entityId: "TNCHN0011223000", name: "Vertex Analytics", address: "OMR, Chennai, Tamil Nadu", epfCode: "TNCHN0011223", city: "Chennai" },
    }),
    prisma.establishment.upsert({
      where: { entityId: "TSHYD0033445000" },
      update: { name: "Halcyon Infotech", address: "HITEC City, Hyderabad, Telangana", epfCode: "TSHYD0033445", city: "Hyderabad" },
      create: { entityId: "TSHYD0033445000", name: "Halcyon Infotech", address: "HITEC City, Hyderabad, Telangana", epfCode: "TSHYD0033445", city: "Hyderabad" },
    }),
  ]);

  const arjun = await prisma.user.create({
    data: {
      uan: "100234567890",
      aadhaarLast4: "4471",
      name: "Arjun Rao",
      dob: date(1994, 3, 12),
      address: "Indiranagar, Bengaluru, Karnataka",
      email: "arjun.rao@example.com",
      emailVerified: new Date(),
    },
  });

  const priya = await prisma.user.create({
    data: {
      uan: "100987654321",
      aadhaarLast4: "1038",
      name: "Priya Nambiar",
      dob: date(1996, 9, 18),
      address: "Kakkanad, Kochi, Kerala",
      email: "priya.nambiar@example.com",
      emailVerified: new Date(),
    },
  });

  // Stored as ACTIVE: ENDOFSERVICE is derived by lib/membership-status.ts from the unanswered 11-day exit request.
  const cygnetMembership = await prisma.membership.create({
    data: {
      userId: arjun.id,
      establishmentId: cygnet.id,
      status: MembershipStatus.ACTIVE,
      doj: date(2019, 7),
      doe: date(2023, 4, 30),
      exitReason: "Employee initiated exit",
      joinDeclaredAt: date(2019, 7),
      joinConfirmedAt: date(2019, 7, 3),
      exitRequestedAt: daysAgo(11),
      exitConfirmedAt: null,
    },
  });

  const northwindMembership = await prisma.membership.create({
    data: {
      userId: arjun.id,
      establishmentId: northwind.id,
      status: MembershipStatus.ACTIVE,
      doj: date(2023, 6),
      joinDeclaredAt: date(2023, 6),
      joinConfirmedAt: date(2023, 6, 3),
    },
  });

  const halcyonMembership = await prisma.membership.create({
    data: {
      userId: arjun.id,
      establishmentId: halcyon.id,
      status: MembershipStatus.ENDOFSERVICE,
      doj: date(2016, 8),
      doe: date(2019, 6, 15),
      exitReason: "End of contract",
      joinDeclaredAt: date(2016, 8),
      joinConfirmedAt: date(2016, 8, 3),
      source: "MIGRATED",
      verification: "UNVERIFIED",
    },
  });

  await prisma.$transaction([
    prisma.contribution.createMany({ data: createCygnetContributions(cygnetMembership.id) }),
    prisma.contribution.createMany({ data: createNorthwindContributions(northwindMembership.id) }),
    prisma.contribution.createMany({ data: createHalcyonContributions(halcyonMembership.id) }),
  ]);

  await prisma.claim.create({
    data: {
      userId: arjun.id,
      membershipId: northwindMembership.id,
      formType: "F31",
      amount: 150_000,
      purpose: "Medical treatment",
      status: "IN_PROGRESS",
      createdAt: daysAgo(12),
      stages: {
        create: [
          { seq: 1, stageName: "Submitted", enteredAt: daysAgo(12), exitedAt: daysAgo(12 - 0.1) },
          { seq: 2, stageName: "Scrutiny", enteredAt: daysAgo(11), exitedAt: daysAgo(9) },
          {
            seq: 3,
            stageName: "Verification",
            officerName: "S. Iyer",
            officerDesignation: "Section Supervisor",
            office: "RO Bandra, Mumbai",
            enteredAt: daysAgo(9),
          },
        ],
      },
    },
  });

  const missingRows = await prisma.contribution.findMany({ where: { membershipId: northwindMembership.id, depositedAt: null }, orderBy: { month: "asc" } });
  const returnedStageEnteredAt = daysAgo(6);
  const returnedCumulativeDays = Math.floor((returnedStageEnteredAt.getTime() - daysAgo(17).getTime()) / DAY_MS);
  await prisma.claim.create({
    data: {
      userId: arjun.id,
      membershipId: northwindMembership.id,
      formType: "F31",
      amount: 380_000,
      purpose: "Purchase of house / construction",
      status: "RETURNED",
      correctionRound: 0,
      cumulativeDays: returnedCumulativeDays,
      createdAt: daysAgo(17),
      stages: { create: [
        { seq: 1, stageName: "Submitted", enteredAt: daysAgo(17), exitedAt: daysAgo(16), outcome: "PASSED" },
        { seq: 2, stageName: "Scrutiny", enteredAt: daysAgo(16), exitedAt: daysAgo(11), outcome: "PASSED" },
        { seq: 3, stageName: "Verification", officerName: "S. Iyer", officerDesignation: "Section Supervisor", office: "RO Bandra, Mumbai", enteredAt: returnedStageEnteredAt, outcome: "RETURNED", reasonCode: "EMPLOYER_CONTRIBUTION_GAP", reasonNote: "Contribution not received for 03/2026, 04/2026 — eligible advance amount cannot be computed", evidenceRef: missingRows[0]?.id ?? "2026-03", faultParty: "EMPLOYER" },
      ] },
    },
  });

  await prisma.claim.create({
    data: {
      userId: arjun.id,
      membershipId: cygnetMembership.id,
      formType: "F10C",
      amount: 72_000,
      purpose: "EPS withdrawal benefit",
      status: "SUBMITTED",
      createdAt: daysAgo(3),
      stages: { create: [{ seq: 1, stageName: "Submitted", enteredAt: daysAgo(3), exitedAt: null, outcome: null }] },
    },
  });

  const arjunSummary = await prisma.user.findUniqueOrThrow({
    where: { id: arjun.id },
    include: {
      memberships: {
        include: {
          establishment: true,
          contributions: { orderBy: { month: "asc" } },
          claims: { include: { stages: { orderBy: { seq: "asc" } } } },
        },
        orderBy: { doj: "asc" },
      },
      nominees: true,
    },
  });

  const membershipRows = arjunSummary.memberships.map((membership) => {
    const missingDepositMonths = membership.contributions
      .filter((contribution) => contribution.depositedAt === null)
      .map((contribution) => formatMonth(contribution.month))
      .join(", ") || "None";
    const effectiveStatus = getEffectiveStatus(membership);

    return {
      establishment: membership.establishment.name,
      storedStatus: membership.status,
      effectiveStatus,
      source: membership.source,
      verification: membership.verification,
      contributions: membership.contributions.length,
      missingDepositMonths,
    };
  });

  const claimRows = arjunSummary.memberships.flatMap((membership) => membership.claims.map((claim) => {
    const currentStage = claim.stages.find((stage) => stage.exitedAt === null);
    const escalationUnlocked = currentStage !== undefined && canEscalateClaimStage(currentStage);
    return {
      form: formatFormType(claim.formType),
      amount: formatINR(Number(claim.amount)),
      purpose: claim.purpose,
      status: claim.status,
      reasonCode: claim.stages.find((stage) => stage.outcome === "RETURNED")?.reasonCode ?? "—",
      cumulativeDays: claim.cumulativeDays,
      currentStage: currentStage?.stageName ?? "Complete",
      escalateUnlocked: escalationUnlocked ? "Yes" : "No",
    };
  }));

  console.log("\nEPFO Reimagined demo seed complete\n");
  console.table([{ user: arjunSummary.name, UAN: arjunSummary.uan, nominees: arjunSummary.nominees.length, note: "No nominee — warning state" }, { user: priya.name, UAN: priya.uan, nominees: 0, note: "Zero data — empty-state demo" }]);
  console.log("Establishments:", [cygnet.name, northwind.name, vertex.name, halcyon.name].join(" | "));
  console.table(membershipRows);
  console.table(claimRows);
  const claimCount = await prisma.claim.count({ where: { userId: arjun.id } });
  const returnedCount = await prisma.claim.count({ where: { userId: arjun.id, status: "RETURNED" } });
  const returnedStageCount = await prisma.claimStage.count({ where: { claim: { userId: arjun.id }, outcome: "RETURNED", reasonCode: "EMPLOYER_CONTRIBUTION_GAP" } });
  const seedAssertion = { claimCount, returnedClaims: returnedCount, returnedContributionGapStages: returnedStageCount };
  console.log("Seed assertion:", seedAssertion);
  if (claimCount !== 3 || returnedCount !== 1 || returnedStageCount !== 1) throw new Error(`Seed assertion failed: expected 3 claims, 1 returned claim, 1 contribution-gap return; got ${JSON.stringify(seedAssertion)}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

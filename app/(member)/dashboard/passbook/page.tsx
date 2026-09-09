import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import PassbookDashboard from "@/components/passbook-dashboard";
export default async function DashboardPassbook() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");
  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: { establishment: true, contributions: { orderBy: { month: "asc" } } },
    orderBy: { doj: "asc" },
  });
  const rows = memberships.flatMap((m) =>
    m.contributions.map((c) => ({
      id: c.id,
      month: c.month.toISOString(),
      wages: Number(c.wages),
      ee: Number(c.eeShare),
      er: Number(c.erShare),
      eps: Number(c.epsShare),
      interest: Number(c.interestCredited),
      deposited: !!c.depositedAt,
      employer: m.establishment.name,
      source: c.source,
    })),
  );
  const changes = memberships.map((m) => ({
    date: m.doj.toISOString(),
    name: m.establishment.name,
  }));
  return <PassbookDashboard rows={rows} changes={changes} />;
}

import { redirect } from "next/navigation";

import { getSessionUserId } from "@/lib/current-user";
import { formatINR } from "@/lib/format";
import { prisma } from "@/lib/prisma";

function formatMonth(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
}

export default async function PassbookPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");
  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: { establishment: true, contributions: { orderBy: { month: "desc" } } },
    orderBy: { doj: "desc" },
  });
  const contributions = memberships.flatMap((membership) =>
    membership.contributions.map((contribution) => ({
      ...contribution,
      establishment: membership.establishment.name,
    })),
  );
  return (
    <section className="passbook-content">
      <div className="page-heading-row">
        <div>
          <p className="dashboard-eyebrow">Contribution ledger</p>
          <h1>Passbook</h1>
          <p>Review every recorded PF deposit across your service history.</p>
        </div>
      </div>
      {contributions.length === 0 ? (
        <div className="designed-empty">
          <h2>No contributions yet</h2>
          <p>Your passbook will appear after an employer records a contribution.</p>
        </div>
      ) : (
        <div className="passbook-table-wrap">
          <table className="passbook-table">
            <caption className="sr-only">Monthly provident fund contributions</caption>
            <thead>
              <tr>
                <th>Month</th>
                <th>Employer</th>
                <th>Wages</th>
                <th>Employee share</th>
                <th>Employer share</th>
                <th>EPS share</th>
                <th>Deposit</th>
              </tr>
            </thead>
            <tbody>
              {contributions.map((contribution) => (
                <tr key={contribution.id}>
                  <td>
                    {formatMonth(contribution.month)}
                    {contribution.source === "MIGRATED" && (
                      <span className="provenance-marker" title="Imported from legacy EPFO">
                        Imported
                      </span>
                    )}
                  </td>
                  <td>{contribution.establishment}</td>
                  <td>{formatINR(Number(contribution.wages))}</td>
                  <td>{formatINR(Number(contribution.eeShare))}</td>
                  <td>{formatINR(Number(contribution.erShare))}</td>
                  <td>{formatINR(Number(contribution.epsShare))}</td>
                  <td>
                    {contribution.depositedAt ? (
                      <span className="status-chip status-active">Deposited</span>
                    ) : (
                      <span className="status-chip status-missing">Missing</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

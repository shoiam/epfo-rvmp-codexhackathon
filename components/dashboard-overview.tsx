import Link from "next/link";
import { BookOpen, FileText, Landmark, Users, type LucideIcon } from "lucide-react";

type ActionCard = {
  href: string;
  title: string;
  description: string;
  badge: string;
  badgeClass: "status-active" | "status-pending" | "status-ended" | "status-missing";
  icon: LucideIcon;
};

export function DashboardOverview({
  balance,
  employeeShare,
  employerShare,
  interest,
  claimsInProgress,
  missingMonths,
  nomineeCount,
  pendingDeclarations,
}: {
  balance: string;
  employeeShare: string;
  employerShare: string;
  interest: string;
  claimsInProgress: number;
  missingMonths: number;
  nomineeCount: number;
  pendingDeclarations: number;
}) {
  const actions: ActionCard[] = [
    {
      href: "/dashboard/claims",
      title: "Claims",
      description: "Track your advance and settlement requests.",
      badge: claimsInProgress ? `${claimsInProgress} in progress` : "No claims in progress",
      badgeClass: claimsInProgress ? "status-pending" : "status-active",
      icon: FileText,
    },
    {
      href: "/dashboard/passbook",
      title: "Passbook",
      description: "Review monthly PF and pension deposits.",
      badge: missingMonths ? `⚠ ${missingMonths} months missing` : "All deposits received",
      badgeClass: missingMonths ? "status-missing" : "status-active",
      icon: BookOpen,
    },
    {
      href: "/nomination",
      title: "Nomination",
      description: "Choose who receives your PF benefits.",
      badge: nomineeCount ? "Nomination set up" : "⚠ Not set up",
      badgeClass: nomineeCount ? "status-active" : "status-pending",
      icon: Users,
    },
    {
      href: "/dashboard/service-history",
      title: "Joint Declaration",
      description: "Add or update your employment service record.",
      badge: pendingDeclarations
        ? `${pendingDeclarations} awaiting confirmation`
        : "No action needed",
      badgeClass: pendingDeclarations ? "status-pending" : "status-active",
      icon: Landmark,
    },
  ];

  return (
    <section className="dashboard-content">
      <div className="dashboard-hero">
        <p className="dashboard-eyebrow">Your provident fund</p>
        <h1>EPF Balance</h1>
        <p className="dashboard-balance">{balance}</p>
        <p className="dashboard-split">
          Employee {employeeShare} <span>•</span> Employer {employerShare} <span>•</span> Interest{" "}
          {interest}
        </p>
      </div>
      <div className="dashboard-actions">
        {actions.map(({ href, title, description, badge, badgeClass, icon: Icon }) => (
          <Link key={title} href={href} className="action-card">
            <Icon aria-hidden="true" className="action-card-icon" />
            <h2>{title}</h2>
            <p>{description}</p>
            <span className={`status-chip ${badgeClass}`}>{badge}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

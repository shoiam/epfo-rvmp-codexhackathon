import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import NominationClient from "@/components/nomination-client";
export default async function NominationPage() {
  const id = await getSessionUserId();
  if (!id) redirect("/login");
  const nominees = await prisma.nominee.findMany({
    where: { userId: id },
    orderBy: { createdAt: "asc" },
  });
  return <NominationClient initial={nominees} />;
}

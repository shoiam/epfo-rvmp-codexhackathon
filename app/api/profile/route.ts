import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/current-user";
export async function PATCH(req: Request) {
  const id = await getSessionUserId();
  if (!id) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const b = await req.json();
  if (b.section === "pan") {
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(b.pan || ""))
      return NextResponse.json({ error: "Enter a valid PAN." }, { status: 400 });
    return NextResponse.json(
      await prisma.user.update({
        where: { id },
        data: { pan: b.pan, panVerificationStatus: "NOT_VERIFIED" },
        select: { pan: true },
      }),
    );
  }
  if (b.section === "bank") {
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(b.ifsc || ""))
      return NextResponse.json({ error: "Enter a valid IFSC." }, { status: 400 });
    return NextResponse.json(
      await prisma.user.update({
        where: { id },
        data: {
          bankAccountNumber: b.accountNumber,
          bankIfsc: b.ifsc,
          bankName: b.bankName,
          bankBranch: b.bankBranch,
          bankVerificationStatus: "NOT_VERIFIED",
        },
        select: { bankIfsc: true },
      }),
    );
  }
  return NextResponse.json({ error: "Unknown section." }, { status: 400 });
}

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/current-user";
import ProfileKyc from "@/components/profile-kyc";
export default async function ProfilePage(){const id=await getSessionUserId();if(!id)redirect("/login");const user=await prisma.user.findUnique({where:{id}});if(!user)redirect("/login");return <ProfileKyc user={{...user,dob:user.dob.toISOString(),emailVerified:user.emailVerified?.toISOString()||null,aadhaarVerifiedAt:user.aadhaarVerifiedAt?.toISOString()||null,panVerifiedAt:user.panVerifiedAt?.toISOString()||null,bankVerifiedAt:user.bankVerifiedAt?.toISOString()||null}}/>}

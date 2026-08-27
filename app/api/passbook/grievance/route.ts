import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
export async function POST(req:Request){const userId=await getSessionUserId();if(!userId)return NextResponse.json({error:"Please sign in."},{status:401});const {contributionId}=await req.json();const c=await prisma.contribution.findFirst({where:{id:contributionId,membership:{userId}}});if(!c||c.depositedAt)return NextResponse.json({error:"Contribution not eligible for grievance."},{status:400});await prisma.grievance.create({data:{userId,contributionId:c.id,subject:`Missing contribution for ${c.month.toISOString().slice(0,7)}`,status:"OPEN"}});return NextResponse.json({message:"Grievance raised for this missing contribution."});}

import authOptions from "@/app/auth/authOptions";
import { patchIssueSchema } from "@/app/validationSchemas";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({}, { status: 401 })
    }

    const body = await request.json();
    const { status, title, description, assignedToUserId } = body;

    const issue = await prisma.issue.findUnique({
        where: { id: parseInt(params.id) }
    })

    if (!issue) {
        return NextResponse.json({ error: 'Invalid Issue' }, { status: 404 })
    }


    const validation = patchIssueSchema.safeParse(body);
    if (!validation.success) {
        return NextResponse.json(validation.error.errors, { status: 400 })
    }
    if (assignedToUserId) {
        const user = await prisma.user.findUnique({ where: { id: assignedToUserId } })
        if (!user) {
            return NextResponse.json({ error: 'Invalid User.' }, { status: 400 })
        }
    }

    const updatesIssue = await prisma.issue.update({
        where: { id: issue.id },
        data: {
            status,
            title,
            description,
            assignedToUserId: assignedToUserId || null,
        }
    })

    return NextResponse.json(updatesIssue, { status: 200 })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {

    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({}, { status: 401 })
    }
    const issue = await prisma.issue.findUnique({
        where: { id: parseInt(params.id) }
    })

    if (!issue) {
        return NextResponse.json("Invalid Issuse", { status: 404 })
    }

    await prisma.issue.delete({
        where: { id: issue.id }
    })

    return NextResponse.json("Deleted Successfully");
}
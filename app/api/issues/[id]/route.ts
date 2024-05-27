import { IssueSchema } from "@/app/validationSchemas";
import prisma from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    const body = await request.json();
    const validation = IssueSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json(validation.error.errors, { status: 400 })
    }

    const issue = await prisma.issue.findUnique({
        where: { id: parseInt(params.id) }
    })

    if (!issue) {
        return NextResponse.json({ error: 'Invalid Issue' }, { status: 404 })
    }

    const updatesIssue = await prisma.issue.update({
        where: { id: issue.id },
        data: {
            title: body.title,
            description: body.description,
            status: body.status
        }
    })

    return NextResponse.json(updatesIssue, { status: 200 })
}
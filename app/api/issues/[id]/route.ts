import authOptions from "@/app/auth/authOptions";
import { patchIssueSchema } from "@/app/validationSchemas";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

// Enhanced error handling utility
function createErrorResponse(message: string, status: number, details?: any) {
    return NextResponse.json(
        {
            error: message,
            details,
            timestamp: new Date().toISOString(),
            status
        },
        { status }
    );
}

// Enhanced success response utility
function createSuccessResponse(data: any, message?: string, status: number = 200) {
    return NextResponse.json({
        success: true,
        data,
        message,
        timestamp: new Date().toISOString()
    }, { status });
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Authentication check
        const session = await getServerSession(authOptions);
        if (!session) {
            return createErrorResponse("Authentication required", 401);
        }

        // Parse and validate request body
        let body;
        try {
            body = await request.json();
        } catch (error) {
            return createErrorResponse("Invalid JSON in request body", 400);
        }

        // Validate issue ID
        const issueId = parseInt(params.id);
        if (isNaN(issueId) || issueId <= 0) {
            return createErrorResponse("Invalid issue ID", 400);
        }

        // Validate input data
        const validation = patchIssueSchema.safeParse(body);
        if (!validation.success) {
            return createErrorResponse(
                "Validation failed",
                400,
                validation.error.errors
            );
        }

        const { title, description, assignedToUserId, status } = validation.data;

        // Check if issue exists
        const existingIssue = await prisma.issue.findUnique({
            where: { id: issueId },
            include: { assignedToUser: true }
        });

        if (!existingIssue) {
            return createErrorResponse("Issue not found", 404);
        }

        // Validate assigned user if provided
        if (assignedToUserId) {
            const user = await prisma.user.findUnique({
                where: { id: assignedToUserId }
            });

            if (!user) {
                return createErrorResponse("Assigned user not found", 400);
            }
        }

        // Update the issue
        const updatedIssue = await prisma.issue.update({
            where: { id: issueId },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(status !== undefined && { status }),
                assignedToUserId: assignedToUserId || null,
                updatedAt: new Date()
            },
            include: {
                assignedToUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            }
        });

        return createSuccessResponse(
            updatedIssue,
            "Issue updated successfully"
        );

    } catch (error) {
        console.error('PATCH /api/issues/[id] error:', error);

        // Handle specific Prisma errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return createErrorResponse("Unique constraint violation", 409, error.meta);
            }
            if (error.code === 'P2025') {
                return createErrorResponse("Record not found", 404);
            }
        }

        return createErrorResponse("Internal server error", 500);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Authentication check
        const session = await getServerSession(authOptions);
        if (!session) {
            return createErrorResponse("Authentication required", 401);
        }

        // Validate issue ID
        const issueId = parseInt(params.id);
        if (isNaN(issueId) || issueId <= 0) {
            return createErrorResponse("Invalid issue ID", 400);
        }

        // Check if issue exists
        const existingIssue = await prisma.issue.findUnique({
            where: { id: issueId }
        });

        if (!existingIssue) {
            return createErrorResponse("Issue not found", 404);
        }

        // Check if issue can be deleted (add business logic here)
        if (existingIssue.status === "IN_PROGRESS") {
            return createErrorResponse(
                "Cannot delete issue that is in progress",
                400,
                { currentStatus: existingIssue.status }
            );
        }

        // Delete the issue
        await prisma.issue.delete({
            where: { id: issueId }
        });

        return createSuccessResponse(
            { id: issueId },
            "Issue deleted successfully"
        );

    } catch (error) {
        console.error('DELETE /api/issues/[id] error:', error);

        // Handle specific Prisma errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return createErrorResponse("Issue not found", 404);
            }
        }

        return createErrorResponse("Internal server error", 500);
    }
}

// Optional: Add GET method for fetching single issue
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Validate issue ID
        const issueId = parseInt(params.id);
        if (isNaN(issueId) || issueId <= 0) {
            return createErrorResponse("Invalid issue ID", 400);
        }

        // Fetch issue with related data
        const issue = await prisma.issue.findUnique({
            where: { id: issueId },
            include: {
                assignedToUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            }
        });

        if (!issue) {
            return createErrorResponse("Issue not found", 404);
        }

        return createSuccessResponse(issue, "Issue fetched successfully");

    } catch (error) {
        console.error('GET /api/issues/[id] error:', error);
        return createErrorResponse("Internal server error", 500);
    }
}
// app/api/issues/[id]/route.ts - IMPROVED DELETE FUNCTION
import authOptions from "@/app/auth/authOptions";
import { patchIssueSchema } from "@/app/validationSchemas";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

// Enhanced error handling utility
function createErrorResponse(message: string, status: number, details?: any) {
    console.error(`API Error [${status}]:`, message, details); // Add logging
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
    console.log(`API Success [${status}]:`, message); // Add logging
    return NextResponse.json({
        success: true,
        data,
        message,
        timestamp: new Date().toISOString()
    }, { status });
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        // STEP 1: Await the params first!
        const { id } = await context.params;
        console.log(`🗑️ DELETE request for issue ID: ${id}`); // Debug log

        // Authentication check
        const session = await getServerSession(authOptions);
        if (!session) {
            return createErrorResponse("Authentication required", 401);
        }
        console.log(`✅ User authenticated: ${session.user?.email}`); // Debug log

        // STEP 2: Validate and parse the ID
        const issueId = parseInt(id);
        if (isNaN(issueId) || issueId <= 0) {
            return createErrorResponse("Invalid issue ID", 400, { providedId: id });
        }
        console.log(`🔍 Parsed issue ID: ${issueId}`); // Debug log

        // STEP 3: Check if issue exists and get its current state
        const existingIssue = await prisma.issue.findUnique({
            where: { id: issueId },
            include: {
                assignedToUser: {
                    select: { name: true, email: true }
                }
            }
        });

        if (!existingIssue) {
            return createErrorResponse("Issue not found", 404, { issueId });
        }

        console.log(`📋 Found issue:`, {
            id: existingIssue.id,
            title: existingIssue.title,
            status: existingIssue.status,
            assignedTo: existingIssue.assignedToUser?.name || 'Unassigned'
        }); // Debug log

        // STEP 4: Enhanced business logic for deletion rules
        const deletionRules = {
            // Rule 1: Can't delete issues in progress
            IN_PROGRESS: "Cannot delete issues that are currently in progress. Please change status to OPEN or CLOSED first.",

            // Rule 2: Optional - Uncomment if you want to protect closed issues
            // CLOSED: "Cannot delete completed issues for audit purposes.",
        };

        if (deletionRules[existingIssue.status as keyof typeof deletionRules]) {
            const errorMessage = deletionRules[existingIssue.status as keyof typeof deletionRules];
            console.log(`❌ Deletion blocked:`, {
                issueId,
                status: existingIssue.status,
                reason: errorMessage
            });

            return createErrorResponse(
                errorMessage,
                400,
                {
                    currentStatus: existingIssue.status,
                    allowedStatuses: ['OPEN'], // Only OPEN issues can be deleted
                    issueTitle: existingIssue.title
                }
            );
        }

        // STEP 5: Additional checks (optional business rules)

        // Check if issue is assigned to someone else (optional protection)
        if (existingIssue.assignedToUserId && existingIssue.assignedToUser) {
            console.log(`⚠️ Warning: Deleting issue assigned to ${existingIssue.assignedToUser.name}`);
        }

        // STEP 6: Perform the deletion
        console.log(`🗑️ Proceeding with deletion of issue ${issueId}`);

        await prisma.issue.delete({
            where: { id: issueId }
        });

        console.log(`✅ Successfully deleted issue ${issueId}: "${existingIssue.title}"`);

        return createSuccessResponse(
            {
                id: issueId,
                title: existingIssue.title,
                status: existingIssue.status
            },
            `Issue "${existingIssue.title}" deleted successfully`
        );

    } catch (error) {
        console.error('❌ DELETE /api/issues/[id] error:', error);

        // Handle specific Prisma errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return createErrorResponse("Issue not found or already deleted", 404);
            }
            if (error.code === 'P2003') {
                return createErrorResponse("Cannot delete issue due to related records", 400, {
                    hint: "This issue might have related comments or history that prevent deletion"
                });
            }
        }

        return createErrorResponse("Internal server error occurred while deleting issue", 500);
    }
}

// OPTIONAL: Add a PATCH endpoint to change status before deletion
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

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
        const issueId = parseInt(id);
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

// GET method remains the same...
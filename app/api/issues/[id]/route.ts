// app/api/issues/[id]/route.ts - FIXED: Preserve assignment on status change
import authOptions from "@/app/auth/authOptions";
import { patchIssueSchema } from "@/app/validationSchemas";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

// Enhanced error handling utility
function createErrorResponse(message: string, status: number, details?: any) {
    console.error(`API Error [${status}]:`, message, details);
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
    console.log(`API Success [${status}]:`, message);
    return NextResponse.json({
        success: true,
        data,
        message,
        timestamp: new Date().toISOString()
    }, { status });
}

// Creator-based permission checking
async function checkUserPermissions(
    session: any,
    issue: any,
    operation: 'read' | 'update' | 'delete' | 'status_change' | 'assign'
) {
    const currentUserEmail = session.user?.email;
    const creatorEmail = issue.createdByUser?.email;
    const assignedUserEmail = issue.assignedToUser?.email;

    const isCreator = currentUserEmail === creatorEmail;
    const isAssignee = currentUserEmail === assignedUserEmail;
    const isUnassigned = !assignedUserEmail;

    console.log(`🔐 Permission check (Creator-Based):`, {
        operation,
        currentUser: currentUserEmail,
        creator: creatorEmail,
        assignee: assignedUserEmail,
        isCreator,
        isAssignee,
        isUnassigned,
        issueId: issue.id,
        issueStatus: issue.status
    });

    switch (operation) {
        case 'read':
            return { allowed: true };

        case 'update':
            if (isCreator) {
                return { allowed: true, reason: 'User is the issue creator' };
            }
            return {
                allowed: false,
                reason: `Only the issue creator (${creatorEmail}) can edit this issue`
            };

        case 'status_change':
            if (isUnassigned) {
                return {
                    allowed: false,
                    reason: 'Issue must be assigned to someone before status can be changed'
                };
            }

            if (isAssignee) {
                return { allowed: true, reason: 'User is assigned to this issue' };
            }

            return {
                allowed: false,
                reason: `Only the assigned user (${assignedUserEmail}) can change the status of this issue`
            };

        case 'assign':
            if (isCreator) {
                return { allowed: true, reason: 'User is the issue creator' };
            }
            return {
                allowed: false,
                reason: `Only the issue creator (${creatorEmail}) can assign this issue`
            };

        case 'delete':
            if (issue.status === 'IN_PROGRESS') {
                return {
                    allowed: false,
                    reason: 'Cannot delete issues in progress. Change status first.'
                };
            }

            if (isCreator) {
                return { allowed: true, reason: 'User is the issue creator' };
            }

            return {
                allowed: false,
                reason: `Only the issue creator (${creatorEmail}) can delete this issue`
            };

        default:
            return { allowed: false, reason: 'Unknown operation' };
    }
}

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

        // Get issue with creator and assignee info
        const existingIssue = await prisma.issue.findUnique({
            where: { id: issueId },
            include: {
                createdByUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
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

        if (!existingIssue) {
            return createErrorResponse("Issue not found", 404);
        }

        // 🔧 FIX: Separate different types of operations
        const isStatusChange = status !== undefined && status !== existingIssue.status;
        const isAssignmentChange = assignedToUserId !== undefined;
        const isContentChange = title !== undefined || description !== undefined;

        // Check permissions for each operation type
        if (isStatusChange) {
            console.log(`🔄 Status change attempted:`, {
                from: existingIssue.status,
                to: status,
                user: session.user?.email,
                assignedUser: existingIssue.assignedToUser?.email
            });

            const statusPermission = await checkUserPermissions(session, existingIssue, 'status_change');
            if (!statusPermission.allowed) {
                return createErrorResponse(
                    "Insufficient permissions to change issue status",
                    403,
                    {
                        reason: statusPermission.reason,
                        currentStatus: existingIssue.status,
                        requestedStatus: status,
                        creator: existingIssue.createdByUser?.email || 'Unknown',
                        assignedTo: existingIssue.assignedToUser?.email || 'Unassigned',
                        currentUser: session.user?.email
                    }
                );
            }
        }

        if (isAssignmentChange) {
            const assignPermission = await checkUserPermissions(session, existingIssue, 'assign');
            if (!assignPermission.allowed) {
                return createErrorResponse(
                    "Insufficient permissions to assign this issue",
                    403,
                    {
                        reason: assignPermission.reason,
                        creator: existingIssue.createdByUser?.email || 'Unknown',
                        currentUser: session.user?.email
                    }
                );
            }
        }

        if (isContentChange) {
            const updatePermission = await checkUserPermissions(session, existingIssue, 'update');
            if (!updatePermission.allowed) {
                return createErrorResponse(
                    "Insufficient permissions to update this issue",
                    403,
                    {
                        reason: updatePermission.reason,
                        creator: existingIssue.createdByUser?.email || 'Unknown',
                        currentUser: session.user?.email
                    }
                );
            }
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

        // 🔧 FIX: Build update data properly - only update what was actually sent
        const updateData: any = {
            updatedAt: new Date()
        };

        // Only update fields that were actually provided
        if (title !== undefined) {
            updateData.title = title;
        }

        if (description !== undefined) {
            updateData.description = description;
        }

        if (status !== undefined) {
            updateData.status = status;
        }

        // 🔧 CRITICAL FIX: Only update assignedToUserId if it was explicitly provided
        if (assignedToUserId !== undefined) {
            updateData.assignedToUserId = assignedToUserId || null;
        }
        // 🚨 IMPORTANT: If assignedToUserId is NOT in the request, we DON'T touch it!

        // Log the operation for audit trail
        console.log(`📝 Issue update authorized:`, {
            issueId,
            user: session.user?.email,
            creator: existingIssue.createdByUser?.email,
            currentAssignee: existingIssue.assignedToUser?.email,
            updateData,
            changes: {
                ...(title !== undefined && { title: `"${existingIssue.title}" → "${title}"` }),
                ...(description !== undefined && { description: 'Updated' }),
                ...(status !== undefined && { status: `${existingIssue.status} → ${status}` }),
                ...(assignedToUserId !== undefined && { assignedTo: assignedToUserId || 'Unassigned' })
            }
        });

        // Perform the update
        const updatedIssue = await prisma.issue.update({
            where: { id: issueId },
            data: updateData,
            include: {
                createdByUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
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

        // 🔧 VERIFICATION: Log the result to ensure assignment is preserved
        console.log(`✅ Update completed:`, {
            issueId,
            previousAssignee: existingIssue.assignedToUser?.email,
            newAssignee: updatedIssue.assignedToUser?.email,
            statusChange: isStatusChange ? `${existingIssue.status} → ${updatedIssue.status}` : 'No change',
            assignmentChange: isAssignmentChange ? 'Yes' : 'No'
        });

        return createSuccessResponse(
            updatedIssue,
            `Issue updated successfully${isStatusChange ? ` (status changed to ${status})` : ''}`
        );

    } catch (error) {
        console.error('PATCH /api/issues/[id] error:', error);

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
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        console.log(`🗑️ DELETE request for issue ID: ${id}`);

        const session = await getServerSession(authOptions);
        if (!session) {
            return createErrorResponse("Authentication required", 401);
        }

        const issueId = parseInt(id);
        if (isNaN(issueId) || issueId <= 0) {
            return createErrorResponse("Invalid issue ID", 400, { providedId: id });
        }

        const existingIssue = await prisma.issue.findUnique({
            where: { id: issueId },
            include: {
                createdByUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                assignedToUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (!existingIssue) {
            return createErrorResponse("Issue not found", 404, { issueId });
        }

        const deletePermission = await checkUserPermissions(session, existingIssue, 'delete');
        if (!deletePermission.allowed) {
            return createErrorResponse(
                "Insufficient permissions to delete this issue",
                403,
                {
                    reason: deletePermission.reason,
                    issueStatus: existingIssue.status,
                    creator: existingIssue.createdByUser?.email || 'Unknown',
                    currentUser: session.user?.email,
                    issueTitle: existingIssue.title
                }
            );
        }

        console.log(`🗑️ Issue deletion authorized:`, {
            issueId,
            title: existingIssue.title,
            user: session.user?.email,
            creator: existingIssue.createdByUser?.email
        });

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

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        const issueId = parseInt(id);
        if (isNaN(issueId) || issueId <= 0) {
            return createErrorResponse("Invalid issue ID", 400);
        }

        const issue = await prisma.issue.findUnique({
            where: { id: issueId },
            include: {
                createdByUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
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
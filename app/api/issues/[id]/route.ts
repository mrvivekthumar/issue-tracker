// app/api/issues/[id]/route.ts - SECURE VERSION with Role-Based Access Control
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

// 🔐 SECURITY: Permission checking utility
async function checkUserPermissions(
    session: any,
    issue: any,
    operation: 'read' | 'update' | 'delete' | 'status_change'
) {
    const currentUserId = session.user?.email; // NextAuth typically uses email as identifier
    const assignedUserEmail = issue.assignedToUser?.email;

    console.log(`🔐 Permission check:`, {
        operation,
        currentUser: currentUserId,
        assignedUser: assignedUserEmail,
        issueId: issue.id,
        issueStatus: issue.status
    });

    switch (operation) {
        case 'read':
            // Anyone authenticated can read
            return { allowed: true };

        case 'update':
            // Only assigned user can update basic fields (title, description)
            if (!assignedUserEmail) {
                return {
                    allowed: true, // Unassigned issues can be updated by anyone
                    reason: 'Issue is unassigned'
                };
            }

            if (currentUserId === assignedUserEmail) {
                return { allowed: true, reason: 'User is assigned to this issue' };
            }

            return {
                allowed: false,
                reason: `Only the assigned user (${assignedUserEmail}) can update this issue`
            };

        case 'status_change':
            // 🔐 CRITICAL: Only assigned user can change status
            if (!assignedUserEmail) {
                return {
                    allowed: false,
                    reason: 'Issue must be assigned to someone before status can be changed'
                };
            }

            if (currentUserId === assignedUserEmail) {
                return { allowed: true, reason: 'User is assigned to this issue' };
            }

            return {
                allowed: false,
                reason: `Only the assigned user (${assignedUserEmail}) can change the status of this issue`
            };

        case 'delete':
            // 🔐 CRITICAL: Only assigned user can delete, and only if status allows
            if (issue.status === 'IN_PROGRESS') {
                return {
                    allowed: false,
                    reason: 'Cannot delete issues in progress. Change status first.'
                };
            }

            if (!assignedUserEmail) {
                return {
                    allowed: true, // Unassigned issues can be deleted by anyone
                    reason: 'Issue is unassigned'
                };
            }

            if (currentUserId === assignedUserEmail) {
                return { allowed: true, reason: 'User is assigned to this issue' };
            }

            return {
                allowed: false,
                reason: `Only the assigned user (${assignedUserEmail}) can delete this issue`
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

        // 🔐 STEP 1: Authentication check
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

        // 🔐 STEP 2: Get issue with assigned user info
        const existingIssue = await prisma.issue.findUnique({
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

        if (!existingIssue) {
            return createErrorResponse("Issue not found", 404);
        }

        // 🔐 STEP 3: Check if user is trying to change status
        const isStatusChange = status !== undefined && status !== existingIssue.status;

        if (isStatusChange) {
            console.log(`🔄 Status change attempted:`, {
                from: existingIssue.status,
                to: status,
                user: session.user?.email
            });

            // Check permissions for status change
            const statusPermission = await checkUserPermissions(session, existingIssue, 'status_change');
            if (!statusPermission.allowed) {
                return createErrorResponse(
                    "Insufficient permissions to change issue status",
                    403,
                    {
                        reason: statusPermission.reason,
                        currentStatus: existingIssue.status,
                        requestedStatus: status,
                        assignedTo: existingIssue.assignedToUser?.email || 'Unassigned',
                        currentUser: session.user?.email
                    }
                );
            }
        }

        // 🔐 STEP 4: Check general update permissions (for title, description)
        if (title !== undefined || description !== undefined) {
            const updatePermission = await checkUserPermissions(session, existingIssue, 'update');
            if (!updatePermission.allowed) {
                return createErrorResponse(
                    "Insufficient permissions to update this issue",
                    403,
                    {
                        reason: updatePermission.reason,
                        assignedTo: existingIssue.assignedToUser?.email || 'Unassigned',
                        currentUser: session.user?.email
                    }
                );
            }
        }

        // 🔐 STEP 5: Validate assigned user if provided
        if (assignedToUserId) {
            const user = await prisma.user.findUnique({
                where: { id: assignedToUserId }
            });

            if (!user) {
                return createErrorResponse("Assigned user not found", 400);
            }
        }

        // 🔐 STEP 6: Log the operation for audit trail
        console.log(`📝 Issue update authorized:`, {
            issueId,
            user: session.user?.email,
            changes: {
                ...(title !== undefined && { title: `"${existingIssue.title}" → "${title}"` }),
                ...(description !== undefined && { description: 'Updated' }),
                ...(status !== undefined && { status: `${existingIssue.status} → ${status}` }),
                ...(assignedToUserId !== undefined && { assignedTo: assignedToUserId })
            }
        });

        // 🔐 STEP 7: Perform the update
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
            `Issue updated successfully${isStatusChange ? ` (status changed to ${status})` : ''}`
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
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        console.log(`🗑️ DELETE request for issue ID: ${id}`);

        // 🔐 STEP 1: Authentication check
        const session = await getServerSession(authOptions);
        if (!session) {
            return createErrorResponse("Authentication required", 401);
        }

        // Validate issue ID
        const issueId = parseInt(id);
        if (isNaN(issueId) || issueId <= 0) {
            return createErrorResponse("Invalid issue ID", 400, { providedId: id });
        }

        // 🔐 STEP 2: Get issue with assigned user info
        const existingIssue = await prisma.issue.findUnique({
            where: { id: issueId },
            include: {
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

        // 🔐 STEP 3: Check deletion permissions
        const deletePermission = await checkUserPermissions(session, existingIssue, 'delete');
        if (!deletePermission.allowed) {
            return createErrorResponse(
                "Insufficient permissions to delete this issue",
                403,
                {
                    reason: deletePermission.reason,
                    issueStatus: existingIssue.status,
                    assignedTo: existingIssue.assignedToUser?.email || 'Unassigned',
                    currentUser: session.user?.email,
                    issueTitle: existingIssue.title
                }
            );
        }

        // 🔐 STEP 4: Log deletion for audit trail
        console.log(`🗑️ Issue deletion authorized:`, {
            issueId,
            title: existingIssue.title,
            user: session.user?.email,
            assignedUser: existingIssue.assignedToUser?.email
        });

        // Perform the deletion
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

// GET method with read permissions
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        // Validate issue ID
        const issueId = parseInt(id);
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
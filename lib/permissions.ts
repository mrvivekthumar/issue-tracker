// lib/permissions.ts - Updated for Creator-Based Permission System

import { Session } from 'next-auth';
import { Issue, Status } from '@prisma/client';

export interface UserPermissions {
    canRead: boolean;
    canEdit: boolean;
    canChangeStatus: boolean;
    canDelete: boolean;
    canAssign: boolean;
    reason?: string;
    isCreator: boolean;
    isAssignee: boolean;
    isUnassigned: boolean;
    creatorEmail?: string | null;
    assignedUserEmail?: string | null;
    currentUserEmail?: string;
}

export interface IssueWithUser extends Issue {
    createdByUser?: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
    } | null;
    assignedToUser?: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
    } | null;
}

/**
 * 🔐 NEW PERMISSION SYSTEM - CREATOR-BASED
 * Rules:
 * 1. Issue Creator: Can edit, delete, and assign
 * 2. Issue Assignee: Can only change status (Open, In Progress, Closed)
 * 3. Other Users: Can only read
 */
export function checkIssuePermissions(
    session: Session | null,
    issue: IssueWithUser | null,
    operation?: 'read' | 'edit' | 'status_change' | 'delete' | 'assign'
): UserPermissions {
    // Base permission object
    const basePermissions: UserPermissions = {
        canRead: false,
        canEdit: false,
        canChangeStatus: false,
        canDelete: false,
        canAssign: false,
        isCreator: false,
        isAssignee: false,
        isUnassigned: false,
        creatorEmail: issue?.createdByUser?.email,
        assignedUserEmail: issue?.assignedToUser?.email,
        currentUserEmail: session?.user?.email ?? undefined
    };

    // 🚫 Not authenticated - no access
    if (!session?.user?.email) {
        return {
            ...basePermissions,
            reason: 'Authentication required'
        };
    }

    // 📄 New issue (no existing issue) - creator permissions
    if (!issue) {
        return {
            ...basePermissions,
            canRead: true,
            canEdit: true,
            canChangeStatus: false, // Can't change status of non-existent issue
            canDelete: false,       // Can't delete non-existent issue
            canAssign: true,        // Can assign when creating
            isUnassigned: true
        };
    }

    const currentUserEmail = session.user.email;
    const creatorEmail = issue.createdByUser?.email;
    const assignedUserEmail = issue.assignedToUser?.email;

    const isCreator = currentUserEmail === creatorEmail;
    const isAssignee = currentUserEmail === assignedUserEmail;
    const isUnassigned = !assignedUserEmail;

    // 🔐 NEW PERMISSION RULES
    const permissions: UserPermissions = {
        // ✅ READ: Anyone authenticated can read
        canRead: true,

        // ✏️ EDIT: Only issue creator can edit
        canEdit: isCreator,

        // 🔄 STATUS CHANGE: Only assignee can change status (and issue must be assigned)
        canChangeStatus: isAssignee && !isUnassigned,

        // 🗑️ DELETE: Only issue creator can delete
        canDelete: isCreator,

        // 👤 ASSIGN: Only issue creator can assign/reassign
        canAssign: isCreator,

        isCreator,
        isAssignee,
        isUnassigned,
        creatorEmail,
        assignedUserEmail,
        currentUserEmail
    };

    // 📝 Generate appropriate reason messages
    if (!permissions.canEdit && !isCreator) {
        permissions.reason = `Only the issue creator (${creatorEmail}) can edit this issue`;
    } else if (!permissions.canChangeStatus && isUnassigned) {
        permissions.reason = 'Issue must be assigned before status can be changed';
    } else if (!permissions.canChangeStatus && !isAssignee) {
        permissions.reason = `Only the assigned user (${assignedUserEmail}) can change the status`;
    } else if (!permissions.canDelete && !isCreator) {
        permissions.reason = `Only the issue creator (${creatorEmail}) can delete this issue`;
    } else if (!permissions.canAssign && !isCreator) {
        permissions.reason = `Only the issue creator (${creatorEmail}) can assign this issue`;
    }

    return permissions;
}

/**
 * 🎯 OPERATION-SPECIFIC CHECKERS
 */

export function canUserEditIssue(session: Session | null, issue: IssueWithUser | null): boolean {
    return checkIssuePermissions(session, issue).canEdit;
}

export function canUserChangeStatus(session: Session | null, issue: IssueWithUser | null): boolean {
    return checkIssuePermissions(session, issue).canChangeStatus;
}

export function canUserDeleteIssue(session: Session | null, issue: IssueWithUser | null): boolean {
    return checkIssuePermissions(session, issue).canDelete;
}

export function canUserAssignIssue(session: Session | null, issue: IssueWithUser | null): boolean {
    return checkIssuePermissions(session, issue).canAssign;
}

/**
 * 🛡️ BUSINESS RULE VALIDATORS
 */

export function validateStatusChange(
    session: Session | null,
    issue: IssueWithUser,
    newStatus: Status
): { allowed: boolean; reason?: string } {
    const permissions = checkIssuePermissions(session, issue);

    if (!permissions.canChangeStatus) {
        return {
            allowed: false,
            reason: permissions.reason
        };
    }

    // Additional business rules for status transitions
    const currentStatus = issue.status;

    // Prevent invalid status transitions
    if (currentStatus === 'CLOSED' && newStatus === 'OPEN') {
        return {
            allowed: false,
            reason: 'Closed issues cannot be reopened. Ask the creator to create a new issue.'
        };
    }

    // Require assignment before moving to IN_PROGRESS
    if (newStatus === 'IN_PROGRESS' && !issue.assignedToUser) {
        return {
            allowed: false,
            reason: 'Issue must be assigned to someone before it can be marked as in progress.'
        };
    }

    return { allowed: true };
}

export function validateDeletion(
    session: Session | null,
    issue: IssueWithUser
): { allowed: boolean; reason?: string } {
    const permissions = checkIssuePermissions(session, issue);

    if (!permissions.canDelete) {
        return {
            allowed: false,
            reason: permissions.reason
        };
    }

    // Additional deletion rules
    if (issue.status === 'IN_PROGRESS') {
        return {
            allowed: false,
            reason: 'Cannot delete issues that are in progress. Change status first.'
        };
    }

    return { allowed: true };
}

/**
 * 🔍 DEBUG HELPERS
 */

export function debugPermissions(session: Session | null, issue: IssueWithUser | null): void {
    if (process.env.NODE_ENV !== 'development') return;

    const permissions = checkIssuePermissions(session, issue);

    console.group('🔐 Permission Debug (Creator-Based System)');
    console.log('Session:', {
        authenticated: !!session,
        userEmail: session?.user?.email
    });
    console.log('Issue:', {
        id: issue?.id,
        status: issue?.status,
        createdBy: issue?.createdByUser?.email || 'Unknown',
        assignedTo: issue?.assignedToUser?.email || 'Unassigned'
    });
    console.log('User Roles:', {
        isCreator: permissions.isCreator,
        isAssignee: permissions.isAssignee,
        isUnassigned: permissions.isUnassigned
    });
    console.log('Permissions:', {
        canRead: permissions.canRead,
        canEdit: permissions.canEdit,
        canChangeStatus: permissions.canChangeStatus,
        canDelete: permissions.canDelete,
        canAssign: permissions.canAssign,
        reason: permissions.reason
    });
    console.groupEnd();
}

/**
 * 🏷️ PERMISSION CONSTANTS
 */

export const PERMISSION_MESSAGES = {
    NOT_AUTHENTICATED: 'You must be logged in to perform this action',
    NOT_CREATOR: 'Only the issue creator can perform this action',
    NOT_ASSIGNEE: 'Only the assigned user can change the status',
    UNASSIGNED_ISSUE: 'This issue must be assigned before status can be changed',
    STATUS_CHANGE_DENIED: 'You do not have permission to change the status of this issue',
    EDIT_DENIED: 'You do not have permission to edit this issue',
    DELETE_DENIED: 'You do not have permission to delete this issue',
    ASSIGN_DENIED: 'You do not have permission to assign this issue'
} as const;

export const PERMISSION_TOOLTIPS = {
    EDIT_ALLOWED: 'You can edit this issue because you created it',
    EDIT_DENIED: 'Only the issue creator can edit issues',
    STATUS_ALLOWED: 'You can change the status because you are assigned to this issue',
    STATUS_DENIED: 'Only assigned users can change issue status',
    DELETE_ALLOWED: 'You can delete this issue because you created it',
    DELETE_DENIED: 'Only the issue creator can delete issues',
    ASSIGN_ALLOWED: 'You can assign this issue because you created it',
    ASSIGN_DENIED: 'Only the issue creator can assign this issue'
} as const;

/**
 * 📊 AUDIT LOGGING
 */

export function logPermissionAction(
    action: string,
    session: Session | null,
    issue: IssueWithUser | null,
    success: boolean,
    reason?: string
): void {
    // Only log in production or when explicitly enabled
    if (process.env.NODE_ENV !== 'production' && !process.env.ENABLE_PERMISSION_LOGGING) {
        return;
    }

    const logEntry = {
        timestamp: new Date().toISOString(),
        action,
        user: session?.user?.email || 'anonymous',
        issueId: issue?.id,
        creator: issue?.createdByUser?.email,
        assignedTo: issue?.assignedToUser?.email,
        success,
        reason,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
    };

    console.log('🔐 Permission Action:', logEntry);
}

const PermissionUtils = {
    checkIssuePermissions,
    canUserEditIssue,
    canUserChangeStatus,
    canUserDeleteIssue,
    canUserAssignIssue,
    validateStatusChange,
    validateDeletion,
    debugPermissions,
    logPermissionAction
};

export default PermissionUtils;
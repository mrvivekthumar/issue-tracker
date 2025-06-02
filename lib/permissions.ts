// lib/permissions.ts - Centralized permission checking utilities

import { Session } from 'next-auth';
import { Issue, Status } from '@prisma/client';

export interface UserPermissions {
    canRead: boolean;
    canEdit: boolean;
    canChangeStatus: boolean;
    canDelete: boolean;
    canAssign: boolean;
    reason?: string;
    isAssignedUser: boolean;
    isUnassigned: boolean;
    assignedUserEmail?: string | null;
    currentUserEmail?: string;
}

export interface IssueWithUser extends Issue {
    assignedToUser?: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
    } | null;
}

/**
 * 🔐 CORE PERMISSION CHECKER
 * This is the single source of truth for all permission logic
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
        isAssignedUser: false,
        isUnassigned: false,
        assignedUserEmail: issue?.assignedToUser?.email,
        currentUserEmail: session?.user?.email ?? undefined
    };

    // 🚫 Not authenticated
    if (!session?.user?.email) {
        return {
            ...basePermissions,
            reason: 'Authentication required'
        };
    }

    // 📄 New issue (no existing issue)
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
    const assignedUserEmail = issue.assignedToUser?.email;
    const isAssignedUser = currentUserEmail === assignedUserEmail;
    const isUnassigned = !assignedUserEmail;

    // 🔐 PERMISSION RULES
    const permissions: UserPermissions = {
        // ✅ READ: Anyone authenticated can read
        canRead: true,

        // ✏️ EDIT: Assigned user OR unassigned issues
        canEdit: isAssignedUser || isUnassigned,

        // 🔄 STATUS CHANGE: Only assigned user (issue must be assigned)
        canChangeStatus: isAssignedUser && !isUnassigned,

        // 🗑️ DELETE: Assigned user OR unassigned issues (but not IN_PROGRESS)
        canDelete: (isAssignedUser || isUnassigned) && issue.status !== 'IN_PROGRESS',

        // 👤 ASSIGN: Anyone can assign/reassign (this might vary by your business rules)
        canAssign: true,

        isAssignedUser,
        isUnassigned,
        assignedUserEmail,
        currentUserEmail
    };

    // 📝 Generate appropriate reason messages
    if (!permissions.canEdit && !isUnassigned) {
        permissions.reason = `Only ${assignedUserEmail} can edit this issue`;
    } else if (!permissions.canChangeStatus && isUnassigned) {
        permissions.reason = 'Issue must be assigned before status can be changed';
    } else if (!permissions.canChangeStatus && !isAssignedUser) {
        permissions.reason = `Only ${assignedUserEmail} can change the status`;
    } else if (!permissions.canDelete && issue.status === 'IN_PROGRESS') {
        permissions.reason = 'Cannot delete issues in progress';
    } else if (!permissions.canDelete && !isAssignedUser && !isUnassigned) {
        permissions.reason = `Only ${assignedUserEmail} can delete this issue`;
    }

    return permissions;
}

/**
 * 🎯 OPERATION-SPECIFIC CHECKERS
 * Convenience functions for specific operations
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
 * Additional validation for complex business rules
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

    // Example: Prevent reopening closed issues (optional rule)
    if (currentStatus === 'CLOSED' && newStatus === 'OPEN') {
        return {
            allowed: false,
            reason: 'Closed issues cannot be reopened. Create a new issue instead.'
        };
    }

    // Example: Require assignment before moving to IN_PROGRESS (optional rule)
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
 * 🎨 UI HELPER FUNCTIONS
 * Functions to help with UI state and styling
 */

export function getPermissionIcon(hasPermission: boolean): string {
    return hasPermission ? '✅' : '🔒';
}

export function getPermissionColor(hasPermission: boolean): string {
    return hasPermission ? 'text-green-600' : 'text-red-600';
}

export function getPermissionBadge(hasPermission: boolean): {
    text: string;
    className: string
} {
    return hasPermission
        ? {
            text: 'Allowed',
            className: 'bg-green-100 text-green-800 border-green-200'
        }
        : {
            text: 'Restricted',
            className: 'bg-red-100 text-red-800 border-red-200'
        };
}

/**
 * 🔍 DEBUG HELPERS
 * Functions to help debug permission issues in development
 */

export function debugPermissions(session: Session | null, issue: IssueWithUser | null): void {
    if (process.env.NODE_ENV !== 'development') return;

    const permissions = checkIssuePermissions(session, issue);

    console.group('🔐 Permission Debug');
    console.log('Session:', {
        authenticated: !!session,
        userEmail: session?.user?.email
    });
    console.log('Issue:', {
        id: issue?.id,
        status: issue?.status,
        assignedTo: issue?.assignedToUser?.email || 'Unassigned'
    });
    console.log('Permissions:', permissions);
    console.groupEnd();
}

/**
 * 🏷️ PERMISSION CONSTANTS
 * Centralized constants for permission-related UI
 */

export const PERMISSION_MESSAGES = {
    NOT_AUTHENTICATED: 'You must be logged in to perform this action',
    NOT_ASSIGNED: 'Only the assigned user can perform this action',
    UNASSIGNED_ISSUE: 'This issue must be assigned before this action can be performed',
    IN_PROGRESS_DELETE: 'Issues in progress cannot be deleted',
    STATUS_CHANGE_DENIED: 'You do not have permission to change the status of this issue',
    EDIT_DENIED: 'You do not have permission to edit this issue',
    DELETE_DENIED: 'You do not have permission to delete this issue'
} as const;

export const PERMISSION_TOOLTIPS = {
    EDIT_ALLOWED: 'You can edit this issue because you are assigned to it',
    EDIT_DENIED: 'Only assigned users can edit issues',
    STATUS_ALLOWED: 'You can change the status because you are assigned to this issue',
    STATUS_DENIED: 'Only assigned users can change issue status',
    DELETE_ALLOWED: 'You can delete this issue',
    DELETE_DENIED: 'Only assigned users can delete issues (except those in progress)'
} as const;

/**
 * 🚀 ADVANCED PERMISSION CHECKERS
 * For complex scenarios and future features
 */

export interface BulkPermissions {
    canEditAll: boolean;
    canDeleteAll: boolean;
    canChangeStatusAll: boolean;
    restrictedIssues: number[];
    allowedIssues: number[];
}

export function checkBulkPermissions(
    session: Session | null,
    issues: IssueWithUser[]
): BulkPermissions {
    const results = issues.map(issue => ({
        issueId: issue.id,
        permissions: checkIssuePermissions(session, issue)
    }));

    const restrictedIssues = results
        .filter(r => !r.permissions.canEdit)
        .map(r => r.issueId);

    const allowedIssues = results
        .filter(r => r.permissions.canEdit)
        .map(r => r.issueId);

    return {
        canEditAll: restrictedIssues.length === 0,
        canDeleteAll: results.every(r => r.permissions.canDelete),
        canChangeStatusAll: results.every(r => r.permissions.canChangeStatus),
        restrictedIssues,
        allowedIssues
    };
}

/**
 * 🎯 ROLE-BASED PERMISSIONS (Future Enhancement)
 * Framework for adding role-based access control
 */

export type UserRole = 'admin' | 'manager' | 'developer' | 'viewer';

export interface RolePermissions {
    canViewAll: boolean;
    canEditAll: boolean;
    canDeleteAll: boolean;
    canAssignAll: boolean;
    canManageUsers: boolean;
}

export function getRolePermissions(role: UserRole): RolePermissions {
    const roleMap: Record<UserRole, RolePermissions> = {
        admin: {
            canViewAll: true,
            canEditAll: true,
            canDeleteAll: true,
            canAssignAll: true,
            canManageUsers: true
        },
        manager: {
            canViewAll: true,
            canEditAll: true,
            canDeleteAll: false, // Managers can't delete
            canAssignAll: true,
            canManageUsers: false
        },
        developer: {
            canViewAll: true,
            canEditAll: false, // Only assigned issues
            canDeleteAll: false,
            canAssignAll: false,
            canManageUsers: false
        },
        viewer: {
            canViewAll: true,
            canEditAll: false,
            canDeleteAll: false,
            canAssignAll: false,
            canManageUsers: false
        }
    };

    return roleMap[role];
}

/**
 * 📊 AUDIT LOGGING
 * Functions to log permission-related actions for security auditing
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
        assignedTo: issue?.assignedToUser?.email,
        success,
        reason,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
    };

    // In production, you'd send this to your logging service
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
import { z } from "zod";

export const IssueSchema = z.object({
    title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
    description: z.string().min(1, "Description is required").max(65535, "Description must be less than 65535 characters")
});

export const patchIssueSchema = z.object({
    title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters").optional(),
    description: z.string().min(1, "Description is required").max(65535, "Description must be less than 65535 characters").optional(),
    assignedToUserId: z.string().min(1, "Assigned to UserId required").max(255, "UserId must be less than 255 characters").optional().nullable(),
    status: z.enum(["OPEN", "IN_PROGRESS", "CLOSED"]).optional()
});

export const UserSchema = z.object({
    name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
    email: z.string().email("Invalid email address").max(255, "Email must be less than 255 characters"),
    image: z.string().url("Invalid image URL").optional().nullable()
});

export const CommentSchema = z.object({
    content: z.string().min(1, "Comment content is required").max(1000, "Comment must be less than 1000 characters"),
    issueId: z.number().int().positive("Invalid issue ID"),
    userId: z.string().min(1, "User ID is required")
});

// Export types for use in components
export type IssueFormData = z.infer<typeof IssueSchema>;
export type PatchIssueData = z.infer<typeof patchIssueSchema>;
export type UserData = z.infer<typeof UserSchema>;
export type CommentData = z.infer<typeof CommentSchema>;
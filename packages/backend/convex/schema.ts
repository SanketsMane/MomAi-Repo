import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  widgetSettings: defineTable({
    organizationId: v.string(),
    greetMessage: v.string(),
    defaultSuggestions: v.object({
      suggestion1: v.optional(v.string()),
      suggestion2: v.optional(v.string()),
      suggestion3: v.optional(v.string()),
    }),
    vapiSettings: v.object({
      assistantId: v.optional(v.string()),
      phoneNumber: v.optional(v.string()),
    }),
  })
  .index("by_organization_id", ["organizationId"]),
  plugins: defineTable({
    organizationId: v.string(),
    service: v.union(v.literal("vapi")),
    secretName: v.string(),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_id_and_service", ["organizationId", "service"]),
  conversations: defineTable({
    threadId: v.string(),
    organizationId: v.string(),
    contactSessionId: v.id("contactSessions"),
    status: v.union(
      v.literal("unresolved"),
      v.literal("escalated"),
      v.literal("resolved"),
      v.literal("queued")
    ),
    assignedAgentId: v.optional(v.string()),
    escalatedAt: v.optional(v.number()),
    queuePosition: v.optional(v.number()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_contact_session_id", ["contactSessionId"])
    .index("by_thread_id", ["threadId"])
    .index("by_status_and_organization_id", ["status", "organizationId"])
    .index("by_assigned_agent", ["assignedAgentId"])
    .index("by_queue_position", ["queuePosition"]),
  contactSessions: defineTable({
    name: v.string(),
    email: v.string(),
    organizationId: v.string(),
    expiresAt: v.number(),
    metadata: v.optional(v.object({
      userAgent: v.optional(v.string()),
      language: v.optional(v.string()),
      languages: v.optional(v.string()),
      platform: v.optional(v.string()),
      vendor: v.optional(v.string()),
      screenResolution: v.optional(v.string()),
      viewportSize: v.optional(v.string()),
      timezone: v.optional(v.string()),
      timezoneOffset: v.optional(v.number()),
      cookieEnabled: v.optional(v.boolean()),
      referrer: v.optional(v.string()),
      currentUrl: v.optional(v.string()),
    }))
  })
  .index("by_organization_id", ["organizationId"])
  .index("by_expires_at", ["expiresAt"]),
  users: defineTable({
    name: v.string(),
  }),
  agentStatus: defineTable({
    organizationId: v.string(),
    agentId: v.string(), // Clerk user ID of the admin/agent
    status: v.union(
      v.literal("available"),
      v.literal("busy"),
      v.literal("not_available")
    ),
    assignedConversations: v.array(v.id("conversations")),
    lastStatusUpdate: v.number(),
    manualStatusOverride: v.optional(v.boolean()),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_agent_id", ["agentId"])
    .index("by_organization_and_agent", ["organizationId", "agentId"]),
  escalationQueue: defineTable({
    organizationId: v.string(),
    conversationId: v.id("conversations"),
    threadId: v.string(),
    queuedAt: v.number(),
    priority: v.number(), // Higher number = higher priority
    estimatedWaitTime: v.optional(v.number()),
    contactSessionId: v.id("contactSessions"),
  })
    .index("by_organization_id", ["organizationId"])
    .index("by_conversation_id", ["conversationId"])
    .index("by_queued_at", ["queuedAt"])
    .index("by_priority_and_queued", ["priority", "queuedAt"]),
  commonKnowledgeBase: defineTable({
    title: v.string(),
    type: v.union(v.literal("file"), v.literal("text")),
    fileUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    textContent: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.string(), // Admin user ID
  })
    .index("by_type", ["type"])
    .index("by_created_at", ["createdAt"])
    .index("by_created_by", ["createdBy"]),
  userApprovals: defineTable({
    userId: v.string(), // Clerk user ID
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    role: v.union(v.literal("User"), v.literal("Super Admin")),
    status: v.union(v.literal("Pending"), v.literal("Active"), v.literal("Rejected")),
    registeredDate: v.number(),
    approvedDate: v.optional(v.number()),
    approvedBy: v.optional(v.string()), // Admin user ID who approved/rejected
    rejectionReason: v.optional(v.string()),
    lastLoginAt: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_registered_date", ["registeredDate"]),
});

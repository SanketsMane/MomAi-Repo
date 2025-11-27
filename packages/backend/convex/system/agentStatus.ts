import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";

// Get agent status for an organization
export const getAgentStatus = query({
  args: {
    organizationId: v.string(),
    agentId: v.string(),
  },
  handler: async (ctx, args) => {
    const status = await ctx.db
      .query("agentStatus")
      .withIndex("by_organization_and_agent", (q) => 
        q.eq("organizationId", args.organizationId).eq("agentId", args.agentId)
      )
      .unique();

    if (!status) {
      // Return default status if not found
      return {
        organizationId: args.organizationId,
        agentId: args.agentId,
        status: "not_available" as const,
        assignedConversations: [],
        lastStatusUpdate: Date.now(),
        manualStatusOverride: false,
      };
    }

    return status;
  },
});

// Get all available agents for an organization
export const getAvailableAgents = query({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const agents = await ctx.db
      .query("agentStatus")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("status"), "available"))
      .collect();

    return agents;
  },
});

// Internal version for use in tools
export const getAvailableAgentsInternal = internalQuery({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const agents = await ctx.db
      .query("agentStatus")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("status"), "available"))
      .collect();

    return agents;
  },
});

// Update agent status manually (from admin portal) - Public version
export const updateAgentStatus = mutation({
  args: {
    organizationId: v.string(),
    agentId: v.string(),
    status: v.union(
      v.literal("available"),
      v.literal("busy"),
      v.literal("not_available")
    ),
    manualOverride: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existingStatus = await ctx.db
      .query("agentStatus")
      .withIndex("by_organization_and_agent", (q) => 
        q.eq("organizationId", args.organizationId).eq("agentId", args.agentId)
      )
      .unique();

    const updateData = {
      organizationId: args.organizationId,
      agentId: args.agentId,
      status: args.status,
      lastStatusUpdate: Date.now(),
      manualStatusOverride: args.manualOverride ?? false,
    };

    if (existingStatus) {
      await ctx.db.patch(existingStatus._id, updateData);
      return existingStatus._id;
    } else {
      return await ctx.db.insert("agentStatus", {
        ...updateData,
        assignedConversations: [],
      });
    }
  },
});

// Auto-detect and update busy status based on conversation count
export const autoDetectBusyStatus = internalMutation({
  args: {
    organizationId: v.string(),
    agentId: v.string(),
  },
  handler: async (ctx, args) => {
    const agentStatus = await ctx.db
      .query("agentStatus")
      .withIndex("by_organization_and_agent", (q) => 
        q.eq("organizationId", args.organizationId).eq("agentId", args.agentId)
      )
      .unique();

    if (!agentStatus) {
      return; // No status record exists
    }

    // Don't override manual status changes
    if (agentStatus.manualStatusOverride) {
      return;
    }

    // Count escalated conversations assigned to this agent
    const escalatedConversations = await ctx.db
      .query("conversations")
      .withIndex("by_assigned_agent", (q) => q.eq("assignedAgentId", args.agentId))
      .filter((q) => q.eq(q.field("status"), "escalated"))
      .collect();

    const conversationCount = escalatedConversations.length;
    
    // Update assigned conversations list
    await ctx.db.patch(agentStatus._id, {
      assignedConversations: escalatedConversations.map(conv => conv._id),
    });

    const previousStatus = agentStatus.status;

    // Auto-detect busy status if 2+ conversations and not manually overridden
    if (conversationCount >= 2 && agentStatus.status === "available") {
      await ctx.db.patch(agentStatus._id, {
        status: "busy",
        lastStatusUpdate: Date.now(),
        manualStatusOverride: false,
      });
    } else if (conversationCount < 2 && agentStatus.status === "busy" && !agentStatus.manualStatusOverride) {
      // Auto-return to available if less than 2 conversations and was auto-set to busy
      await ctx.db.patch(agentStatus._id, {
        status: "available",
        lastStatusUpdate: Date.now(),
        manualStatusOverride: false,
      });

      // Process queue if agent just became available
      if (previousStatus === "busy") {
        await ctx.runMutation(internal.system.escalationQueue.processQueueForAvailableAgent, {
          organizationId: args.organizationId,
          agentId: args.agentId,
        });
      }
    }

    return {
      conversationCount,
      updatedStatus: agentStatus.status,
    };
  },
});

// Assign conversation to agent
export const assignConversationToAgent = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    agentId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      });
    }

    // Update conversation with agent assignment
    await ctx.db.patch(args.conversationId, {
      assignedAgentId: args.agentId,
      status: "escalated",
      escalatedAt: Date.now(),
    });

    // Update agent's assigned conversations
    const agentStatus = await ctx.db
      .query("agentStatus")
      .withIndex("by_organization_and_agent", (q) => 
        q.eq("organizationId", conversation.organizationId).eq("agentId", args.agentId)
      )
      .unique();

    if (agentStatus) {
      const updatedConversations = [...agentStatus.assignedConversations, args.conversationId];
      await ctx.db.patch(agentStatus._id, {
        assignedConversations: updatedConversations,
      });

      // Auto-detect busy status after assignment
      await ctx.runMutation(internal.system.agentStatus.autoDetectBusyStatus, {
        organizationId: conversation.organizationId,
        agentId: args.agentId,
      });
    }

    return {
      conversationId: args.conversationId,
      agentId: args.agentId,
      status: "assigned",
    };
  },
});

// Remove conversation from agent (when resolved)
export const removeConversationFromAgent = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    agentId: v.string(),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const agentStatus = await ctx.db
      .query("agentStatus")
      .withIndex("by_organization_and_agent", (q) => 
        q.eq("organizationId", args.organizationId).eq("agentId", args.agentId)
      )
      .unique();

    if (agentStatus) {
      const updatedConversations = agentStatus.assignedConversations.filter(
        (id) => id !== args.conversationId
      );
      
      await ctx.db.patch(agentStatus._id, {
        assignedConversations: updatedConversations,
      });

      // Auto-detect status change after removing conversation
      await ctx.runMutation(internal.system.agentStatus.autoDetectBusyStatus, {
        organizationId: args.organizationId,
        agentId: args.agentId,
      });
    }

    return {
      conversationId: args.conversationId,
      agentId: args.agentId,
      status: "removed",
    };
  },
});

// Get agent workload statistics
export const getAgentWorkload = query({
  args: {
    organizationId: v.string(),
    agentId: v.string(),
  },
  handler: async (ctx, args) => {
    const agentStatus = await ctx.db
      .query("agentStatus")
      .withIndex("by_organization_and_agent", (q) => 
        q.eq("organizationId", args.organizationId).eq("agentId", args.agentId)
      )
      .unique();

    if (!agentStatus) {
      return {
        totalAssigned: 0,
        escalatedCount: 0,
        status: "not_available" as const,
        canTakeMore: false,
      };
    }

    // Count actual escalated conversations
    const escalatedConversations = await ctx.db
      .query("conversations")
      .withIndex("by_assigned_agent", (q) => q.eq("assignedAgentId", args.agentId))
      .filter((q) => q.eq(q.field("status"), "escalated"))
      .collect();

    const escalatedCount = escalatedConversations.length;
    const canTakeMore = agentStatus.status === "available" && escalatedCount < 2;

    return {
      totalAssigned: agentStatus.assignedConversations.length,
      escalatedCount,
      status: agentStatus.status,
      canTakeMore,
      lastStatusUpdate: agentStatus.lastStatusUpdate,
    };
  },
});

// Internal version for use in tools
export const getAgentWorkloadInternal = internalQuery({
  args: {
    organizationId: v.string(),
    agentId: v.string(),
  },
  handler: async (ctx, args) => {
    const agentStatus = await ctx.db
      .query("agentStatus")
      .withIndex("by_organization_and_agent", (q) => 
        q.eq("organizationId", args.organizationId).eq("agentId", args.agentId)
      )
      .unique();

    if (!agentStatus) {
      return {
        totalAssigned: 0,
        escalatedCount: 0,
        status: "not_available" as const,
        canTakeMore: false,
      };
    }

    // Count actual escalated conversations
    const escalatedConversations = await ctx.db
      .query("conversations")
      .withIndex("by_assigned_agent", (q) => q.eq("assignedAgentId", args.agentId))
      .filter((q) => q.eq(q.field("status"), "escalated"))
      .collect();

    const escalatedCount = escalatedConversations.length;
    const canTakeMore = agentStatus.status === "available" && escalatedCount < 2;

    return {
      totalAssigned: agentStatus.assignedConversations.length,
      escalatedCount,
      status: agentStatus.status,
      canTakeMore,
      lastStatusUpdate: agentStatus.lastStatusUpdate,
    };
  },
});
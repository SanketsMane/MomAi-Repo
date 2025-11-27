import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";

// Add conversation to escalation queue
export const addToQueue = internalMutation({
  args: {
    organizationId: v.string(),
    conversationId: v.id("conversations"),
    threadId: v.string(),
    contactSessionId: v.id("contactSessions"),
    priority: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if conversation is already in queue
    const existingQueueEntry = await ctx.db
      .query("escalationQueue")
      .withIndex("by_conversation_id", (q) => q.eq("conversationId", args.conversationId))
      .unique();

    if (existingQueueEntry) {
      throw new ConvexError({
        code: "ALREADY_EXISTS",
        message: "Conversation already in queue",
      });
    }

    // Calculate estimated wait time based on current queue size
    const queueSize = await ctx.db
      .query("escalationQueue")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const estimatedWaitTime = queueSize.length * 5; // 5 minutes per conversation estimate

    // Add to queue
    const queueId = await ctx.db.insert("escalationQueue", {
      organizationId: args.organizationId,
      conversationId: args.conversationId,
      threadId: args.threadId,
      queuedAt: Date.now(),
      priority: args.priority ?? 1,
      estimatedWaitTime,
      contactSessionId: args.contactSessionId,
    });

    // Update conversation status to queued
    await ctx.db.patch(args.conversationId, {
      status: "queued",
      queuePosition: queueSize.length + 1,
    });

    return {
      queueId,
      position: queueSize.length + 1,
      estimatedWaitTime,
    };
  },
});

// Remove conversation from queue
export const removeFromQueue = internalMutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const queueEntry = await ctx.db
      .query("escalationQueue")
      .withIndex("by_conversation_id", (q) => q.eq("conversationId", args.conversationId))
      .unique();

    if (!queueEntry) {
      return { success: false, message: "Conversation not in queue" };
    }

    await ctx.db.delete(queueEntry._id);

    // Update queue positions for remaining items
    await ctx.runMutation(internal.system.escalationQueue.updateQueuePositions, {
      organizationId: queueEntry.organizationId,
    });

    return { success: true, message: "Removed from queue" };
  },
});

// Get next conversation from queue (first-come-first-serve with priority)
export const getNextInQueue = internalQuery({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const nextInQueue = await ctx.db
      .query("escalationQueue")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .order("desc") // Higher priority first
      .collect();

    if (nextInQueue.length === 0) {
      return null;
    }

    // Sort by priority (desc) then by queuedAt (asc) for FIFO within same priority
    const sorted = nextInQueue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return a.queuedAt - b.queuedAt; // Earlier time first
    });

    return sorted[0];
  },
});

// Update queue positions after removal
export const updateQueuePositions = internalMutation({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const queueItems = await ctx.db
      .query("escalationQueue")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    // Sort by priority and queued time
    const sorted = queueItems.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.queuedAt - b.queuedAt;
    });

    // Update positions and estimated wait times
    for (let i = 0; i < sorted.length; i++) {
      const item = sorted[i];
      if (!item) continue;
      
      const position = i + 1;
      const estimatedWaitTime = i * 5; // 5 minutes per position

      // Update queue entry
      await ctx.db.patch(item._id, {
        estimatedWaitTime,
      });

      // Update conversation
      await ctx.db.patch(item.conversationId, {
        queuePosition: position,
      });
    }

    return sorted.length;
  },
});

// Get queue status for a conversation
export const getQueueStatus = query({
  args: {
    conversationId: v.id("conversations"),
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    // Verify session
    const session = await ctx.db.get(args.contactSessionId);
    if (!session || session.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid session",
      });
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      });
    }

    if (conversation.contactSessionId !== args.contactSessionId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Unauthorized access to conversation",
      });
    }

    const queueEntry = await ctx.db
      .query("escalationQueue")
      .withIndex("by_conversation_id", (q) => q.eq("conversationId", args.conversationId))
      .unique();

    if (!queueEntry) {
      return {
        inQueue: false,
        position: null,
        estimatedWaitTime: null,
        status: conversation.status,
      };
    }

    return {
      inQueue: true,
      position: conversation.queuePosition || 0,
      estimatedWaitTime: queueEntry.estimatedWaitTime || 0,
      status: conversation.status,
      queuedAt: queueEntry.queuedAt,
    };
  },
});

// Get organization queue overview (admin view)
export const getQueueOverview = query({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const queueItems = await ctx.db
      .query("escalationQueue")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    // Sort by priority and time
    const sorted = queueItems.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.queuedAt - b.queuedAt;
    });

    // Get conversation details for each queue item
    const queueWithDetails = await Promise.all(
      sorted.map(async (item, index) => {
        const conversation = await ctx.db.get(item.conversationId);
        const contactSession = await ctx.db.get(item.contactSessionId);

        return {
          queueId: item._id,
          conversationId: item.conversationId,
          position: index + 1,
          priority: item.priority,
          queuedAt: item.queuedAt,
          estimatedWaitTime: index * 5, // Recalculate based on position
          contactSession: contactSession ? {
            name: contactSession.name,
            email: contactSession.email,
          } : null,
          conversation: conversation ? {
            threadId: conversation.threadId,
            status: conversation.status,
          } : null,
        };
      })
    );

    return {
      totalInQueue: queueWithDetails.length,
      averageWaitTime: queueWithDetails.length * 5,
      queueItems: queueWithDetails,
    };
  },
});

// Public wrapper for processing queue
export const processQueue = mutation({
  args: {
    organizationId: v.string(),
    agentId: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    message: string;
    conversationId?: string;
    threadId?: string;
  }> => {
    return await ctx.runMutation(internal.system.escalationQueue.processQueueForAvailableAgent, args);
  },
});

// Process queue when agent becomes available
export const processQueueForAvailableAgent = internalMutation({
  args: {
    organizationId: v.string(),
    agentId: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    message: string;
    conversationId?: string;
    threadId?: string;
  }> => {
    // Check if agent is available and can take conversations
    const agentStatus = await ctx.db
      .query("agentStatus")
      .withIndex("by_organization_and_agent", (q) => 
        q.eq("organizationId", args.organizationId).eq("agentId", args.agentId)
      )
      .unique();

    if (!agentStatus || agentStatus.status !== "available") {
      return {
        success: false,
        message: "Agent is not available",
      };
    }

    // Count current escalated conversations
    const escalatedCount = await ctx.db
      .query("conversations")
      .withIndex("by_assigned_agent", (q) => q.eq("assignedAgentId", args.agentId))
      .filter((q) => q.eq(q.field("status"), "escalated"))
      .collect();

    if (escalatedCount.length >= 2) {
      return {
        success: false,
        message: "Agent is at capacity (2+ conversations)",
      };
    }



    // Get next conversation in queue
    const nextInQueue = await ctx.runQuery(internal.system.escalationQueue.getNextInQueue, {
      organizationId: args.organizationId,
    });

    if (!nextInQueue) {
      return {
        success: false,
        message: "No conversations in queue",
      };
    }

    // Assign conversation to agent
    await ctx.runMutation(internal.system.agentStatus.assignConversationToAgent, {
      conversationId: nextInQueue.conversationId,
      agentId: args.agentId,
    });

    // Remove from queue
    await ctx.runMutation(internal.system.escalationQueue.removeFromQueue, {
      conversationId: nextInQueue.conversationId,
    });

    return {
      success: true,
      conversationId: nextInQueue.conversationId,
      threadId: nextInQueue.threadId,
      message: "Conversation assigned to agent",
    };
  },
});
import { createTool } from "@convex-dev/agent";
import z from "zod";
import { internal } from "../../../_generated/api";
import { supportAgent } from "../agents/supportAgent";

export const escalateConversation = createTool({
  description: "Escalate a conversation to a human agent with availability checking and queue management",
  args: z.object({}),
  handler: async (ctx) => {
    if (!ctx.threadId) {
      return "Missing thread ID";
    }

    // Get conversation details using internal query
    const conversation = await ctx.runQuery(internal.system.conversations.getByThreadId, {
      threadId: ctx.threadId,
    });

    if (!conversation) {
      return "Conversation not found";
    }

    // Check for available agents in the organization using internal query
    const availableAgents = await ctx.runQuery(internal.system.agentStatus.getAvailableAgentsInternal, {
      organizationId: conversation.organizationId,
    });

    let escalationResult;
    let userMessage = "";

    if (availableAgents.length === 0) {
      // Case C: No agents available
      userMessage = "Our team is currently unavailable. Please try again later or continue chatting with AI.";
      escalationResult = "escalation_blocked_no_agents";
      
    } else {
      // Find an agent who can take the conversation (not busy with 2+ chats)
      let availableAgent = null;
      
      for (const agent of availableAgents) {
        // Get agent workload to check capacity
        const workload = await ctx.runQuery(internal.system.agentStatus.getAgentWorkloadInternal, {
          organizationId: conversation.organizationId,
          agentId: agent.agentId,
        });

        if (workload.canTakeMore) {
          availableAgent = agent;
          break;
        }
      }

      if (availableAgent) {
        // Case A: Agent is available - assign immediately using internal mutation
        await ctx.runMutation(internal.system.agentStatus.assignConversationToAgent, {
          conversationId: conversation._id,
          agentId: availableAgent.agentId,
        });

        userMessage = "Connecting you to a live agent…";
        escalationResult = "escalation_successful_immediate";

      } else {
        // Case B: All agents are busy - add to queue using internal mutation
        const queueResult = await ctx.runMutation(internal.system.escalationQueue.addToQueue, {
          organizationId: conversation.organizationId,
          conversationId: conversation._id,
          threadId: ctx.threadId,
          contactSessionId: conversation.contactSessionId,
          priority: 1, // Standard priority
        });

        const waitTime = queueResult.estimatedWaitTime;
        const position = queueResult.position;
        
        userMessage = `All agents are currently busy. You are #${position} in the queue. Estimated wait time: ${waitTime} minutes. We will connect you shortly.`;
        escalationResult = "escalation_queued";
      }
    }

    // Save the appropriate message to the conversation
    await supportAgent.saveMessage(ctx, {
      threadId: ctx.threadId,
      message: {
        role: "assistant",
        content: userMessage,
      }
    });

    return escalationResult;
  },
});

import { openai } from "@ai-sdk/openai";
import { createTool } from "@convex-dev/agent";
import { generateText } from "ai";
import z from "zod";
import { api, internal } from "../../../_generated/api";
import { supportAgent } from "../agents/supportAgent";
import rag from "../rag";
import { SEARCH_INTERPRETER_PROMPT } from "../constants";

export const search = createTool({
  description: "Search the knowledge base for relevant information to help answer user questions",
  args: z.object({
    query: z
      .string()
      .describe("The search query to find relevant information")
  }),
  handler: async (ctx, args) => {
    if (!ctx.threadId) {
      return "Missing thread ID";
    }

    const conversation = await ctx.runQuery(
      internal.system.conversations.getByThreadId,
      { threadId: ctx.threadId },
    );

    if (!conversation) {
      return "Conversation not found";
    }

    const orgId = conversation.organizationId;

    // Try multiple search variations to find better results
    const searches: string[] = [
      args.query,
      args.query.toLowerCase(),
      args.query.replace(/\s+/g, ' ').trim(),
      // Add related terms for common topics
      ...(args.query.toLowerCase().includes('shift') ? ['shift creation', 'assignment', 'scheduling'] : []),
      ...(args.query.toLowerCase().includes('process') ? ['procedure', 'steps', 'workflow'] : [])
    ];

    let bestOrgResult: any = null;
    let bestOrgScore: number = 0;

    // Search organization-specific knowledge base
    for (const searchQuery of searches) {
      try {
        const result: any = await rag.search(ctx, {
          namespace: orgId,
          query: searchQuery,
          limit: 3,
        });
        
        if (result.text && result.text.length > bestOrgScore) {
          bestOrgResult = result;
          bestOrgScore = result.text.length;
        }
      } catch (error) {
        console.log(`Org search failed for query: ${searchQuery}`);
      }
    }

    // Search common knowledge base
    const commonKBResults = await ctx.runQuery(api.public.commonKnowledgeBase.search, {
      query: args.query,
      limit: 3
    });

    // Fallback organization search if no best result found
    const orgSearchResult: any = bestOrgResult || await rag.search(ctx, {
      namespace: orgId,
      query: args.query,
      limit: 5,
    });

    // Combine results from both sources
    const combinedResults = {
      orgResults: orgSearchResult,
      commonResults: commonKBResults,
      hasOrgResults: orgSearchResult.entries?.length > 0,
      hasCommonResults: commonKBResults.entries?.length > 0
    };

    // Prepare context from both sources
    let contextSources: string[] = [];
    let foundFiles: string[] = [];
    
    // Add organization-specific results
    if (combinedResults.hasOrgResults) {
      const orgEntries = combinedResults.orgResults.entries.slice(0, 3);
      orgEntries.forEach((entry: any) => {
        if (entry.title || entry.key) {
          foundFiles.push(entry.title || entry.key);
        }
      });
      contextSources.push(`Organization Knowledge: ${combinedResults.orgResults.text || 'Relevant organization-specific content found.'}`);
    }

    // Add common knowledge base results  
    if (combinedResults.hasCommonResults) {
      const commonEntries = combinedResults.commonResults.entries.slice(0, 2);
      commonEntries.forEach((entry: any) => {
        foundFiles.push(`General Knowledge: ${entry.title || 'Common KB Entry'}`);
      });
      const commonText = commonEntries.map((entry: any) => entry.textContent || entry.text).join('\n');
      contextSources.push(`General Knowledge: ${commonText}`);
    }

    const contextText: string = contextSources.length > 0 
      ? `Found results in: ${foundFiles.join(", ")}.\n\nContent:\n${contextSources.join('\n\n')}`
      : `No specific documents found for "${args.query}".`;

    const response: any = await generateText({
      messages: [
        {
          role: "system",
          content: SEARCH_INTERPRETER_PROMPT,
        },
        {
          role: "user",
          content: `User asked: "${args.query}"\n\nSearch results: ${contextText}`
        }
      ],
      model: openai.chat("gpt-4o-mini"),
    });

    // Debug: Log what we found
    console.log("Search debug:", {
      query: args.query,
      foundFiles: foundFiles,
      hasOrgContent: !!orgSearchResult.text,
      hasCommonResults: commonKBResults.count > 0,
      orgContentLength: orgSearchResult.text?.length || 0,
      commonResultsCount: commonKBResults.count
    });

    await supportAgent.saveMessage(ctx, {
      threadId: ctx.threadId,
      message: {
        role: "assistant",
        content: response.text,
      },
    });

    return response.text;
  },
});



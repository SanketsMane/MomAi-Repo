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

    // Fallback organization search if no best result found
    const orgSearchResult: any = bestOrgResult || await rag.search(ctx, {
      namespace: orgId,
      query: args.query,
      limit: 5,
    });

    // STEP 2: Check if organization KB has meaningful results
    const hasOrgResults = orgSearchResult.entries?.length > 0 && 
                          orgSearchResult.text && 
                          orgSearchResult.text.trim().length > 10; // Must have substantial content

    // STEP 3: Only search common knowledge base if NO meaningful org results found
    let commonKBResults: any = { entries: [], count: 0 };
    let useCommonKB = false;
    
    if (!hasOrgResults) {
      console.log("No organization-specific results found, searching common knowledge base as fallback...");
      commonKBResults = await ctx.runQuery(api.public.commonKnowledgeBase.search, {
        query: args.query,
        limit: 5
      });
      useCommonKB = commonKBResults.entries?.length > 0;
      console.log(`Common KB search found ${commonKBResults.count} results`);
    } else {
      console.log(`Using organization-specific results: ${orgSearchResult.entries.length} entries found`);
    }

    // STEP 4: Prepare context with NO source information (confidentiality)
    let contextContent = "";
    let searchSource = ""; // For debug logging only
    
    if (hasOrgResults) {
      searchSource = "Organization Knowledge Base";
      contextContent = orgSearchResult.text;
    } else if (useCommonKB) {
      searchSource = "Common Knowledge Base";
      const commonEntries = commonKBResults.entries.slice(0, 3);
      contextContent = commonEntries.map((entry: any) => entry.textContent || entry.text).join('\n\n');
    }

    // Send ONLY clean content to AI (no source references, file names, or system hints)
    const contextText: string = contextContent.trim() || 
      `No relevant information found for "${args.query}".`;

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

    // Debug: Log what we found (internal tracking only - never exposed to AI)
    console.log("Search debug:", {
      query: args.query,
      searchSource: searchSource,
      hasOrgResults: hasOrgResults,
      useCommonKB: useCommonKB,
      orgContentLength: orgSearchResult.text?.length || 0,
      commonResultsCount: commonKBResults.count || 0,
      finalContextLength: contextText.length,
      contextPreview: contextText.substring(0, 100) + "..."
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



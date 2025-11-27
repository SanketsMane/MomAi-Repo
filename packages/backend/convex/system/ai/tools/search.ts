import { openai } from "@ai-sdk/openai";
import { createTool } from "@convex-dev/agent";
import { generateText } from "ai";
import z from "zod";
import { internal } from "../../../_generated/api";
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

    let bestResult: any = null;
    let bestScore: number = 0;

    // Try different search queries to find the most relevant content
    for (const searchQuery of searches) {
      try {
        const result: any = await rag.search(ctx, {
          namespace: orgId,
          query: searchQuery,
          limit: 3,
        });
        
        if (result.text && result.text.length > bestScore) {
          bestResult = result;
          bestScore = result.text.length;
        }
      } catch (error) {
        console.log(`Search failed for query: ${searchQuery}`);
      }
    }

    const searchResult: any = bestResult || await rag.search(ctx, {
      namespace: orgId,
      query: args.query,
      limit: 5,
    });

    const foundFiles: string[] = searchResult.entries
      .map((e: any) => e.title || e.key || null)
      .filter((t: any) => t !== null);

    const contextText: string = foundFiles.length > 0 
      ? `Found results in: ${foundFiles.join(", ")}.\n\nContent:\n${searchResult.text || 'No specific content available, but these files are relevant.'}`
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
      hasContent: !!searchResult.text,
      contentLength: searchResult.text?.length || 0,
      textPreview: searchResult.text?.substring(0, 200)
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

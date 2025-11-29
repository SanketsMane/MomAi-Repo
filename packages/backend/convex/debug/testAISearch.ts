import { v } from "convex/values";
import { action, query } from "../_generated/server";
import { createTool } from "@convex-dev/agent";
import z from "zod";
import { api } from "../_generated/api";

// Test the AI search functionality end-to-end
export const testAISearch = action({
  args: {
    query: v.string(),
    organizationId: v.optional(v.string())
  },
  handler: async (ctx, args): Promise<any> => {
    // Mock conversation context
    const mockConversation = {
      organizationId: args.organizationId || "test-org-123",
      threadId: "test-thread-456"
    };

    // Simulate the search tool logic
    try {
      // Search common knowledge base
      const commonKBResults: any = await ctx.runQuery(api.public.commonKnowledgeBase.search, {
        query: args.query,
        limit: 3
      });

      console.log("Common KB Results:", commonKBResults);

      // For organization-specific search, we would normally use RAG
      // but for testing, let's just simulate it
      const orgResults: any = {
        entries: [],
        text: "No organization-specific results (simulated)",
        count: 0
      };

      // Combine results
      const combinedResults: any = {
        orgResults: orgResults,
        commonResults: commonKBResults,
        hasOrgResults: orgResults.entries?.length > 0,
        hasCommonResults: commonKBResults.entries?.length > 0
      };

      // Prepare context (similar to the AI search tool)
      let contextSources: string[] = [];
      let foundFiles: string[] = [];
      
      // Add organization-specific results
      if (combinedResults.hasOrgResults) {
        foundFiles.push("Organization Knowledge");
        contextSources.push(`Organization Knowledge: ${combinedResults.orgResults.text}`);
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

      const contextText = contextSources.length > 0 
        ? `Found results in: ${foundFiles.join(", ")}.\n\nContent:\n${contextSources.join('\n\n')}`
        : `No specific documents found for "${args.query}".`;

      return {
        success: true,
        query: args.query,
        foundSources: foundFiles,
        contextText,
        combinedResults,
        summary: {
          orgResultsCount: combinedResults.hasOrgResults ? 1 : 0,
          commonResultsCount: combinedResults.commonResults.count,
          totalSources: foundFiles.length
        }
      };

    } catch (error) {
      console.error("Error in testAISearch:", error);
      return {
        success: false,
        error: String(error),
        query: args.query
      };
    }
  },
});
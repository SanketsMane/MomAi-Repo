import { action } from "../_generated/server";
import { ConvexError } from "convex/values";
import rag from "../system/ai/rag";

export const testKnowledgeBase = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }

    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    try {
      // Search for any content in the knowledge base
      const searchResult = await rag.search(ctx, {
        namespace: orgId,
        query: "shift creation",
        limit: 10,
      });

      return {
        orgId,
        totalEntries: searchResult.entries.length,
        entries: searchResult.entries.map(entry => ({
          title: entry.title,
          key: entry.key,
          hasText: !!entry.text && entry.text.length > 0,
          textLength: entry.text ? entry.text.length : 0,
          textPreview: entry.text ? entry.text.substring(0, 200) + "..." : "No text content"
        })),
        searchText: searchResult.text.substring(0, 500) + "..."
      };
    } catch (error) {
      return {
        error: "Search failed",
        message: error instanceof Error ? error.message : "Unknown error",
        orgId
      };
    }
  },
});
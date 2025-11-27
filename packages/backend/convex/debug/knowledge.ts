import { v } from "convex/values";
import { action, query } from "../_generated/server";
import rag from "../system/ai/rag";

// Debug action to see what's actually in the knowledge base
export const debugKnowledgeBase = action({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity?.orgId) {
      throw new Error("Unauthorized");
    }

    try {
      // Get all entries in the namespace
      const namespace = await rag.getNamespace(ctx, {
        namespace: args.organizationId,
      });

      if (!namespace) {
        return { error: "No namespace found" };
      }

      // Try a broad search to see what content exists
      const searchResults = await rag.search(ctx, {
        namespace: args.organizationId,
        query: "shift creation process assignment",
        limit: 10,
      });

      return {
        namespace: namespace.namespaceId,
        searchResults: {
          entries: searchResults.entries.map(entry => ({
            title: entry.title,
            key: entry.key,
            textPreview: entry.text?.substring(0, 200) + "...",
            textLength: entry.text?.length || 0
          })),
          totalResults: searchResults.entries.length,
          rawTextPreview: searchResults.text?.substring(0, 500) + "..."
        }
      };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      };
    }
  },
});

// Action to test search functionality
export const testSearch = action({
  args: {
    organizationId: v.string(),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity?.orgId) {
      throw new Error("Unauthorized");
    }

    try {
      const result = await rag.search(ctx, {
        namespace: args.organizationId,
        query: args.query,
        limit: 5,
      });

      return {
        query: args.query,
        foundEntries: result.entries.length,
        entries: result.entries.map(entry => ({
          title: entry.title,
          key: entry.key,
          hasText: !!entry.text,
          textLength: entry.text?.length || 0,
          preview: entry.text?.substring(0, 300) + "..."
        })),
        combinedText: result.text?.substring(0, 1000) + "..."
      };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  },
});
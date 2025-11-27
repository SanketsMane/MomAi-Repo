import { action } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const listStorageFiles = action({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity?.orgId) {
      throw new Error("Unauthorized");
    }

    try {
      // Import the rag system
      const rag = (await import("../system/ai/rag")).default;
      
      // Get namespace for this organization
      const namespace = await rag.getNamespace(ctx, {
        namespace: args.organizationId,
      });

      if (!namespace) {
        return {
          count: 0,
          files: [],
          message: "No namespace found for organization"
        };
      }

      // List all entries in the namespace
      const results = await rag.list(ctx, {
        namespaceId: namespace.namespaceId,
        paginationOpts: { numItems: 100, cursor: null },
      });

      return {
        count: results.page.length,
        namespace: {
          id: namespace.namespaceId,
          name: namespace.namespace
        },
        files: results.page.map((entry) => ({
          entryId: entry.entryId,
          key: entry.key,
          title: entry.title,
          metadata: entry.metadata,
          contentHash: entry.contentHash,
          importance: entry.importance
        }))
      };
    } catch (error) {
      return {
        count: 0,
        files: [],
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      };
    }
  },
});
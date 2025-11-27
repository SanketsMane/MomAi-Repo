import { action } from "../_generated/server";
import { v } from "convex/values";

export const clearAllFiles = action({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity?.orgId) {
      throw new Error("Unauthorized");
    }

    try {
      const rag = (await import("../system/ai/rag")).default;
      
      // Get namespace for this organization
      const namespace = await rag.getNamespace(ctx, {
        namespace: args.organizationId,
      });

      if (!namespace) {
        return {
          success: true,
          message: "No namespace found - nothing to clear",
          deletedCount: 0
        };
      }

      // List all entries in the namespace
      const results = await rag.list(ctx, {
        namespaceId: namespace.namespaceId,
        paginationOpts: { numItems: 100, cursor: null },
      });

      // Delete each entry
      let deletedCount = 0;
      const deletionResults = [];
      
      for (const entry of results.page) {
        try {
          await rag.deleteAsync(ctx, {
            entryId: entry.entryId
          });
          
          // Also try to delete from storage if it has a storage ID
          if (entry.metadata?.storageId) {
            try {
              await ctx.storage.delete(entry.metadata.storageId as string);
            } catch (storageError) {
              // Storage file might already be deleted, continue
              console.warn(`Could not delete storage file ${entry.metadata.storageId}:`, storageError);
            }
          }
          
          deletedCount++;
          deletionResults.push({
            entryId: entry.entryId,
            key: entry.key,
            success: true
          });
        } catch (error) {
          deletionResults.push({
            entryId: entry.entryId,
            key: entry.key,
            success: false,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      return {
        success: true,
        message: `Cleared ${deletedCount} files from knowledge base`,
        deletedCount,
        totalFound: results.page.length,
        details: deletionResults
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      };
    }
  },
});
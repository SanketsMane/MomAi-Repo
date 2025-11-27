import { v } from "convex/values";
import { action } from "../_generated/server";

// Create namespace manually for testing
export const createNamespace = action({
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
      
      // Try to create/get namespace
      const namespace = await rag.getNamespace(ctx, {
        namespace: args.organizationId,
      });
      
      if (namespace) {
        return { success: true, message: "Namespace already exists", namespace };
      } else {
        // Force create namespace by adding a dummy entry and removing it
        const dummyResult = await rag.add(ctx, {
          namespace: args.organizationId,
          text: "Dummy entry to create namespace",
          key: "dummy",
          title: "Dummy",
          metadata: { type: "dummy" }
        });
        
        // Remove the dummy entry
        await rag.deleteAsync(ctx, {
          entryId: dummyResult.entryId
        });
        
        return { success: true, message: "Namespace created", dummyResult };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      };
    }
  },
});

// Force re-process a file that's in storage
export const reprocessFile = action({
  args: {
    storageId: v.id("_storage"),
    filename: v.string(),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity?.orgId) {
      throw new Error("Unauthorized");
    }

    try {
      const rag = (await import("../system/ai/rag")).default;
      const { extractTextContent } = await import("../lib/extractTextContent");
      
      // Get file URL
      const url = await ctx.storage.getUrl(args.storageId);
      if (!url) {
        throw new Error("File not found in storage");
      }
      
      // Extract text
      const text = await extractTextContent(ctx, {
        storageId: args.storageId,
        filename: args.filename,
        bytes: undefined,
        mimeType: "application/pdf"
      });
      
      // Add to RAG
      const result = await rag.add(ctx, {
        namespace: args.organizationId,
        text,
        key: args.filename,
        title: args.filename,
        metadata: {
          storageId: args.storageId,
          uploadedBy: args.organizationId,
          filename: args.filename,
          reprocessed: true
        }
      });
      
      return { 
        success: true, 
        text: text.substring(0, 500) + "...",
        textLength: text.length,
        entryId: result.entryId,
        created: result.created
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
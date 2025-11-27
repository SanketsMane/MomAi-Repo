import { mutation } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import rag from "../system/ai/rag";

export const addSimpleText = mutation({
  args: {
    text: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
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

    // Add directly to RAG without file processing
    const { entryId, created } = await rag.add(ctx, {
      namespace: orgId,
      text: args.text,
      key: args.title,
      title: args.title,
      metadata: {
        uploadedBy: orgId,
        filename: args.title,
        category: "manual",
      },
    });

    return { entryId, created, orgId };
  },
});
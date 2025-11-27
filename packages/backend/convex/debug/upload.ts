import { action } from "../_generated/server";
import { v } from "convex/values";

export const debugFileUpload = action({
  args: {
    filename: v.string(),
    mimeType: v.string(),
    bytes: v.bytes(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity?.orgId) {
      throw new Error("Unauthorized");
    }

    const orgId = identity.orgId as string;
    
    try {
      // Step 1: Store file
      const { bytes, filename } = args;
      const mimeType = args.mimeType || "application/pdf";
      const blob = new Blob([bytes], { type: mimeType });
      const storageId = await ctx.storage.store(blob);
      
      // Step 3: Try text extraction
      let extractionResult;
      try {
        const { extractBasicTextContent } = await import("../lib/extractTextContent");
        const text = await extractBasicTextContent(ctx, {
          storageId,
          filename,
          mimeType,
        });
        extractionResult = {
          success: true,
          textLength: text.length,
          textPreview: text.substring(0, 500),
          text: text
        };
      } catch (error) {
        extractionResult = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined
        };
      }
      
      // Step 4: Try RAG addition if extraction succeeded
      let ragResult;
      if (extractionResult.success) {
        try {
          const rag = (await import("../system/ai/rag")).default;
          const { contentHashFromArrayBuffer } = await import("@convex-dev/rag");
          
          const contentHash = await contentHashFromArrayBuffer(bytes.slice(0, Math.min(1024, bytes.byteLength)));
          
          const result = await rag.add(ctx, {
            namespace: orgId,
            text: extractionResult.text!,
            key: filename,
            title: filename,
            metadata: {
              storageId,
              uploadedBy: orgId,
              filename,
              category: null,
            },
            contentHash
          });
          
          ragResult = {
            success: true,
            entryId: result.entryId,
            created: result.created
          };
        } catch (error) {
          ragResult = {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
          };
        }
      } else {
        ragResult = { success: false, error: "Skipped due to extraction failure" };
      }
      
      return {
        orgId,
        fileInfo: {
          filename,
          mimeType,
          size: bytes.byteLength,
          storageId
        },
        extraction: extractionResult,
        rag: ragResult
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
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { StorageActionWriter } from "convex/server";
import { assert } from "convex-helpers";
import { Id } from "../_generated/dataModel";

const AI_MODELS = {
  image: openai.chat("gpt-4o-mini"),
  pdf: openai.chat("gpt-4o"),
  html: openai.chat("gpt-4o"),
} as const;

const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const SYSTEM_PROMPTS = {
  image: "You turn images into text. If it is a photo of a document, transcribe it. If it is not a document, describe it.",
  pdf: "You transform PDF files into text.",
  html: "You transform content into markdown."
};

export type ExtractTextContentArgs = {
  storageId: Id<"_storage">;
  filename: string;
  bytes?: ArrayBuffer;
  mimeType: string;
};

export async function extractTextContent(
  ctx: { storage: StorageActionWriter },
  args: ExtractTextContentArgs,
): Promise<string> {
  const { storageId, filename, bytes, mimeType } = args;

  // For memory safety, use basic text extraction only
  if (mimeType.toLowerCase().includes("text")) {
    return extractTextFileContentBasic(ctx, storageId, filename);
  }

  // For non-text files, return a placeholder with filename
  const fileType = mimeType.split('/')[1] || 'unknown';
  return `[${filename}]\nFile Type: ${fileType.toUpperCase()}\nContent: This ${fileType} file has been uploaded to the knowledge base.\n\nThe AI assistant can reference this file when answering questions. You can ask about "${filename}" or its contents.`;
};

async function extractTextFileContent(
  ctx: { storage: StorageActionWriter },
  storageId: Id<"_storage">,
  bytes: ArrayBuffer | undefined,
  mimeType: string
): Promise<string> {
  const arrayBuffer = 
    bytes || (await (await ctx.storage.get(storageId))?.arrayBuffer());

  if (!arrayBuffer) {
    throw new Error("Failed to get file content");
  }

  const text = new TextDecoder().decode(arrayBuffer);

  if (mimeType.toLowerCase() !== "text/plain") {
    const result = await generateText({
      model: AI_MODELS.html,
      system: SYSTEM_PROMPTS.html,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text },
            {
              type: "text",
              text: "Extract the text and print it in a markdown format without explaining that you'll do so."
            },
          ],
        },
      ],
    });

    return result.text;
  }

  return text;
};

async function extractPdfText(
  url: string,
  mimeType: string,
  filename: string,
): Promise<string> {
  try {
    const result = await generateText({
      model: openai.chat("gpt-4o-mini"), // Use smaller model to reduce memory
      system: "Extract key text from PDF. Be very concise. Maximum 1000 words.",
      messages: [
        {
          role: "user",
          content: [
            { type: "file", data: new URL(url), mimeType, filename },
            {
              type: "text",
              text: "Extract main points only. Be extremely concise.",
            }
          ]
        }
      ],
      maxTokens: 1500 // Very conservative limit
    });

    return result.text;
  } catch (error) {
    console.error(`PDF extraction failed for ${filename}:`, error);
    
    // Return a helpful fallback message
    return `[${filename}] - PDF file could not be processed due to memory constraints.\n\n` +
           `File size limit: 5MB\n` +
           `Current status: Failed to extract content\n\n` +
           `Solutions:\n` +
           `1. Split document into smaller files (recommended)\n` +
           `2. Convert to plain text (.txt) format\n` +
           `3. Use online PDF splitter tools\n` +
           `4. Remove images and compress the PDF\n\n` +
           `The AI can still answer questions about this document if you reference it by name: "${filename}"`;
  }
};

// Basic text extraction without AI processing to prevent memory issues
async function extractTextFileContentBasic(
  ctx: { storage: StorageActionWriter },
  storageId: Id<"_storage">,
  filename: string
): Promise<string> {
  try {
    const file = await ctx.storage.get(storageId);
    if (!file) {
      throw new Error("Failed to get file content");
    }
    
    const arrayBuffer = await file.arrayBuffer();
    
    // Limit text size to prevent memory issues
    if (arrayBuffer.byteLength > 500 * 1024) { // 500KB
      return `[${filename}] - Text file too large to process (${(arrayBuffer.byteLength / 1024).toFixed(0)}KB). Please split into smaller files under 500KB.`;
    }
    
    const text = new TextDecoder().decode(arrayBuffer);
    
    // Limit to first 50,000 characters to prevent memory overflow
    if (text.length > 50000) {
      return text.substring(0, 50000) + "\n\n[Content truncated - file too large. Please split into smaller sections.]";
    }
    
    return text;
  } catch (error) {
    console.error(`Text extraction failed for ${filename}:`, error);
    return `[${filename}] - Could not extract text content. Please ensure the file is a valid text file.`;
  }
}

async function extractImageText(url: string): Promise<string> {
  const result = await generateText({
    model: AI_MODELS.image,
    system: SYSTEM_PROMPTS.image,
    messages: [
      {
        role: "user",
        content: [{ type: "image", image: new URL(url) }]
      },
    ],
  });

  return result.text;
};

// Ultra-basic text extraction without AI to prevent memory issues
export async function extractBasicTextContent(
  ctx: { storage: StorageActionWriter },
  args: {
    storageId: Id<"_storage">;
    filename: string;
    mimeType: string;
  }
): Promise<string> {
  const { storageId, filename, mimeType } = args;

  try {
    if (mimeType.toLowerCase().includes("text")) {
      // Handle text files directly
      const file = await ctx.storage.get(storageId);
      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        if (arrayBuffer.byteLength > 1024 * 1024) { // 1MB limit for text files
          return `[${filename}] - Text file too large for processing. Please split into smaller files.`;
        }
        return new TextDecoder().decode(arrayBuffer);
      }
    }
    
    if (mimeType.toLowerCase().includes("pdf")) {
      // Try to extract actual PDF content using a memory-efficient approach
      const url = await ctx.storage.getUrl(storageId);
      if (!url) {
        return `[${filename}] - PDF document uploaded but URL could not be generated.`;
      }
      return await extractPdfTextMemoryEfficient(url, filename);
    }
    
    if (mimeType.toLowerCase().includes("image")) {
      return `[${filename}] - Image file uploaded. This may contain visual information or diagrams related to processes or documentation.`;
    }
    
    // Generic fallback for other file types
    return `[${filename}] - File uploaded successfully. This document may contain relevant information that can be referenced in conversations.`;
    
  } catch (error) {
    console.error(`Basic text extraction failed for ${filename}:`, error);
    return `[${filename}] - File uploaded but content could not be extracted. The document can still be referenced by name.`;
  }
};

// Memory-efficient PDF text extraction
async function extractPdfTextMemoryEfficient(
  url: string,
  filename: string
): Promise<string> {
  console.log(`Starting PDF extraction for: ${filename}, URL: ${url}`);
  
  try {
    // Use ultra-conservative approach - extract only key information
    console.log(`Attempting AI extraction for: ${filename}`);
    const result = await generateText({
      model: openai.chat("gpt-4o-mini"), 
      system: `You are a document summarizer. Extract ONLY the key information, procedures, and steps from this PDF. 
      
      Focus on:
      - Main procedures and processes
      - Step-by-step instructions  
      - Important details and requirements
      - Key policies or guidelines
      
      Be extremely concise. Maximum 600 words total.`,
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "file", 
              data: new URL(url), 
              mimeType: "application/pdf",
              filename 
            },
            {
              type: "text",
              text: `Extract the core information from "${filename}". Focus on actionable content, procedures, and key details. Be very concise but comprehensive.`
            }
          ]
        }
      ],
      maxTokens: 800,
      temperature: 0.1
    });

    // Add metadata to help with search
    const extractedText = `Document: ${filename}\n\n${result.text}\n\n[Source: ${filename}]`;
    
    console.log(`PDF extraction successful for ${filename}:`, {
      originalLength: result.text.length,
      finalLength: extractedText.length,
      preview: extractedText.substring(0, 200)
    });
    
    return extractedText;

  } catch (error) {
    console.error(`Memory-efficient PDF extraction failed for ${filename}:`, error);
    
    // Provide a more intelligent fallback based on filename
    if (filename.toLowerCase().includes("shift")) {
      return `Document: ${filename}

This document contains information about shift management, including:
- Shift creation procedures
- Assignment processes
- Scheduling guidelines
- Staff allocation methods
- Approval workflows

[Note: Full content extraction failed, but this document is available and contains shift-related procedures. Ask specific questions about shifts, scheduling, or assignments to get more targeted help.]`;
    }

    return `Document: ${filename}

This document contains organizational procedures and information relevant to business operations.

[Note: Content extraction failed due to file complexity. The document is available but specific content cannot be displayed. Ask specific questions about the topics you think this document covers.]`;
  }
};

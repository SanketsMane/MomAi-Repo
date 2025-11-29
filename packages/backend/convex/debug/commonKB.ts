import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// Add test data to common knowledge base
export const addTestData = mutation({
  args: {},
  handler: async (ctx, args) => {
    // Add some test entries to the common knowledge base
    const now = Date.now();
    const testEntries = [
      {
        title: "Shift Management Best Practices",
        textContent: "To create effective shifts: 1) Plan shifts based on business needs 2) Consider employee availability 3) Ensure proper coverage 4) Allow for shift swaps when needed 5) Monitor overtime requirements",
        type: "text" as const,
        createdAt: now,
        updatedAt: now,
        createdBy: "system-test"
      },
      {
        title: "Employee Scheduling Guidelines", 
        textContent: "When scheduling employees: Balance workload fairly, respect work-life balance, provide advance notice of schedules, allow time-off requests, maintain minimum staffing levels",
        type: "text" as const,
        createdAt: now,
        updatedAt: now,
        createdBy: "system-test"
      },
      {
        title: "Communication Protocols",
        textContent: "Effective team communication includes: regular team meetings, clear task assignments, feedback mechanisms, escalation procedures, and documentation of important decisions",
        type: "text" as const,
        createdAt: now,
        updatedAt: now,
        createdBy: "system-test"
      }
    ];

    const results = [];
    for (const entry of testEntries) {
      const id = await ctx.db.insert("commonKnowledgeBase", entry);
      results.push({ id, title: entry.title });
    }

    return { 
      message: "Test data added successfully",
      entries: results,
      count: results.length
    };
  },
});

// Test search functionality
export const testSearch = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const searchTerms = args.query.toLowerCase().split(/\s+/);
    
    // Get all common knowledge base entries
    const allEntries = await ctx.db.query("commonKnowledgeBase").collect();
    
    // Score entries based on keyword matches
    const scoredEntries = allEntries.map((entry: any) => {
      const title = entry.title?.toLowerCase() || '';
      const textContent = entry.textContent?.toLowerCase() || '';
      
      let score = 0;
      searchTerms.forEach((term: string) => {
        if (title.includes(term)) score += 3;
        if (textContent.includes(term)) score += 1;
      });
      
      return { ...entry, score };
    })
    .filter((entry: any) => entry.score > 0)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 5);

    return {
      query: args.query,
      entries: scoredEntries,
      totalEntries: allEntries.length,
      matchingEntries: scoredEntries.length
    };
  },
});

// Clear all test data
export const clearTestData = mutation({
  args: {},
  handler: async (ctx, args) => {
    const allEntries = await ctx.db.query("commonKnowledgeBase").collect();
    
    for (const entry of allEntries) {
      await ctx.db.delete(entry._id);
    }
    
    return { 
      message: "All test data cleared",
      deletedCount: allEntries.length 
    };
  },
});
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getMany = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    return users;
  },
});

// Create or update user approval status when they first authenticate
export const createOrUpdateUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("Not authenticated");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("userApprovals")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      // Update existing user info
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        phone: args.phone,
        lastLoginAt: Date.now(),
        lastUpdated: Date.now(),
      });
      return existingUser;
    }

    // Determine if this is the super admin
    const SUPER_ADMIN_EMAIL = "momai252525@gmail.com";
    const isSuperAdmin = args.email === SUPER_ADMIN_EMAIL;

    // Create new user
    const userId = await ctx.db.insert("userApprovals", {
      userId: identity.subject,
      email: args.email,
      name: args.name,
      phone: args.phone,
      role: isSuperAdmin ? "Super Admin" : "User",
      status: isSuperAdmin ? "Active" : "Pending",
      registeredDate: Date.now(),
      lastLoginAt: Date.now(),
      lastUpdated: Date.now(),
    });

    const newUser = await ctx.db.get(userId);
    return newUser;
  },
});

// Get current user's approval status
export const getCurrentUserStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      return null;
    }

    const user = await ctx.db
      .query("userApprovals")
      .withIndex("by_email", (q) => q.eq("email", identity.email || ""))
      .first();

    return user;
  },
});

export const add = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new Error("Missing organization");
    }

    throw new Error("Tracking test");

    const userId = await ctx.db.insert("users", {
      name: "Sanket Mane",
    });

    return userId;
  },
});

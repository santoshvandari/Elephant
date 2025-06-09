// convex/functions/addElephantData.ts
import { v } from "convex/values";
import { mutation, query } from "../../convex/_generated/server.js";

export const addToken = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("token_Schema", args);
  },
});

export const getToken = query({
  handler: async (ctx, args) => {
    const tokens = await ctx.db.query("token_Schema").order("desc").collect();

    return tokens.map((token) => token.token);
  },
});

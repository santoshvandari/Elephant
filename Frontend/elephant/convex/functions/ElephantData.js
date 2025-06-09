// convex/functions/addElephantData.ts
import { v } from "convex/values";
import { mutation, query } from "../../convex/_generated/server.js";

export const addElephantData = mutation({
  args: {
    type: v.string(),
    camera_id: v.string(),
    location: v.string(),
    message: v.string(),
    timestamp: v.string(),
    confidence: v.number(),
    // image_url: v.string(),
    image_path: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("elephant_Schema", args);
  },
});

export const getAlerts = query({
  handler: async (ctx, args) => {
    const alerts = await ctx.db
      .query("elephant_Schema")
      .order("desc")
      .collect();

    return alerts;
  },
});

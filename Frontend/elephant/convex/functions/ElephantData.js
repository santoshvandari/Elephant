// convex/functions/addElephantData.ts
import { v } from "convex/values";
import { mutation, query } from "../../convex/_generated/server.js";

export const addElephantData = mutation({
  args: {
    type: v.string(),
    camera_id: v.string(),
    location: v.string(),
    message: v.string(),
    timestamp: v.number(),
    confidence: v.number(),
    image_url: v.string(),
    image_path: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("elephant_Schema", args);
  },
});

export const getAlerts = query({
  args: {},
  handler: async (ctx) => {
    const alerts = await ctx.db.query("elephant_Schema").collect();
    return alerts.map((alert) => ({
      id: alert._id,
      type: alert.type,
      camera_id: alert.camera_id,
      location: alert.location,
      message: alert.message,
      timestamp: new Date(alert.timestamp).toLocaleString(),
      confidence: alert.confidence,
      image_url: alert.image_url,
      image_path: alert.image_path,
    }));
  },
});

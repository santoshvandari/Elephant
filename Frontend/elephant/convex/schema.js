// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  elephant_Schema: defineTable({
    type: v.string(),
    camera_id: v.string(),
    location: v.string(),
    message: v.string(),
    timestamp: v.string(),
    confidence: v.number(),
    // image_url: v.string(),
    image_path: v.string(),
  }),
});

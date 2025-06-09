// app/api/elephant/route.ts (Next.js 13+ with app directory)
import { ConvexHttpClient } from "convex/browser"; // Yes, even on server
import { api } from "../../../../convex/_generated/api"; // Adjust path if needed
// import { addElephantData } from "../../../../convex/functions/ElephantData"; // Adjust path if needed

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function POST(request) {
  const body = await request.json();
  console.log("Received body:", body);

  try {
    await convex.mutation(api.functions.ElephantData.addElephantData, {
      type: body.type || "Unknown",
      camera_id: body.camera_id || "Unknown",
      location: body.location || "Unknown",
      message: body.message || "No message",
      timestamp: body.timestamp || Date.now(),
      confidence: body.confidence || 0,
      // image_url: body.image_url,
      image_path: body.image_path || "No image path",
    });

    return Response.json({
      status: 201,
      message: "Data added successfully",
      success: true,
    });
  } catch (err) {
    console.error("Convex error:", err);
    return Response.json({
      status: 500,
      message: "Error adding data",
      success: false,
    });
  }
}

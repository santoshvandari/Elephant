// app/api/elephant/route.ts (Next.js 13+ with app directory)
import { ConvexHttpClient } from "convex/browser"; // Yes, even on server
import { api } from "../../../../convex/_generated/api"; // Adjust path if needed
// import { addElephantData } from "../../../../convex/functions/ElephantData"; // Adjust path if needed

export async function GET() {
  return Response.json({ message: "Hello from the Elephant API!" });
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function POST(request) {
  const body = await request.json();

  try {
    await convex.mutation(api.functions.ElephantData.addElephantData, {
      type: body.type,
      camera_id: body.camera_id,
      location: body.location,
      message: body.message,
      timestamp: body.timestamp,
      confidence: body.confidence,
      image_url: body.image_url,
      image_path: body.image_path,
    });

    return Response.json({
      status: 201,
      message: "Data added successfully",
      success: true,
    });
  } catch (err) {
    console.error("Convex error:", err);
    return new Response.json({
      status: 500,
      message: "Error adding data",
      success: false,
    });
  }
}

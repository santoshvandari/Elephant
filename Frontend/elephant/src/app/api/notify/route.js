import { admin, messaging } from "lib/firebase-admin-config";
import { ConvexHttpClient } from "convex/browser"; // Yes, even on server
import { api } from "../../../../convex/_generated/api"; // Adjust path if needed

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function POST(request) {
  try {
    const res = await request.json();
    const token = await convex.query(api.functions.tokenData.getToken);

    const { title, body, redirectUrl } = res;
    if (!token || !title || !body || !redirectUrl) {
      return Response.json(
        {
          message: "Token, title, and body are required",
        },
        { status: 400 }
      );
    }

    const message = {
      android: {
        notification: {
          title,
          body,
        },
      },

      notification: {
        title,
        body,
      },
      data: {
        url:
          process.env.NEXT_PUBLIC_URL + redirectUrl ||
          process.env.NEXT_PUBLIC_URL + "/welcome",
      },
      webpush: {
        headers: {
          Urgency: "high",
        },
        notification: {
          body: body,
          title: title,
          requireInteraction: "true",
          badge: `${process.env.NEXT_PUBLIC_URL}/favicon.ico`,
        },
      },
    };

    const response = await messaging.sendEachForMulticast({
      tokens: token, // Pass the array of tokens here
      ...message, // Spread the common message properties
    });

    console.log("Push notification response:", response);

    return Response.json({
      message: "Push notification sent successfully",
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses,
    });
  } catch (err) {
    console.error("Error sending push notification:", err);
    return Response.json({
      message: "Failed to send push notification",
      error: err.message || "Unknown error",
    });
  }
}

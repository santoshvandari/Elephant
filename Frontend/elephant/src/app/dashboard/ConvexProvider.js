"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";

// 🔁 Replace this with your actual Convex deployment URL
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export default function ConvexClientProvider({ children }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

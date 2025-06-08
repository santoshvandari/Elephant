"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";

// 🔁 Replace this with your actual Convex deployment URL
const convex = new ConvexReactClient(
  "https://disciplined-cow-391.convex.cloud"
);

export default function ConvexClientProvider({ children }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

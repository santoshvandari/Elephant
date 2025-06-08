"use client";
import { api } from "../../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import React from "react";

function AlertPage() {
  const alerts = useQuery(api.functions.ElephantData.getAlerts);
  return <div>{JSON.stringify(alerts, null, 2)}</div>;
}

export default AlertPage;

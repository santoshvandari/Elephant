import React from "react";
import ElephantWatchDashboard from "./MobileCard";
import NotificationPermission from "components/notificationPermission";

function page() {
  return (
    <div class="flex">
      <ElephantWatchDashboard />
      <NotificationPermission />
    </div>
  );
}

export default page;

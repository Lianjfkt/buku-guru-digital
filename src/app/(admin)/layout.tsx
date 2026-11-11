import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getLayoutData } from "@/lib/layoutData";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const layoutData = await getLayoutData("admin");

  return (
    <AppLayout
      role="admin"
      userName={layoutData.userName}
      schoolName={layoutData.schoolName}
      semesterName={layoutData.semesterName}
    >
      {children}
    </AppLayout>
  );
}


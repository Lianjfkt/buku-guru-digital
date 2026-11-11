import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getLayoutData } from "@/lib/layoutData";

export default async function GuruLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const layoutData = await getLayoutData("guru");

  return (
    <AppLayout
      role="guru"
      userName={layoutData.userName}
      isHomeroom={layoutData.isHomeroom}
      schoolName={layoutData.schoolName}
      semesterName={layoutData.semesterName}
    >
      {children}
    </AppLayout>
  );
}


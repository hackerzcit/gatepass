"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { PageHeader, StatsGrid, PaymentsTable } from "./_components";

export default function PaymentsPage() {
  const sidebar = useStore(useSidebar, (x) => x);
  if (!sidebar) return null;

  return (
    <ContentLayout title="Payments">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <PageHeader />
        <StatsGrid />
        <PaymentsTable />
      </div>
    </ContentLayout>
  );
}

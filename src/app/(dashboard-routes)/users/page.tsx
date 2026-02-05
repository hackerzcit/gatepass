"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { PageHeader, StatsGrid, UsersTable } from "./_components";

export default function UsersPage() {
  const sidebar = useStore(useSidebar, (x) => x);
  if (!sidebar) return null;

  return (
    <ContentLayout title="Users">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <PageHeader />
        <StatsGrid />
        <UsersTable />
      </div>
    </ContentLayout>
  );
}
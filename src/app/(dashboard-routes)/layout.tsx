import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { DatabaseInitializer } from "@/components/database-initializer";

export default function DemoLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DatabaseInitializer />
      <AdminPanelLayout>{children}</AdminPanelLayout>
    </>
  );
}

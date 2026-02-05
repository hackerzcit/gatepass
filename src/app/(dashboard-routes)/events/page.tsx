"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { EventsList, EventDetail } from "./_components/index";
import { useState } from "react";

export default function EventsPage() {
  const sidebar = useStore(useSidebar, (x) => x);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  if (!sidebar) return null;

  return (
    <ContentLayout title="Events">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {selectedEventId ? (
          <EventDetail 
            eventId={selectedEventId} 
            onBack={() => setSelectedEventId(null)} 
          />
        ) : (
          <EventsList onEventSelect={setSelectedEventId} />
        )}
      </div>
    </ContentLayout>
  );
}
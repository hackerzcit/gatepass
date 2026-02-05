"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2, ChevronRight, Users, RefreshCw } from "lucide-react";
import { useEventsList } from "../../_hooks/events-queries";
import { toast } from "sonner";
import { useState } from "react";

interface EventsListProps {
  onEventSelect: (eventId: string) => void;
}

export default function EventsList({ onEventSelect }: EventsListProps) {
  const { events, loading, error } = useEventsList();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    try {
      setSyncing(true);
      const tokenResponse = await fetch("/api/auth/get-token");
      if (!tokenResponse.ok) {
        toast.error("Failed to fetch access token");
        return;
      }

      const { access_token } = await tokenResponse.json();
      
      // Call sync pull API
      const syncResponse = await fetch('/api/sync/pull', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token }),
      });

      if (!syncResponse.ok) {
        throw new Error('Sync failed');
      }

      const result = await syncResponse.json();

      toast.success("Sync completed successfully", {
        description: `Events: ${result.counts?.events || 0}, Enrollments: ${result.counts?.enrollments || 0}`,
      });
      window.location.reload();
    } catch (error) {
      console.error("Error syncing:", error);
      toast.error("Sync failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-2 border-red-200">
        <CardContent className="py-8">
          <p className="text-center text-red-600">Error loading events: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-orange-700 dark:text-orange-400">
            Events
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Select an event to view enrolled users and mark attendance
          </p>
        </div>
        <Button
          onClick={handleSync}
          disabled={syncing}
          variant="outline"
          className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/30"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync Events"}
        </Button>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <Card className="border-2 border-orange-200">
          <CardContent className="py-12 text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-orange-300" />
            <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-400 mb-2">
              No Events Found
            </h3>
            <p className="text-muted-foreground">
              Sync data to load events from the server
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => {
            // Try multiple possible field names for event name
            const eventName = event.name || 
                             event.event_name || 
                             event.title || 
                             event.eventName ||
                             "Unnamed Event";
            
            // Try multiple possible field names for description
            const eventDescription = event.description || 
                                    event.event_description || 
                                    event.desc ||
                                    "";

            return (
              <Card
                key={event.event_id}
                className="border-2 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
                onClick={() => onEventSelect(event.event_id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg text-orange-700 dark:text-orange-400 flex items-start gap-2">
                    <Calendar className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{eventName}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {eventDescription && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {eventDescription}
                    </p>
                  )}
                  
                  {/* Show all event properties for debugging */}
                 
                  
                  <div className="flex items-center justify-between pt-2 border-t border-orange-100">
                    <span className="text-xs text-orange-600 font-mono">
                      {event.event_id.slice(0, 8)}...
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                    >
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stats Footer */}
      {events.length > 0 && (
        <Card className="border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30">
          <CardContent className="py-4">
            <div className="flex items-center justify-center gap-2 text-sm text-orange-700 dark:text-orange-400">
              <Users className="h-4 w-4" />
              <span className="font-semibold">{events.length}</span>
              <span>event{events.length !== 1 ? "s" : ""} available</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
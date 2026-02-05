"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2, ChevronRight, Users, RefreshCw } from "lucide-react";
import { useEventsList } from "../../../../module/events/queries";
import { useSyncPull } from "../../../../module/events/mutation";
import { toast } from "sonner";

interface EventsListProps {
  onEventSelect: (eventId: string) => void;
}

export default function EventsList({ onEventSelect }: EventsListProps) {
  const { data: events = [], isLoading, error } = useEventsList();
  const syncMutation = useSyncPull();

  const handleSync = () => {
    syncMutation.mutate(undefined, {
      onSuccess: (data) => {
        toast.success("Sync completed successfully", {
          description: `Users: ${data.counts?.users || 0}, Events: ${data.counts?.events || 0}, Enrollments: ${data.counts?.enrollments || 0}`,
        });
      },
      onError: (error) => {
        toast.error("Sync failed", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      },
    });
  };

  if (isLoading) {
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
          <p className="text-center text-red-600">
            Error loading events: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Same style as Users Page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-orange-700 dark:text-orange-400">
            Event Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Select an event to view enrolled users and mark attendance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSync}
            disabled={syncMutation.isPending}
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/30 hover:text-orange-700"
          >
            <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`} />
            {syncMutation.isPending ? "Syncing..." : "Sync Events"}
          </Button>
        </div>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <Card className="border-2 border-orange-200">
          <CardContent className="py-12 text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-orange-300" />
            <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-400 mb-2">
              No Events Found
            </h3>
            <p className="text-muted-foreground mb-4">
              Sync data to load events from the server
            </p>
            <Button
              onClick={handleSync}
              disabled={syncMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`} />
              {syncMutation.isPending ? "Syncing..." : "Sync Now"}
            </Button>
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
                  
                  <div className="flex items-center justify-between pt-2 border-t border-orange-100">
                    <span className="text-xs text-orange-600 font-mono">
                      {event.event_id.slice(0, 8)}...
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        onEventSelect(event.event_id);
                      }}
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
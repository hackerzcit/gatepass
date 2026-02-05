"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  AnalyticsEvents,
  EventWiseAttendance,
  TopEvent,
} from "../../../_hooks/analytics-queries";

interface EventsSectionProps {
  events: AnalyticsEvents | null;
}

export function EventsSection({ events }: EventsSectionProps) {
  if (!events) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">
            Top events by attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {events.topEvents.slice(0, 5).map((e: TopEvent) => (
              <li
                key={e.event_id}
                className="flex justify-between items-center text-sm py-1 border-b border-border/50 last:border-0"
              >
                <span className="truncate pr-2" title={e.event_name}>
                  {e.event_name}
                </span>
                <span className="font-medium tabular-nums shrink-0">
                  {e.attendanceCount.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">
            Event-wise attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[280px] w-full rounded-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Event</th>
                  <th className="text-right py-2 font-medium">Attendance</th>
                  <th className="text-right py-2 font-medium">Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {events.eventWiseAttendance.map((e: EventWiseAttendance) => (
                  <tr key={e.event_id} className="border-b border-border/50">
                    <td className="py-1.5 truncate max-w-[180px]" title={e.event_name}>
                      {e.event_name}
                    </td>
                    <td className="text-right tabular-nums">
                      {e.attendanceCount.toLocaleString()}
                    </td>
                    <td className="text-right tabular-nums text-muted-foreground">
                      {e.enrollmentCount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

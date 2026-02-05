"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  AnalyticsEntries,
  AnalyticsAttendance,
  RecentEntry,
  RecentAttendance,
} from "../../../_hooks/analytics-queries";
import { formatDistanceToNow } from "date-fns";

interface EntriesAttendanceSectionProps {
  entries: AnalyticsEntries | null;
  attendance: AnalyticsAttendance | null;
}

function EntryRow({ e }: { e: RecentEntry }) {
  const date = new Date(e.created_at);
  return (
    <div className="flex justify-between items-start gap-2 py-2 border-b border-border/50 last:border-0 text-sm">
      <div className="min-w-0">
        <p className="font-medium truncate">{e.user_name}</p>
        <p className="text-muted-foreground text-xs">
          {e.unique_code} · {e.source}
        </p>
      </div>
      <span className="text-muted-foreground text-xs shrink-0">
        {formatDistanceToNow(date, { addSuffix: true })}
      </span>
    </div>
  );
}

function AttendanceRow({ a }: { a: RecentAttendance }) {
  const date = new Date(a.created_at);
  return (
    <div className="flex justify-between items-start gap-2 py-2 border-b border-border/50 last:border-0 text-sm">
      <div className="min-w-0">
        <p className="font-medium truncate">{a.user_name}</p>
        <p className="text-muted-foreground text-xs">
          {a.unique_code} → {a.event_name}
        </p>
      </div>
      <span className="text-muted-foreground text-xs shrink-0">
        {formatDistanceToNow(date, { addSuffix: true })}
      </span>
    </div>
  );
}

export function EntriesAttendanceSection({
  entries,
  attendance,
}: EntriesAttendanceSectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">
            Recent entries
          </CardTitle>
          {entries && (
            <span className="text-xs text-muted-foreground">
              Total: {entries.total}
            </span>
          )}
        </CardHeader>
        <CardContent>
          {entries?.sourceDistribution && entries.sourceDistribution.length > 0 && (
            <div className="flex gap-4 mb-3 text-xs text-muted-foreground">
              {entries.sourceDistribution.map((s) => (
                <span key={s.source}>
                  {s.source}: {s.count}
                </span>
              ))}
            </div>
          )}
          <div className="max-h-[240px] overflow-auto">
            {entries?.recent?.length ? (
              entries.recent.map((e) => <EntryRow key={e.entry_id} e={e} />)
            ) : (
              <p className="text-sm text-muted-foreground py-4">
                No recent entries
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">
            Recent attendance
          </CardTitle>
          {attendance && (
            <span className="text-xs text-muted-foreground">
              Total: {attendance.total}
            </span>
          )}
        </CardHeader>
        <CardContent>
          <div className="max-h-[240px] overflow-auto">
            {attendance?.recent?.length ? (
              attendance.recent.map((a) => (
                <AttendanceRow key={a.attendance_id} a={a} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-4">
                No recent attendance
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  AnalyticsUsers,
  GenderDistribution,
  DepartmentDistribution,
  YearDistribution,
} from "../../../_hooks/analytics-queries";
import { cn } from "@/lib/utils";

function BarRow({
  label,
  count,
  total,
}: {
  label: string;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-24 shrink-0 truncate" title={label}>
        {label}
      </span>
      <div className="flex-1 h-5 min-w-0 rounded bg-muted overflow-hidden">
        <div
          className="h-full rounded bg-primary/80 transition-all duration-500"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <span className="w-12 text-right font-medium tabular-nums">
        {count.toLocaleString()}
      </span>
    </div>
  );
}

interface UsersSectionProps {
  users: AnalyticsUsers | null;
}

export function UsersSection({ users }: UsersSectionProps) {
  if (!users) return null;

  const genderTotal = users.genderDistribution.reduce((s, g) => s + g.count, 0);
  const deptTotal = users.departmentDistribution.reduce(
    (s, d) => s + d.count,
    0
  );
  const yearTotal = users.yearDistribution.reduce((s, y) => s + y.count, 0);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">
            User type
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Online</span>
            <span className="font-medium">
              {users.onlineUsers.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>On-spot</span>
            <span className="font-medium">
              {users.onspotUsers.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">
            Gender
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {users.genderDistribution.map((g: GenderDistribution) => (
            <BarRow
              key={g.gender}
              label={g.gender}
              count={g.count}
              total={genderTotal}
            />
          ))}
        </CardContent>
      </Card>

      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">
            Year
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {users.yearDistribution.map((y: YearDistribution) => (
            <BarRow
              key={y.year}
              label={`Year ${y.year}`}
              count={y.count}
              total={yearTotal}
            />
          ))}
        </CardContent>
      </Card>

      <Card className="md:col-span-3 border-orange-200 dark:border-orange-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">
            Department
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {users.departmentDistribution.map((d: DepartmentDistribution) => (
              <BarRow
                key={d.department}
                label={d.department}
                count={d.count}
                total={deptTotal}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  CreditCard,
  Loader2,
  LogIn,
  Users,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalyticsOverview } from "../../../_hooks/analytics-queries";

const STAT_CONFIG: Array<{
  key: keyof AnalyticsOverview;
  title: string;
  icon: LucideIcon;
  format?: (v: number | string) => string;
}> = [
  { key: "totalUsers", title: "Total Users", icon: Users },
  { key: "totalEvents", title: "Total Events", icon: Calendar },
  { key: "totalEntryLogs", title: "Entry Logs", icon: LogIn },
  { key: "totalAttendance", title: "Attendance", icon: UserCheck },
  {
    key: "totalPayments",
    title: "Payments",
    icon: CreditCard,
  },
  {
    key: "totalPaymentAmount",
    title: "Payment Amount (₹)",
    icon: CreditCard,
    format: (v) =>
      typeof v === "string"
        ? Number(v).toLocaleString("en-IN", { maximumFractionDigits: 0 })
        : String(v),
  },
];

interface OverviewCardsProps {
  overview: AnalyticsOverview | null;
  loading: boolean;
}

export function OverviewCards({ overview, loading }: OverviewCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {STAT_CONFIG.map(({ key, title, icon: Icon, format }, index) => {
        const raw = overview?.[key];
        const value =
          format && raw !== undefined
            ? format(raw)
            : typeof raw === "number"
              ? raw.toLocaleString()
              : raw ?? "—";
        return (
          <Card
            key={key}
            className={cn(
              "relative overflow-hidden transition-all duration-300 hover:shadow-lg border-2 border-orange-200 dark:border-orange-800",
              "animate-in fade-in-50 slide-in-from-bottom-4"
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-orange-700 dark:text-orange-400 truncate">
                {title}
              </CardTitle>
              <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/30 shrink-0">
                <Icon className="h-3.5 w-3.5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
              ) : (
                <div className="text-xl font-bold text-orange-600 dark:text-orange-500 truncate">
                  {value}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

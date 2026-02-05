"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CreditCard, Loader2, UserCheck, Users, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStats, type DashboardStats } from "../../_hooks/queries";

// ============================================================
// Internal StatCard Component
// ============================================================

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  loading?: boolean;
  animationDelay?: number;
}

function StatCard({ title, value, icon: Icon, loading = false, animationDelay = 0 }: StatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        "border-2 border-orange-200 dark:border-orange-800",
        "animate-in fade-in-50 slide-in-from-bottom-4",
        `animation-delay-${animationDelay}`
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">
          {title}
        </CardTitle>
        <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/30">
          <Icon className="h-4 w-4 text-orange-600" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          </div>
        ) : (
          <div className="text-3xl md:text-4xl font-bold text-orange-600 dark:text-orange-500">
            {value.toLocaleString()}
          </div>
        )}
      </CardContent>
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-600/20 opacity-5 pointer-events-none" />
    </Card>
  );
}

// ============================================================
// Stat Configuration
// ============================================================

const STAT_CONFIG: Array<{
  key: keyof DashboardStats;
  title: string;
  icon: LucideIcon;
}> = [
  { key: "totalUsers", title: "Total Users", icon: Users },
  { key: "totalEvents", title: "Total Events", icon: Calendar },
  { key: "totalEnrollments", title: "Total Enrollments", icon: UserCheck },
  { key: "totalPayments", title: "Total Payments", icon: CreditCard },
];

// ============================================================
// Main StatsGrid Component
// ============================================================

export function StatsGrid() {
  const { stats, loading } = useDashboardStats();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {STAT_CONFIG.map(({ key, title, icon }, index) => (
        <StatCard
          key={key}
          title={title}
          value={stats[key]}
          icon={icon}
          loading={loading}
          animationDelay={index * 100}
        />
      ))}
    </div>
  );
}

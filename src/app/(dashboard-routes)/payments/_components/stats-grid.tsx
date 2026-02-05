"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useDashboardStats } from "../../_hooks/queries";
import { Wallet, CreditCard, Banknote, IndianRupee } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function StatsGrid() {
    const { stats, loading } = useDashboardStats();

    const statCards = [
        {
            title: "Total Payments",
            value: stats.totalPayments,
            icon: Wallet,
            color: "text-orange-600",
            bg: "bg-orange-50 dark:bg-orange-950/30",
            border: "border-orange-200 dark:border-orange-800",
        },
        {
            title: "Successfully Paid",
            value: stats.totalPayments, // Assuming all in DB are successful for now as per schema
            icon: CreditCard,
            color: "text-orange-600",
            bg: "bg-orange-50 dark:bg-orange-950/30",
            border: "border-orange-200 dark:border-orange-800",
        },
        {
            title: "Total Events",
            value: stats.totalEvents,
            icon: IndianRupee,
            color: "text-orange-600",
            bg: "bg-orange-50 dark:bg-orange-950/30",
            border: "border-orange-200 dark:border-orange-800",
        },
        {
            title: "Enrollments",
            value: stats.totalEnrollments,
            icon: Banknote,
            color: "text-orange-600",
            bg: "bg-orange-50 dark:bg-orange-950/30",
            border: "border-orange-200 dark:border-orange-800",
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => (
                <Card
                    key={card.title}
                    className={cn(
                        "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                        "border-2 border-orange-200 dark:border-orange-800",
                        "animate-in fade-in-50 slide-in-from-bottom-4",
                    )}
                >
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                    {card.title}
                                </p>
                                <p className={`text-2xl font-bold ${card.color}`}>
                                    {card.value.toLocaleString()}
                                </p>
                            </div>
                            <div className={`p-2 rounded-lg ${card.bg}`}>
                                <card.icon className={`h-6 w-6 ${card.color}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

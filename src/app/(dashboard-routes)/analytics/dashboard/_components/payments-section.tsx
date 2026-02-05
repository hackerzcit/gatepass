"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsPayments } from "../../../_hooks/analytics-queries";

interface PaymentsSectionProps {
  payments: AnalyticsPayments | null;
}

export function PaymentsSection({ payments }: PaymentsSectionProps) {
  if (!payments) return null;

  const amountDisplay = (s: string) =>
    Number(s).toLocaleString("en-IN", { maximumFractionDigits: 2 });

  return (
    <Card className="border-orange-200 dark:border-orange-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">
          Payments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total amount</p>
            <p className="font-semibold text-lg">
              ₹ {amountDisplay(payments.totalAmount)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Total count</p>
            <p className="font-semibold">{payments.totalCount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Average</p>
            <p className="font-semibold">
              ₹ {amountDisplay(payments.averagePayment)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";
import {Wallet} from "lucide-react"

export function PageHeader() {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold text-orange-700 dark:text-orange-400 flex items-center gap-2">
                    <Wallet className="h-6 w-6" />
                    Payments Management
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    View and search all user payments across events
                </p>
            </div>
        </div>
    );
}

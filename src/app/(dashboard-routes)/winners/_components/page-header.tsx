"use client";

import { Button } from "@/components/ui/button";
import { Trophy, Plus, FileSpreadsheet, Loader2 } from "lucide-react";
import Link from "next/link";

interface PageHeaderProps {
    onExport?: () => void;
    exportLoading?: boolean;
    exportDisabled?: boolean;
}

export function PageHeader({ onExport, exportLoading, exportDisabled }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold text-orange-700 dark:text-orange-400 flex items-center gap-2">
                    <Trophy className="h-6 w-6" />
                    Winners Management
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    View all event winners and declare new ones
                </p>
            </div>

            <div className="flex items-center gap-3">
                {onExport && (
                    <Button
                        variant="outline"
                        onClick={onExport}
                        disabled={exportLoading || exportDisabled}
                        className="gap-2 border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/30"
                    >
                        {exportLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <FileSpreadsheet className="h-4 w-4" />
                        )}
                        Export to Excel
                    </Button>
                )}
                <Link href="/winners/declare">
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
                        <Plus className="h-4 w-4" />
                        Declare Winner
                    </Button>
                </Link>
            </div>
        </div>
    );
}

"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, ListFilter } from "lucide-react";

interface ExportOptionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onExportAll: () => void;
    onExportSelected: () => void;
    selectedEventName: string | null;
    exportLoading: boolean;
}

export function ExportOptionsDialog({
    open,
    onOpenChange,
    onExportAll,
    onExportSelected,
    selectedEventName,
    exportLoading,
}: ExportOptionsDialogProps) {
    const hasSelection = !!selectedEventName;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md border-orange-200 dark:border-orange-800">
                <DialogHeader>
                    <DialogTitle className="text-orange-700 dark:text-orange-400">
                        Export winners to Excel
                    </DialogTitle>
                    <DialogDescription>
                        Choose what to export: all events with incomplete
                        winners, or only the currently selected event.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3 py-2">
                    <Button
                        onClick={() => {
                            onExportAll();
                            onOpenChange(false);
                        }}
                        disabled={exportLoading}
                        variant="outline"
                        className="w-full justify-start gap-3 h-auto py-3 border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/30"
                    >
                        <FileSpreadsheet className="h-5 w-5 shrink-0" />
                        <span className="text-left">
                            <strong>All events</strong>
                            <br />
                            <span className="text-muted-foreground text-xs">
                                One sheet per event that doesn’t have all 3
                                ranks declared yet
                            </span>
                        </span>
                    </Button>
                    <Button
                        onClick={() => {
                            onExportSelected();
                            onOpenChange(false);
                        }}
                        disabled={exportLoading || !hasSelection}
                        variant="outline"
                        className="w-full justify-start gap-3 h-auto py-3 border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/30 disabled:opacity-50"
                    >
                        <ListFilter className="h-5 w-5 shrink-0" />
                        <span className="text-left">
                            <strong>Selected event only</strong>
                            <br />
                            <span className="text-muted-foreground text-xs">
                                {hasSelection
                                    ? `Export winners for: ${selectedEventName}`
                                    : "Select an event from the filter above first"}
                            </span>
                        </span>
                    </Button>
                </div>
                <DialogFooter className="sr-only">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

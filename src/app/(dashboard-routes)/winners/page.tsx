"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { searchWinners } from "@/module/winners/api";
import { useWinnersSearch, useWinnersEvents } from "@/module/winners/queries";
import { EnrichedWinner } from "@/module/winners/types";
import {
    ExportOptionsDialog,
    PageHeader,
    WinnersTable,
} from "./_components";

const REQUIRED_RANKS = [1, 2, 3] as const;

/** Excel sheet names: max 31 chars, no \ / * ? : [ ] */
function sanitizeSheetName(name: string): string {
    const sanitized = name.replace(/[\/*?:\[\]\\]/g, "").slice(0, 31);
    return sanitized || "Sheet";
}

function winnersToRows(winners: EnrichedWinner[]) {
    return winners
        .sort((a, b) => a.rank - b.rank)
        .map((w) => ({
            Rank: w.rank,
            "Winner Name": w.user?.name ?? "—",
            Email: w.user?.email ?? "—",
            Phone: w.user?.mobile_number ?? "—",
            College: w.user?.college ?? "—",
            Department: w.user?.department ?? "—",
            Code: w.user?.unique_code ?? "—",
            "Declared At": w.created_at
                ? new Date(w.created_at).toLocaleString()
                : "—",
        }));
}

/** Events that don't have all 3 ranks (1st, 2nd, 3rd) declared yet */
function getIncompleteEventsByEvent(
    allWinners: EnrichedWinner[]
): Map<string, { eventName: string; winners: EnrichedWinner[] }> {
    const byEvent = new Map<
        string,
        { eventName: string; winners: EnrichedWinner[] }
    >();
    for (const w of allWinners) {
        const id = w.event_id;
        const ev = w.event as
            | { name?: string; event_name?: string; title?: string }
            | undefined;
        const eventName =
            ev?.name ?? ev?.event_name ?? ev?.title ?? `Event (${id?.slice(-6) ?? "?"})`;
        if (!byEvent.has(id)) byEvent.set(id, { eventName, winners: [] });
        byEvent.get(id)!.winners.push(w);
    }
    const incomplete = new Map<
        string,
        { eventName: string; winners: EnrichedWinner[] }
    >();
    Array.from(byEvent.entries()).forEach(
        ([eventId, { eventName, winners }]) => {
            const declaredRanks = new Set(
                winners.map((w: EnrichedWinner) => w.rank)
            );
            const hasAllThree = REQUIRED_RANKS.every((r) =>
                declaredRanks.has(r)
            );
            if (!hasAllThree) incomplete.set(eventId, { eventName, winners });
        }
    );
    return incomplete;
}

export default function WinnersPage() {
    const sidebar = useStore(useSidebar, (x) => x);
    const {
        winners,
        loading,
        searchQuery,
        setSearchQuery,
        eventFilter,
        setEventFilter,
    } = useWinnersSearch();
    const { events, loading: loadingEvents } = useWinnersEvents();
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [exporting, setExporting] = useState(false);

    const selectedEvent = events.find((e) => e.event_id === eventFilter);
    const selectedEventName =
        eventFilter === "all"
            ? null
            : (selectedEvent?.name ??
                  (selectedEvent as { event_name?: string })?.event_name ??
                  `Event (${eventFilter?.slice(-6) ?? "?"})`);

    const handleExportAll = useCallback(async () => {
        setExporting(true);
        try {
            const allWinners = await searchWinners({
                searchQuery: "",
                eventFilter: "all",
            });
            const incomplete = getIncompleteEventsByEvent(allWinners);

            if (incomplete.size === 0) {
                toast.info(
                    "All events have 3 ranks declared. Nothing to export."
                );
                return;
            }

            const wb = XLSX.utils.book_new();
            Array.from(incomplete.entries()).forEach(
                ([, { eventName, winners: eventWinners }]) => {
                    const rows = winnersToRows(eventWinners);
                    const ws = XLSX.utils.json_to_sheet(rows);
                    const sheetName = sanitizeSheetName(eventName);
                    XLSX.utils.book_append_sheet(wb, ws, sheetName);
                }
            );
            const date = new Date().toISOString().slice(0, 10);
            XLSX.writeFile(wb, `winners-incomplete-events-${date}.xlsx`);
        } finally {
            setExporting(false);
        }
    }, []);

    const handleExportSelected = useCallback(async () => {
        if (eventFilter === "all") return;
        setExporting(true);
        try {
            const eventWinners = await searchWinners({
                searchQuery: "",
                eventFilter,
            });
            const name =
                selectedEventName ?? `Event (${eventFilter?.slice(-6) ?? "?"})`;
            if (eventWinners.length === 0) {
                toast.info(`No winners declared yet for ${name}.`);
                return;
            }
            const wb = XLSX.utils.book_new();
            const rows = winnersToRows(eventWinners);
            const ws = XLSX.utils.json_to_sheet(rows);
            XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(name));
            const date = new Date().toISOString().slice(0, 10);
            XLSX.writeFile(
                wb,
                `winners-${sanitizeSheetName(name).replace(/\s+/g, "-")}-${date}.xlsx`
            );
        } finally {
            setExporting(false);
        }
    }, [eventFilter, selectedEventName]);

    const handleExportClick = useCallback(() => {
        setExportDialogOpen(true);
    }, []);

    if (!sidebar) return null;

    return (
        <ContentLayout title="Winners">
            <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
                <PageHeader
                    onExport={handleExportClick}
                    exportLoading={exporting}
                    exportDisabled={loading}
                />
                <WinnersTable
                    winners={winners}
                    loading={loading}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    eventFilter={eventFilter}
                    setEventFilter={setEventFilter}
                    events={events}
                    loadingEvents={loadingEvents}
                />
                <ExportOptionsDialog
                    open={exportDialogOpen}
                    onOpenChange={setExportDialogOpen}
                    onExportAll={handleExportAll}
                    onExportSelected={handleExportSelected}
                    selectedEventName={selectedEventName}
                    exportLoading={exporting}
                />
            </div>
        </ContentLayout>
    );
}

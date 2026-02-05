"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    Loader2,
    Wallet,
    Mail,
    UserCircle,
    Hash,
    Filter,
    CreditCard,
    QrCode,
    Calendar,
} from "lucide-react";
import { usePaymentsSearch, useEvents } from "@/module/payments/queries";
import { EnrichedPayment } from "@/module/payments/types";
import { Event } from "@/db";
import { Badge } from "@/components/ui/badge";

export function PaymentsTable() {
    const {
        payments,
        loading,
        searchQuery,
        setSearchQuery,
        eventFilter,
        setEventFilter,
        page,
        setPage,
        pageSize,
        totalCount,
        totalPages,
    } = usePaymentsSearch();

    const { events, loading: loadingEvents } = useEvents();

    return (
        <Card className="border-2 border-orange-200 dark:border-orange-800">
            <CardHeader className="space-y-4">
                <CardTitle className="text-xl text-orange-700 dark:text-orange-400 flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Search Payments
                </CardTitle>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, code, or payment ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 border-orange-300 focus-visible:ring-orange-500"
                        />
                    </div>

                    <div className="w-full md:w-64">
                        <Select value={eventFilter} onValueChange={setEventFilter}>
                            <SelectTrigger className="border-orange-300 focus:ring-orange-500">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="Filter by Event" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Events</SelectItem>
                                {events.map((event: Event) => (
                                    <SelectItem key={event.event_id || (event as any).id} value={event.event_id || (event as any).id}>
                                        {event.name || event.title || event.event_name || event.event_id || event.id}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                    </div>
                )}

                {!loading && payments.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-30" />
                        <p>
                            {searchQuery || eventFilter !== "all"
                                ? "No payments found matching your criteria"
                                : "No payments recorded yet"}
                        </p>
                    </div>
                )}

                {!loading && payments.length > 0 && (
                    <div className="rounded-lg border border-orange-200 dark:border-orange-800 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-50 dark:hover:bg-orange-950/30">
                                    <TableHead className="font-semibold text-orange-700 dark:text-orange-400">
                                        User Info
                                    </TableHead>
                                    <TableHead className="font-semibold text-orange-700 dark:text-orange-400">
                                        Event
                                    </TableHead>
                                    <TableHead className="font-semibold text-orange-700 dark:text-orange-400">
                                        Payment ID
                                    </TableHead>
                                    <TableHead className="font-semibold text-orange-700 dark:text-orange-400 text-right">
                                        Amount
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.map((payment: EnrichedPayment) => (
                                    <TableRow
                                        key={payment.payment_id}
                                        className="hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-colors"
                                    >
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <div className="font-medium flex items-center gap-2">
                                                    {payment.user?.name || "Unknown User"}
                                                    <Badge variant="outline" className="text-[10px] px-1.5 h-4 border-orange-200 text-orange-600">
                                                        {payment.user?.unique_code}
                                                    </Badge>
                                                </div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {payment.user?.email || "No email"}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <div className="text-sm font-medium">
                                                    {payment.event?.name ||
                                                        payment.event?.event_name ||
                                                        payment.event?.title ||
                                                        "Unknown Event"}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                                    {payment.event_id || payment.eventId}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-xs font-mono bg-orange-50 dark:bg-orange-950/50 px-1.5 py-0.5 rounded border border-orange-100 dark:border-orange-900">
                                                {payment.payment_id || payment.paymentId}
                                            </code>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-orange-600">
                                            ₹150
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="px-4 py-3 bg-orange-50 dark:bg-orange-950/30 border-t border-orange-200 dark:border-orange-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-orange-700 dark:text-orange-400">
                                Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{" "}
                                <span className="font-medium">
                                    {Math.min(page * pageSize, totalCount)}
                                </span>{" "}
                                of <span className="font-medium">{totalCount}</span> results
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="border-orange-200 text-orange-700 hover:bg-orange-100"
                                >
                                    Previous
                                </Button>
                                <div className="text-sm font-medium px-2">
                                    Page {page} of {totalPages || 1}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                    className="border-orange-200 text-orange-700 hover:bg-orange-100"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

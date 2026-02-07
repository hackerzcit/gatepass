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
    Trophy,
    Filter,
    User,
    Medal,
    Calendar,
    XCircle,
    Pencil,
} from "lucide-react";
import { useRemoveWinner } from "@/module/winners/mutations";
import { Badge } from "@/components/ui/badge";
import { EnrichedWinner } from "@/module/winners/types";
import Link from "next/link";

interface EventOption {
    event_id: string;
    name?: string;
    event_name?: string;
}

interface WinnersTableProps {
    winners: EnrichedWinner[];
    loading: boolean;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    eventFilter: string;
    setEventFilter: (v: string) => void;
    events: EventOption[];
    loadingEvents: boolean;
}

export function WinnersTable({
    winners,
    loading,
    searchQuery,
    setSearchQuery,
    eventFilter,
    setEventFilter,
    events,
    loadingEvents,
}: WinnersTableProps) {
    const removeWinnerMutation = useRemoveWinner();

    const getRankBadge = (rank: number) => {
        switch (rank) {
            case 1:
                return (
                    <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white gap-1">
                        <Medal className="h-3 w-3" /> 1st Place
                    </Badge>
                );
            case 2:
                return (
                    <Badge className="bg-slate-400 hover:bg-slate-500 text-white gap-1">
                        <Medal className="h-3 w-3" /> 2nd Place
                    </Badge>
                );
            case 3:
                return (
                    <Badge className="bg-amber-700 hover:bg-amber-800 text-white gap-1">
                        <Medal className="h-3 w-3" /> 3rd Place
                    </Badge>
                );
            default:
                return <Badge variant="outline">{rank}</Badge>;
        }
    };

    return (
        <Card className="border-2 border-orange-200 dark:border-orange-800">
            <CardHeader className="space-y-4">
                <CardTitle className="text-xl text-orange-700 dark:text-orange-400 flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Winners List
                </CardTitle>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, code, or event..."
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
                                {events.map((event) => (
                                    <SelectItem key={event.event_id} value={event.event_id}>
                                        {event.event_name || event.name || `Event (${event.event_id?.slice(-6)})`}
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

                {!loading && winners.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <Trophy className="h-12 w-12 mx-auto mb-2 opacity-30" />
                        <p>
                            {searchQuery || eventFilter !== "all"
                                ? "No winners found matching your criteria"
                                : "No winners declared yet"}
                        </p>
                    </div>
                )}

                {!loading && winners.length > 0 && (
                    <div className="rounded-lg border border-orange-200 dark:border-orange-800 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-50 dark:hover:bg-orange-950/30">
                                    <TableHead className="font-semibold text-orange-700 dark:text-orange-400">
                                        Rank
                                    </TableHead>
                                    <TableHead className="font-semibold text-orange-700 dark:text-orange-400">
                                        Winner Details
                                    </TableHead>
                                    <TableHead className="font-semibold text-orange-700 dark:text-orange-400">
                                        Event
                                    </TableHead>
                                    <TableHead className="font-semibold text-orange-700 dark:text-orange-400 text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {winners.sort((a, b) => a.rank - b.rank).map((winner: EnrichedWinner) => (
                                    <TableRow
                                        key={winner.winner_id}
                                        className="hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-colors"
                                    >
                                        <TableCell>
                                            {getRankBadge(winner.rank)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <div className="font-medium flex items-center gap-2">
                                                    {winner.user?.name || "Unknown User"}
                                                    <Badge variant="outline" className="text-[10px] px-1.5 h-4 border-orange-200 text-orange-600">
                                                        {winner.user?.unique_code}
                                                    </Badge>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {winner.user?.email}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <div className="text-sm font-medium">
                                                    {winner.event?.name || `Event (${winner.event_id.slice(-6)})`}
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(winner.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right flex items-center justify-end gap-1">
                                            <Link href={`/winners/declare?eventId=${winner.event_id}`}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeWinnerMutation.mutate(winner.winner_id)}
                                                disabled={removeWinnerMutation.isPending}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

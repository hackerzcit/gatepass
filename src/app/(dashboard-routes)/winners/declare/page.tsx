"use client";

import { useState, useEffect } from "react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Trophy,
    Search,
    User as UserIcon,
    ChevronLeft,
    Loader2,
    Check,
    Medal,
    Plus,
    Trash2
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUsersSearch } from "@/module/users/queries";
import { useWinnersEvents, useWinnersForEvent } from "@/module/winners/queries";
import { useBulkAddWinners } from "@/module/winners/mutations";
import { Badge } from "@/components/ui/badge";

interface WinnerSelection {
    rank: number;
    user: any | null;
}

export default function DeclareWinnerPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const eventIdParam = searchParams.get("eventId");

    const { events: winnersEvents, loading: loadingEvents } = useWinnersEvents();
    const { users, loading: searchingUsers, searchQuery, setSearchQuery } = useUsersSearch();

    const [selectedEvent, setSelectedEvent] = useState<string>(eventIdParam || "");
    const { winners: existingWinners, loading: loadingExisting } = useWinnersForEvent(selectedEvent);
    const bulkAddMutation = useBulkAddWinners();

    const [selections, setSelections] = useState<WinnerSelection[]>([
        { rank: 1, user: null },
        { rank: 2, user: null },
        { rank: 3, user: null },
    ]);
    const [activeRankIndex, setActiveRankIndex] = useState<number | null>(null);

    // Synchronize event ID from URL only on initial load
    useEffect(() => {
        if (eventIdParam && !selectedEvent) {
            setSelectedEvent(eventIdParam);
        }
    }, [eventIdParam]);

    // Handle winner loading when event changes or existing winners load
    useEffect(() => {
        const newSelections: WinnerSelection[] = [
            { rank: 1, user: null },
            { rank: 2, user: null },
            { rank: 3, user: null },
        ];

        if (existingWinners && existingWinners.length > 0) {
            existingWinners.forEach(winner => {
                const idx = newSelections.findIndex(s => s.rank === winner.rank);
                if (idx !== -1) {
                    newSelections[idx].user = winner.user || {
                        user_id: winner.user_id,
                        name: "Winner (ID: " + winner.user_id.slice(-4) + ")",
                        unique_code: "???"
                    };
                }
            });
        }

        setSelections(newSelections);
    }, [existingWinners, selectedEvent]);

    const handleSelectUser = (user: any) => {
        if (activeRankIndex === null) return;

        const newSelections = [...selections];
        newSelections[activeRankIndex].user = user;
        setSelections(newSelections);
        setActiveRankIndex(null);
        setSearchQuery("");
    };

    const handleRemoveUser = (index: number) => {
        const newSelections = [...selections];
        newSelections[index].user = null;
        setSelections(newSelections);
    };

    const handleSubmit = async () => {
        if (!selectedEvent) return;

        const winners = selections
            .filter(s => s.user !== null)
            .map(s => ({
                user_id: s.user.user_id,
                rank: s.rank
            }));
        bulkAddMutation.mutate(
            {
                event_id: selectedEvent,
                winners: winners,
            },
            {
                onSuccess: () => {
                    router.push("/winners");
                },
            }
        );
    };

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return "text-yellow-500 bg-yellow-50 border-yellow-200";
            case 2: return "text-slate-400 bg-slate-50 border-slate-200";
            case 3: return "text-amber-700 bg-amber-50 border-amber-200";
            default: return "text-orange-600 bg-orange-50 border-orange-200";
        }
    };

    const isLoading = loadingEvents || (!!selectedEvent && loadingExisting);

    return (
        <ContentLayout title={eventIdParam ? "Edit Winners" : "Declare Winners"}>
            <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6 max-w-3xl">
                <div className="flex items-center gap-4">
                    <Link href="/winners">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-orange-200">
                            <ChevronLeft className="h-4 w-4 text-orange-700" />
                        </Button>
                    </Link>
                    <h2 className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                        {eventIdParam ? "Edit Winners" : "Declare Winners"}
                    </h2>
                </div>

                <Card className="border-2 border-orange-200 dark:border-orange-800">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-orange-600" />
                            Winners Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
                            </div>
                        ) : (
                            <>
                                {/* Event Selection */}
                                <div className="space-y-3 p-4 bg-orange-50/50 dark:bg-orange-950/20 rounded-xl border border-orange-100 dark:border-orange-900">
                                    <label className="text-sm font-bold text-orange-900 dark:text-orange-100 flex items-center gap-2">
                                        Step 1: Select Event
                                    </label>
                                    <Select
                                        value={selectedEvent}
                                        onValueChange={setSelectedEvent}
                                        disabled={!!eventIdParam}
                                    >
                                        <SelectTrigger className="border-orange-300 bg-white dark:bg-slate-950 focus:ring-orange-500">
                                            <SelectValue placeholder="Choose an event to crown winners..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {winnersEvents.map((event) => (
                                                <SelectItem key={event.event_id} value={event.event_id}>
                                                    {(event as any).name || (event as any).event_name || (event as any).title || `Event (${event.event_id.slice(-6)})`}
                                                </SelectItem>
                                            ))}
                                            {winnersEvents.length === 0 && (
                                                <div className="p-2 text-xs text-center text-muted-foreground">
                                                    No matching events found
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {eventIdParam && (
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            * Event cannot be changed while editing existing winners.
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-orange-900 dark:text-orange-100 flex items-center gap-2">
                                        Step 2: Assign Winners
                                    </label>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {selections.map((sel, idx) => (
                                            <div key={sel.rank} className="flex flex-col gap-3">
                                                <div className={`flex items-center justify-center gap-2 py-2 rounded-lg border-2 font-bold ${getRankColor(sel.rank)}`}>
                                                    <Medal className="h-4 w-4" />
                                                    {sel.rank === 1 ? "1st Place" : sel.rank === 2 ? "2nd Place" : "3rd Place"}
                                                </div>

                                                {sel.user ? (
                                                    <div className="relative group animate-in fade-in zoom-in duration-300">
                                                        <div className="p-3 border-2 border-green-500 bg-green-50 dark:bg-green-950/20 rounded-xl shadow-sm">
                                                            <div className="flex flex-col items-center text-center gap-2">
                                                                <div className="h-12 w-12 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center text-green-700 dark:text-green-300 font-bold text-lg">
                                                                    {sel.user.name?.[0] || <UserIcon className="h-4 w-4" />}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <div className="font-bold text-green-900 dark:text-green-100 line-clamp-1">
                                                                        {sel.user.name || "Unnamed"}
                                                                    </div>
                                                                    <div className="text-[10px] text-green-600 dark:text-green-400 font-mono">
                                                                        {sel.user.unique_code}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            onClick={() => handleRemoveUser(idx)}
                                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg"
                                                            disabled={bulkAddMutation.isPending}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        className={`h-10 border-dashed border-2 rounded-xl gap-2 hover:bg-orange-50 hover:border-orange-300 transition-all ${activeRankIndex === idx ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200' : 'border-orange-200'}`}
                                                        onClick={() => setActiveRankIndex(idx)}
                                                        disabled={bulkAddMutation.isPending}
                                                    >
                                                        <Plus className="h-6 w-6 text-orange-400" />
                                                        <span className="text-xs text-orange-600 font-medium">Add Winner</span>
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {activeRankIndex !== null && (
                                    <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-xl border-2 border-orange-200 animate-in slide-in-from-top-4 duration-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-orange-700">
                                                Search for {selections[activeRankIndex].rank === 1 ? "1st" : selections[activeRankIndex].rank === 2 ? "2nd" : "3rd"} Place Winner
                                            </h3>
                                            <Button variant="ghost" size="sm" onClick={() => setActiveRankIndex(null)}>Cancel</Button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    autoFocus
                                                    placeholder="Search by name, email, or code..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-10 border-orange-300 focus-visible:ring-orange-500"
                                                />
                                            </div>

                                            {searchingUsers ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                                                </div>
                                            ) : searchQuery ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                                    {users.length > 0 ? (
                                                        users.map((u) => (
                                                            <div
                                                                key={u.user_id}
                                                                onClick={() => handleSelectUser(u)}
                                                                className="p-3 bg-white dark:bg-slate-900 border border-orange-100 dark:border-orange-900 rounded-lg hover:border-orange-500 hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-700">
                                                                        {u.name?.[0] || 'U'}
                                                                    </div>
                                                                    <div className="text-sm">
                                                                        <div className="font-bold">{u.name || "Unnamed"}</div>
                                                                        <div className="text-[10px] text-muted-foreground">{u.unique_code}</div>
                                                                    </div>
                                                                </div>
                                                                <Check className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100" />
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="col-span-full text-center py-4 text-muted-foreground">No users found</div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 text-xs text-muted-foreground">
                                                    Type above to find the winner among system users
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4">
                                    <Button
                                        className="w-full bg-orange-600 hover:bg-orange-700 text-white h-14 text-lg font-bold shadow-lg shadow-orange-600/20"
                                        disabled={!selectedEvent || bulkAddMutation.isPending}
                                        onClick={handleSubmit}
                                    >
                                        {bulkAddMutation.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                                Publishing Changes...
                                            </>
                                        ) : (
                                            <>
                                                <Trophy className="mr-2 h-6 w-6" />
                                                {existingWinners.length > 0 || eventIdParam ? "Save Changes" : "Declare All Winners"}
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-center text-[10px] text-muted-foreground mt-3">
                                        * Note: Declaring winners for an event will overwrite any existing winners for that specific event.
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ContentLayout>
    );
}
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
  Search,
  Loader2,
  UserCircle,
  Mail,
  Phone,
  QrCode,
  CheckCircle,
  UserCheck,
  ArrowLeft,
  Calendar,
  Users,
} from "lucide-react";
import { useEventDetail, useEventUsersSearch, useAttendanceCheck } from "../../_hooks/events-queries";
import { db, type Attendance } from "@/db";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

interface EventDetailProps {
  eventId: string;
  onBack: () => void;
}

export default function EventDetail({ eventId, onBack }: EventDetailProps) {
  const { event, enrolledUsers, loading: eventLoading } = useEventDetail(eventId);
  const { users, loading: searchLoading, searchQuery, setSearchQuery } = useEventUsersSearch(eventId);
  const { data: session } = useSession();
  const [markingAttendance, setMarkingAttendance] = useState<string | null>(null);

  // Get user IDs for attendance check
  const userIds = enrolledUsers.map((u) => u.user_id);
  const { markedUsers, setMarkedUsers } = useAttendanceCheck(eventId, userIds);

  const handleMarkAttendance = async (uniqueCode: string, userName: string) => {
    try {
      setMarkingAttendance(uniqueCode);

      // Get admin_id from session or local DB
      let adminId = "";
      const sessionUser = session?.user as { adminId?: string; userId?: string };
      adminId = sessionUser?.adminId || sessionUser?.userId || "";

      if (!adminId) {
        const admins = await db.admins.toArray();
        if (admins.length > 0) {
          adminId = admins[0].admin_id;
        }
      }

      if (!adminId) {
        toast.error("Admin ID not found. Please log in again.");
        return;
      }

      // Create attendance record
      const attendanceRecord: Attendance = {
        unique_code: uniqueCode,
        event_id: eventId,
        admin_id: adminId,
        created_at: new Date().toISOString(),
        _sync_status: "pending",
      };

      // Add to database
      await db.attendance.add(attendanceRecord);

      // Update marked users set
      setMarkedUsers((prev) => new Set(prev).add(uniqueCode));

      toast.success(`Attendance marked for ${userName || uniqueCode}`, {
        description: `Event: ${event?.name || eventId.slice(0, 8)}`,
        icon: <CheckCircle className="h-4 w-4" />,
      });
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast.error("Failed to mark attendance", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setMarkingAttendance(null);
    }
  };

  if (eventLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!event) {
    return (
      <Card className="border-2 border-red-200">
        <CardContent className="py-8">
          <p className="text-center text-red-600">Event not found</p>
        </CardContent>
      </Card>
    );
  }

  const displayUsers = searchQuery ? users : enrolledUsers;

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-start gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:text-orange-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-orange-700 dark:text-orange-400 flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            {event.name || "Event Details"}
          </h2>
          {event.description && (
            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
          )}
        </div>
      </div>

      {/* Event Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-2 border-orange-200 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Enrolled</p>
                <p className="text-3xl font-bold text-orange-600">{enrolledUsers.length}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Attendance Marked</p>
                <p className="text-3xl font-bold text-green-600">{markedUsers.size}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-3xl font-bold text-blue-600">
                  {enrolledUsers.length - markedUsers.size}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="border-2 border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="text-xl text-orange-700 dark:text-orange-400 flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            Enrolled Users
          </CardTitle>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by unique code, email, mobile, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-orange-300 focus-visible:ring-orange-500"
            />
          </div>
        </CardHeader>

        <CardContent>
          {/* Loading State */}
          {searchLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          )}

          {/* No Users */}
          {!searchLoading && displayUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <UserCircle className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>
                {searchQuery
                  ? `No users found matching "${searchQuery}"`
                  : "No users enrolled in this event"}
              </p>
            </div>
          )}

          {/* Results Table */}
          {displayUsers.length > 0 && !searchLoading && (
            <div className="rounded-lg border border-orange-200 dark:border-orange-800">
              <Table>
                <TableHeader>
                  <TableRow className="bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-50 dark:hover:bg-orange-950/30">
                    <TableHead className="font-semibold text-orange-700 dark:text-orange-400">
                      <div className="flex items-center gap-1">
                        <QrCode className="h-3 w-3" />
                        Unique Code
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-orange-700 dark:text-orange-400">
                      <div className="flex items-center gap-1">
                        <UserCircle className="h-3 w-3" />
                        Name
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-orange-700 dark:text-orange-400">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Email
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-orange-700 dark:text-orange-400">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        Mobile
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-orange-700 dark:text-orange-400 text-right">
                      Attendance
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayUsers.map((user) => (
                    <TableRow
                      key={user.user_id}
                      className="hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-colors"
                    >
                      <TableCell className="font-mono text-sm font-semibold text-orange-600">
                        {user.unique_code}
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.name || (
                          <span className="text-muted-foreground italic">No name</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{user.email}</TableCell>
                      <TableCell className="text-sm">
                        {user.mobile_number || (
                          <span className="text-muted-foreground italic">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {markedUsers.has(user.unique_code) ? (
                          <Button
                            size="sm"
                            disabled
                            variant="outline"
                            className="border-green-300 text-green-700 dark:text-green-500 bg-green-50 dark:bg-green-950/30 cursor-not-allowed"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Marked
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleMarkAttendance(user.unique_code, user.name)}
                            disabled={markingAttendance === user.unique_code}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            {markingAttendance === user.unique_code ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Marking...
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3 w-3" />
                                Mark
                              </>
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Results Count */}
              <div className="px-4 py-2 bg-orange-50 dark:bg-orange-950/30 border-t border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-700 dark:text-orange-400">
                  Showing {displayUsers.length} user{displayUsers.length !== 1 ? "s" : ""}
                  {searchQuery && " matching search"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
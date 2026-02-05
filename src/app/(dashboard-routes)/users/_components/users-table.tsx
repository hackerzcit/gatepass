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
import { Search, Loader2, UserCircle, Mail, Phone, Hash, QrCode, LogIn, CheckCircle } from "lucide-react";
import { useUsersSearch } from "../../_hooks/queries";
import { db, type EntryLog } from "@/db";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function UsersTable() {
  const { users, loading, searchQuery, setSearchQuery } = useUsersSearch();
  const { data: session } = useSession();
  const [markingEntry, setMarkingEntry] = useState<string | null>(null);
  const [markedUsers, setMarkedUsers] = useState<Set<string>>(new Set());

  // Check which users are already marked in entry_logs
  useEffect(() => {
    async function checkMarkedUsers() {
      if (users.length === 0) return;

      const uniqueCodes = users.map((user) => user.unique_code);
      const entryLogs = await db.entry_logs
        .where("unique_code")
        .anyOf(uniqueCodes)
        .toArray();

      const marked = new Set(entryLogs.map((log) => log.unique_code));
      setMarkedUsers(marked);
    }

    checkMarkedUsers();
  }, [users]);

  const handleMarkEntry = async (uniqueCode: string, userName: string) => {
    try {
      setMarkingEntry(uniqueCode);

      // Get admin_id from session or local DB
      let adminId = "";
      const sessionUser = session?.user as { adminId?: string; userId?: string };
      adminId = sessionUser?.adminId || sessionUser?.userId || "";

      // If not in session, try to get from local DB
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

      // Create entry log record
      const entryLog: EntryLog = {
        unique_code: uniqueCode,
        admin_id: adminId,
        source: "dashboard",
        created_at: new Date().toISOString(),
        _sync_status: "pending",
      };

      // Add to database
      await db.entry_logs.add(entryLog);

      // Update marked users set
      setMarkedUsers((prev) => new Set(prev).add(uniqueCode));

      toast.success(`Entry marked for ${userName || uniqueCode}`, {
        description: "Footfall entry logged successfully",
        icon: <CheckCircle className="h-4 w-4" />,
      });
    } catch (error) {
      console.error("Error marking entry:", error);
      toast.error("Failed to mark entry", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setMarkingEntry(null);
    }
  };

  return (
    <Card className="border-2 border-orange-200 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="text-xl text-orange-700 dark:text-orange-400 flex items-center gap-2">
          <UserCircle className="h-5 w-5" />
          Search Users
        </CardTitle>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, unique code, email, mobile, or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-orange-300 focus-visible:ring-orange-500"
          />
        </div>
      </CardHeader>

      <CardContent>
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          </div>
        )}

        {/* No Search Query */}
        {!searchQuery && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>Start typing to search for users</p>
          </div>
        )}

        {/* No Results */}
        {searchQuery && !loading && users.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <UserCircle className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>No users found matching &quot;{searchQuery}&quot;</p>
          </div>
        )}

        {/* Results Table */}
        {users.length > 0 && !loading && (
          <div className="rounded-lg border border-orange-200 dark:border-orange-800">
            <Table>
              <TableHeader>
                <TableRow className="bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-50 dark:hover:bg-orange-950/30">
                  {/* <TableHead className="font-semibold text-orange-700 dark:text-orange-400">
                    <div className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      User ID
                    </div>
                  </TableHead> */}
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
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.user_id}
                    className="hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-colors"
                  >
                    {/* <TableCell className="font-mono text-xs">
                      <Badge
                        variant="outline"
                        className="border-orange-300 text-orange-700 dark:text-orange-400"
                      >
                        {user.user_id?.slice(0, 8)}...
                      </Badge>
                    </TableCell> */}
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
                          Already Marked
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleMarkEntry(user.unique_code, user.name)}
                          disabled={markingEntry === user.unique_code}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          {markingEntry === user.unique_code ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Marking...
                            </>
                          ) : (
                            <>
                              <LogIn className="h-3 w-3" />
                              Mark Entry
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
                Showing {users.length} result{users.length !== 1 ? "s" : ""} 
                {users.length === 50 && " (limited to 50)"}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

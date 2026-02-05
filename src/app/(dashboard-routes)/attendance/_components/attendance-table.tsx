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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, UserCircle, Mail, Phone, Hash, QrCode, Info, School, Calendar, Building, Users as UsersIcon, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { useEntryLogUsersSearch } from "../../_hooks/queries";
import { type User } from "@/db";
import { useState } from "react";

export function AttendanceTable() {
  const { users, loading, searchQuery, setSearchQuery, currentPage, totalPages, goToPage, totalUsers } = useEntryLogUsersSearch();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenUserDetails = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <Card className="border-2 border-orange-200 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="text-xl text-orange-700 dark:text-orange-400 flex items-center gap-2">
          <UserCircle className="h-5 w-5" />
          Search Attendance History
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

        {/* No Results */}
        {!loading && users.length === 0 && totalUsers === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <UserCircle className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>No users found with attendance records</p>
          </div>
        )}

        {/* No Search Results */}
        {!loading && searchQuery && users.length === 0 && totalUsers > 0 && (
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
                  <TableHead className="font-semibold text-orange-700 dark:text-orange-400">
                    <div className="flex items-center gap-1">
                      <QrCode className="h-3 w-3" />
                        Code
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
                  <TableHead className="font-semibold text-orange-700 dark:text-orange-400">
                    <div className="flex items-center gap-1">
                      <School className="h-3 w-3" />
                      College
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
                    <TableCell className="text-sm">
                      {user.college || (
                        <span className="text-muted-foreground italic">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenUserDetails(user)}
                          className="border-orange-300 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 gap-1"
                        >
                          <Info className="h-3 w-3" />
                          Info
                        </Button>
                        <Button
                          size="sm"
                          disabled
                          variant="outline"
                          className="border-green-300 text-green-700 dark:text-green-500 bg-green-50 dark:bg-green-950/30 cursor-not-allowed gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Attended
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Results Count and Pagination */}
            <div className="px-4 py-3 bg-orange-50 dark:bg-orange-950/30 border-t border-orange-200 dark:border-orange-800">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-orange-700 dark:text-orange-400">
                  Showing {((currentPage - 1) * 50) + 1} to {Math.min(currentPage * 50, totalUsers)} of {totalUsers} {searchQuery ? "matching " : ""}result{totalUsers !== 1 ? "s" : ""}
                </p>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/30"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-orange-700 dark:text-orange-400">
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/30"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* User Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-orange-700 dark:text-orange-400 flex items-center gap-2">
              <UserCircle className="h-6 w-6" />
              User Details
            </DialogTitle>
            <DialogDescription>
              Complete information for {selectedUser?.name || "user"}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6 mt-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-2">
                  <UserCircle className="h-5 w-5" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-base font-medium">{selectedUser.name || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <QrCode className="h-3 w-3" />
                      Unique Code
                    </label>
                    <p className="text-base font-mono font-semibold text-orange-600">
                      {selectedUser.unique_code}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      User ID
                    </label>
                    <p className="text-sm font-mono break-all">{selectedUser.user_id}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Gender</label>
                    <p className="text-base">{selectedUser.gender || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Email
                    </label>
                    <p className="text-base break-all">{selectedUser.email}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Mobile Number
                    </label>
                    <p className="text-base">{selectedUser.mobile_number || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-2">
                  <School className="h-5 w-5" />
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <School className="h-3 w-3" />
                      College
                    </label>
                    <p className="text-base">{selectedUser.college || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      Department
                    </label>
                    <p className="text-base">{selectedUser.department || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <UsersIcon className="h-3 w-3" />
                      Year
                    </label>
                    <p className="text-base">{selectedUser.year || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">User Type</label>
                    <Badge
                      variant={selectedUser.is_online_user ? "default" : "secondary"}
                      className={selectedUser.is_online_user 
                        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400"
                      }
                    >
                      {selectedUser.is_online_user ? "Online User" : "Offline User"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timestamps
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Created At</label>
                    <p className="text-base">
                      {selectedUser.created_at 
                        ? new Date(selectedUser.created_at).toLocaleString()
                        : "—"
                      }
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                    <p className="text-base">
                      {selectedUser.updated_at 
                        ? new Date(selectedUser.updated_at).toLocaleString()
                        : "—"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

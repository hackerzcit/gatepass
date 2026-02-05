"use client";

import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { useState } from "react";
import { db } from "@/db";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export function PageHeader() {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      toast.info("Preparing attendance data for export...");

      // Get unique codes from entry logs
      const entryLogs = await db.entry_logs.toArray();
      const uniqueCodes = Array.from(new Set(entryLogs.map((log) => log.unique_code)));

      // Get all users who have entry logs
      const users = await db.users
        .filter((user) => uniqueCodes.includes(user.unique_code))
        .toArray();

      if (users.length === 0) {
        toast.warning("No attendance data to export");
        return;
      }

      // Prepare data for Excel - include all user fields
      const exportData = users.map((user) => {
        // Create a copy of the user object with all fields
        const userData: any = {};
        
        // Add all user properties dynamically
        Object.keys(user).forEach((key) => {
          const value = user[key as keyof typeof user];
          
          // Format the key for better readability
          const formattedKey = key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
          
          // Format the value
          if (value === null || value === undefined) {
            userData[formattedKey] = "";
          } else if (typeof value === 'boolean') {
            userData[formattedKey] = value ? "Yes" : "No";
          } else if (key === 'created_at' || key === 'updated_at') {
            userData[formattedKey] = new Date(value as string).toLocaleString();
          } else if (key === 'is_online_user') {
            userData[formattedKey] = value ? "Online User" : "Offline User";
          } else {
            userData[formattedKey] = String(value);
          }
        });
        
        return userData;
      });

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // ===== WORKSHEET 1: User Details =====
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Auto-size columns for user details
      const maxWidth = 60;
      if (exportData.length > 0) {
        const columnWidths = Object.keys(exportData[0]).map((key) => {
          const maxLength = Math.max(
            key.length,
            ...exportData.map((row) => {
              const value = row[key];
              return value ? String(value).length : 0;
            })
          );
          return { wch: Math.min(maxLength + 2, maxWidth) };
        });
        worksheet["!cols"] = columnWidths;
      }
      XLSX.utils.book_append_sheet(workbook, worksheet, "User Details");

      // ===== WORKSHEET 2: Attendance Summary =====
      const attendanceSummary = [];
      
      // Total users with attendance
      attendanceSummary.push({
        "Metric": "Total Users with Attendance",
        "Count": users.length
      });

      // Count by college
      const collegeCount: Record<string, number> = {};
      users.forEach(user => {
        const college = user.college || "Not Specified";
        collegeCount[college] = (collegeCount[college] || 0) + 1;
      });
      
      // Add college breakdown
      attendanceSummary.push({
        "Metric": "",
        "Count": ""
      });
      attendanceSummary.push({
        "Metric": "Breakdown by College",
        "Count": ""
      });
      Object.entries(collegeCount).forEach(([college, count]) => {
        attendanceSummary.push({
          "Metric": `  ${college}`,
          "Count": count
        });
      });

      // Count by department
      const deptCount: Record<string, number> = {};
      users.forEach(user => {
        const dept = user.department || "Not Specified";
        deptCount[dept] = (deptCount[dept] || 0) + 1;
      });
      
      // Add department breakdown
      attendanceSummary.push({
        "Metric": "",
        "Count": ""
      });
      attendanceSummary.push({
        "Metric": "Breakdown by Department",
        "Count": ""
      });
      Object.entries(deptCount).forEach(([dept, count]) => {
        attendanceSummary.push({
          "Metric": `  ${dept}`,
          "Count": count
        });
      });

      // Count by year
      const yearCount: Record<string, number> = {};
      users.forEach(user => {
        const year = user.year || "Not Specified";
        yearCount[year] = (yearCount[year] || 0) + 1;
      });
      
      // Add year breakdown
      attendanceSummary.push({
        "Metric": "",
        "Count": ""
      });
      attendanceSummary.push({
        "Metric": "Breakdown by Year",
        "Count": ""
      });
      Object.entries(yearCount).forEach(([year, count]) => {
        attendanceSummary.push({
          "Metric": `  Year ${year}`,
          "Count": count
        });
      });

      // Count by gender
      const genderCount: Record<string, number> = {};
      users.forEach(user => {
        const gender = user.gender || "Not Specified";
        genderCount[gender] = (genderCount[gender] || 0) + 1;
      });
      
      // Add gender breakdown
      attendanceSummary.push({
        "Metric": "",
        "Count": ""
      });
      attendanceSummary.push({
        "Metric": "Breakdown by Gender",
        "Count": ""
      });
      Object.entries(genderCount).forEach(([gender, count]) => {
        attendanceSummary.push({
          "Metric": `  ${gender}`,
          "Count": count
        });
      });

      // Count by user type
      const onlineUsers = users.filter(u => u.is_online_user).length;
      const offlineUsers = users.length - onlineUsers;
      
      attendanceSummary.push({
        "Metric": "",
        "Count": ""
      });
      attendanceSummary.push({
        "Metric": "Breakdown by User Type",
        "Count": ""
      });
      attendanceSummary.push({
        "Metric": "  Online Users",
        "Count": onlineUsers
      });
      attendanceSummary.push({
        "Metric": "  Offline Users",
        "Count": offlineUsers
      });

      const summaryWorksheet = XLSX.utils.json_to_sheet(attendanceSummary);
      summaryWorksheet["!cols"] = [{ wch: 40 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Attendance Summary");

      // ===== WORKSHEET 3: Admin Summary =====
      const admins = await db.admins.toArray();
      const adminSummary = admins.map(admin => ({
        "Admin ID": admin.admin_id || "",
        "Name": admin.name || "",
        "Email": admin.email || "",
        "Created At": admin.created_at ? new Date(admin.created_at).toLocaleString() : "",
        "Code Block ID": admin.code_block?.id || "",
        "Range Start": admin.code_block?.range_start || "",
        "Range End": admin.code_block?.range_end || "",
        "Current Value": admin.code_block?.current_value || "",
        "Codes Used": admin.code_block ? (admin.code_block.current_value - admin.code_block.range_start) : 0,
        "Codes Remaining": admin.code_block ? (admin.code_block.range_end - admin.code_block.current_value) : 0,
        "Last Updated": admin.code_block?.updated_at ? new Date(admin.code_block.updated_at).toLocaleString() : "",
      }));

      if (adminSummary.length > 0) {
        const adminWorksheet = XLSX.utils.json_to_sheet(adminSummary);
        const adminColumnWidths = Object.keys(adminSummary[0]).map((key) => {
          const maxLength = Math.max(
            key.length,
            ...adminSummary.map((row) => {
              const value = row[key as keyof typeof row];
              return value ? String(value).length : 0;
            })
          );
          return { wch: Math.min(maxLength + 2, 40) };
        });
        adminWorksheet["!cols"] = adminColumnWidths;
        XLSX.utils.book_append_sheet(workbook, adminWorksheet, "Admin Summary");
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
      const filename = `Attendance_${timestamp}.xlsx`;

      // Export file
      XLSX.writeFile(workbook, filename);

      toast.success(`Exported ${users.length} attendance records!`, {
        description: `File saved as ${filename}`,
      });
    } catch (error) {
      console.error("Error exporting attendance data:", error);
      toast.error("Failed to export attendance data", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-orange-700 dark:text-orange-400">
          Attendance Management
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          View and search users who have marked their attendance
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleExport}
          disabled={exporting}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <FileSpreadsheet className="h-4 w-4" />
              Export to Excel
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

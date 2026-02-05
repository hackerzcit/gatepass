"use client";

import { Button } from "@/components/ui/button";
import { UserPlus, RefreshCw, Loader2, CheckCircle, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { syncPull, db, type Admin, type CodeBlock, type User, type EntryLog } from "@/db";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { axiosBackendInstance } from "@/lib/axios-instance";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PageHeader() {
  const { data: session } = useSession();
  const isOnline = useOnlineStatus();
  const [syncing, setSyncing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [showSuccessView, setShowSuccessView] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile_number: "",
    department: "",
    gender: "",
    year: "",
    college: "",
  });

  const getNextUniqueCodeFromBlock = async () => {
    // Get the current admin from the database
    const admins = await db.admins.toArray();
    if (admins.length === 0) {
      throw new Error("No admin found. Please log in again.");
    }

    const admin = admins[0];
    const codeBlock = admin.code_block;

    if (!codeBlock) {
      throw new Error("Code block not found for admin");
    }

    // Initialize current_value properly
    let currentValue = codeBlock.current_value;
    
    // If current_value is less than range_start, initialize it to range_start - 1
    // This handles both new blocks and blocks that need initialization
    if (currentValue < codeBlock.range_start) {
      currentValue = codeBlock.range_start - 1;
    }

    // Get the next unique code
    const nextValue = currentValue + 1;

    // Check if the next value is within the valid range
    if (nextValue < codeBlock.range_start || nextValue > codeBlock.range_end) {
      throw new Error(
        `Code block exhausted or invalid. Range: ${codeBlock.range_start}-${codeBlock.range_end}, Next: ${nextValue}`
      );
    }

    const uniqueCode = nextValue.toString();

    console.log(`
      CodeBlock Debug:
      - Range: ${codeBlock.range_start} to ${codeBlock.range_end}
      - Current Value: ${codeBlock.current_value}
      - Adjusted Current: ${currentValue}
      - Next Value: ${nextValue}
      - Generated Code: ${uniqueCode}
    `);

    return { uniqueCode, admin, codeBlock, nextValue };
  };

  const updateCodeBlockValue = async (admin: Admin, nextValue: number) => {
    // Update the entire admin object with the new code_block values
    const updatedAdmin = {
      ...admin,
      code_block: {
        ...admin.code_block,
        current_value: nextValue,
        updated_at: new Date().toISOString(),
      },
    };
    
    // Use put to replace the entire admin object
    await db.admins.put(updatedAdmin);
    
    console.log(`
      CodeBlock Updated Successfully:
      - Admin ID: ${admin.admin_id}
      - New current_value: ${nextValue}
      - Range: ${admin.code_block.range_start} - ${admin.code_block.range_end}
      - Updated At: ${updatedAdmin.code_block.updated_at}
    `);

    // Verify the update
    const verifyAdmin = await db.admins.get(admin.admin_id);
    console.log("Verified current_value:", verifyAdmin?.code_block.current_value);
  };

  const generateUserId = () => {
    // Generate a simple user ID (you can customize this)
    return `USR_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      mobile_number: "",
      department: "",
      gender: "",
      year: "",
      college: "",
    });
    setShowSuccessView(false);
    setGeneratedCode("");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleAddAnotherUser = () => {
    setShowSuccessView(false);
    setGeneratedCode("");
    setFormData({
      name: "",
      email: "",
      mobile_number: "",
      department: "",
      gender: "",
      year: "",
      college: "",
    });
  };

  const pushUserToBackend = async (user: Partial<User>, adminId: string) => {
    try {
      console.log("📤 Pushing user to backend...", user.unique_code);
      
      // Get access token
      const tokenResponse = await fetch("/api/auth/get-token");
      if (!tokenResponse.ok) {
        throw new Error("Failed to get access token");
      }
      const { access_token } = await tokenResponse.json();

      // Push user to backend using axios instance
      const response = await axiosBackendInstance.post('/users/onspot-register', {
        unique_code: user.unique_code,
        admin_id: adminId,
        name: user.name,
        email: user.email,
        mobile_number: user.mobile_number,
        department: user.department,
        gender: user.gender,
        year: user.year,
        college: user.college,
      }, {
        headers: {
          "Authorization": `Bearer ${access_token}`,
        }
      });

      console.log("✅ User pushed to backend successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to push user to backend:", error);
      throw error;
    }
  };

  const handleAddUser = async () => {
    try {
      setAddingUser(true);

      // Validate required fields
      if (!formData.name || !formData.email || !formData.mobile_number || !formData.gender) {
        toast.error("Please fill in all required fields", {
          description: "Name, Email, Mobile Number, and Gender are required",
        });
        setAddingUser(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Invalid email format");
        setAddingUser(false);
        return;
      }

      // Validate mobile number (10 digits)
      if (!/^\d{10}$/.test(formData.mobile_number)) {
        toast.error("Mobile number must be 10 digits");
        setAddingUser(false);
        return;
      }

      // Check if email or mobile already exists
      const existingUserByEmail = await db.users.where("email").equals(formData.email).first();
      // const existingUserByMobile = await db.users.where("mobile_number").equals(formData.mobile_number).first();

      if (existingUserByEmail) {
        toast.error("User already exists", {
          description: "A user with this email or mobile number already exists",
        });
        setAddingUser(false);
        return;
      }

      // Generate unique code from admin's code block and user ID
      console.log("=== Starting User Creation Process ===");
      const { uniqueCode, admin, codeBlock, nextValue } = await getNextUniqueCodeFromBlock();
      console.log(`Generated Unique Code: ${uniqueCode}`);
      
      const userId = generateUserId();

      // Create user object
      const newUser = {
        user_id: userId,
        unique_code: uniqueCode,
        name: formData.name,
        email: formData.email,
        mobile_number: formData.mobile_number,
        department: formData.department || "",
        gender: formData.gender || "",
        year: formData.year || "",
        college: formData.college || "",
        is_online_user: false, // On-spot users are offline users
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("Adding user to database...", { user_id: userId, unique_code: uniqueCode });
      
      // Add user to database
      await db.users.add(newUser);
      console.log("✅ User added successfully!");

      // Immediately create entry log for the new user
      console.log("Creating entry log for new user...");
      const entryLog: EntryLog = {
        unique_code: uniqueCode,
        admin_id: admin.admin_id,
        source: "onspot",
        created_at: new Date().toISOString(),
        _sync_status: "pending",
      };
      const entryLogId = await db.entry_logs.add(entryLog);
      console.log("✅ Entry log created successfully with ID:", entryLogId);

      // Update code block only after successful user creation
      console.log(`Updating CodeBlock current_value to ${nextValue}...`);
      await updateCodeBlockValue(admin, nextValue);
      console.log("=== User Creation Process Complete ===");

      // Push user to backend
      try {
        await pushUserToBackend(newUser, admin.admin_id);
        
        // Mark entry log as synced since user was successfully registered
        await db.entry_logs.update(entryLogId, { _sync_status: "synced" });
        console.log("✅ Entry log marked as synced");
        
        toast.success("User added and synced successfully!", {
          description: `Unique Code: ${uniqueCode}`,
        });
      } catch (pushError) {
        console.error("Push to backend failed, but user saved locally:", pushError);
        toast.warning("User saved locally", {
          description: `Unique Code: ${uniqueCode}. Will sync to server later.`,
        });
        // Entry log remains with "pending" status for later sync
      }

      // Show success view with generated code
      setGeneratedCode(uniqueCode);
      setShowSuccessView(true);
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Failed to add user", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setAddingUser(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);

      // Fetch access token
      const tokenResponse = await fetch("/api/auth/get-token");
      if (!tokenResponse.ok) {
        toast.error("Failed to fetch access token");
        return;
      }

      const { access_token } = await tokenResponse.json();

      // Perform sync
      const result = await syncPull(access_token);

      if (result.success) {
        toast.success("Sync completed successfully", {
          description: `Users: ${result.counts?.users || 0}, Events: ${result.counts?.events || 0}`,
        });
        // Reload page to update stats
        window.location.reload();
      } else {
        toast.error("Sync failed", {
          description: result.error || "Unknown error occurred",
        });
      }
    } catch (error) {
      console.error("Error syncing:", error);
      toast.error("Sync failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-orange-700 dark:text-orange-400">
          User Management
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage and search users in the system
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSync}
          disabled={syncing || !isOnline}
          variant="outline"
          className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/30 hover:text-orange-700"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {!isOnline ? "Offline" : syncing ? "Syncing..." : "Sync Users"}
        </Button>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Add User Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        if (!open) handleCloseModal();
        setIsModalOpen(open);
      }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {!showSuccessView ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-orange-700 dark:text-orange-400 flex items-center gap-2">
                  <UserPlus className="h-6 w-6" />
                  Add On-Spot User
                </DialogTitle>
                <DialogDescription>
                  Add a new user to the system. Fields marked with * are required.
                </DialogDescription>
              </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-400">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="border-orange-200 focus-visible:ring-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">
                    Gender <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange("gender", value)}
                  >
                    <SelectTrigger className="border-orange-200 focus:ring-orange-500">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-400">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="border-orange-200 focus-visible:ring-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">
                    Mobile Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={formData.mobile_number}
                    onChange={(e) => handleInputChange("mobile_number", e.target.value)}
                    maxLength={10}
                    className="border-orange-200 focus-visible:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-400">
                Academic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="college">College</Label>
                  <Input
                    id="college"
                    placeholder="Enter college name"
                    value={formData.college}
                    onChange={(e) => handleInputChange("college", e.target.value)}
                    className="border-orange-200 focus-visible:ring-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="e.g., CSE, ECE, IT"
                    value={formData.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                    className="border-orange-200 focus-visible:ring-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select
                    value={formData.year}
                    onValueChange={(value) => handleInputChange("year", value)}
                  >
                    <SelectTrigger className="border-orange-200 focus:ring-orange-500">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={addingUser}
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddUser}
                  disabled={addingUser}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {addingUser ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Add User
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              {/* Success View */}
              <DialogHeader>
                <DialogTitle className="text-2xl text-green-700 dark:text-green-400 flex items-center gap-2">
                  <CheckCircle className="h-6 w-6" />
                  User Added Successfully!
                </DialogTitle>
                <DialogDescription>
                  The user has been created and assigned a unique code.
                </DialogDescription>
              </DialogHeader>

              <div className="py-8">
                <div className="flex flex-col items-center justify-center space-y-6">
                  {/* Generated Code Display */}
                  <div className="w-full max-w-md">
                    <label className="text-sm font-medium text-muted-foreground block text-center mb-2">
                      Generated Unique Code
                    </label>
                    <div className="relative">
                      <div className="flex items-center justify-center gap-3 p-6 bg-orange-50 dark:bg-orange-950/30 border-2 border-orange-300 dark:border-orange-700 rounded-lg">
                        <span className="text-5xl font-bold font-mono text-orange-600 dark:text-orange-400">
                          {generatedCode}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedCode);
                            toast.success("Code copied to clipboard!");
                          }}
                          className="absolute top-2 right-2 text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* User Details Summary */}
                  <div className="w-full max-w-md space-y-3 pt-4 border-t">
                    <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                      User Details:
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{formData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{formData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mobile:</span>
                        <span className="font-medium">{formData.mobile_number}</span>
                      </div>
                      {formData.college && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">College:</span>
                          <span className="font-medium">{formData.college}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  className="border-orange-300 text-orange-700 hover:bg-orange-50 w-full sm:w-auto"
                >
                  Close
                </Button>
                <Button
                  onClick={handleAddAnotherUser}
                  className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Another User
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
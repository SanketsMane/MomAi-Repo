"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { CheckIcon, XIcon, Clock, Users, UserCheck, UserX, Shield, Eye, Filter, RefreshCw, Mail, Calendar, Phone } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@workspace/ui/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@workspace/ui/components/dropdown-menu";
import { Input } from "@workspace/ui/components/input";

export function ApprovalsView() {
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "rejected">("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get all users for approval management
  const allUsers = useQuery(api.public.userApprovals.getAllUsers);
  
  // Mutations for approval actions
  const approveUser = useMutation(api.public.userApprovals.approveUser);
  const rejectUser = useMutation(api.public.userApprovals.rejectUser);
  
  const handleApprove = async (userId: string, userEmail: string) => {
    try {
      await approveUser({ userId });
      toast.success(`Approved ${userEmail}`);
    } catch (error) {
      toast.error("Failed to approve user");
      console.error(error);
    }
  };

  const handleReject = async (userId: string, userEmail: string, reason?: string) => {
    try {
      await rejectUser({ 
        userId, 
        reason: reason || "Account rejected by administrator"
      });
      toast.success(`Rejected ${userEmail}`);
    } catch (error) {
      toast.error("Failed to reject user");
      console.error(error);
    }
  };

  if (!allUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading user approvals...</p>
        </div>
      </div>
    );
  }

  // Filter users based on selected filter
  const filteredUsers = allUsers.filter((user: any) => {
    if (filter === "all") return true;
    return user.status.toLowerCase() === filter;
  });

  // Calculate stats
  const stats = {
    total: allUsers.length,
    pending: allUsers.filter(u => u.status === "Pending").length,
    active: allUsers.filter(u => u.status === "Active").length,
    rejected: allUsers.filter(u => u.status === "Rejected").length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "Active":
        return <Badge variant="default" className="bg-green-100 text-green-800"><UserCheck className="w-3 h-3 mr-1" />Active</Badge>;
      case "Rejected":
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><UserX className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="bg-gray-50/50 min-h-full">
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Approvals</h1>
                <p className="text-sm text-gray-500">
                  Manage user registrations and access permissions
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-9"
              />
              <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-600">Total Users</p>
                  <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-200/50 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100/50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-amber-600">Pending Review</p>
                  <p className="text-3xl font-bold text-amber-700">{stats.pending}</p>
                </div>
                <div className="p-3 bg-amber-200/50 rounded-full">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              {stats.pending > 0 && (
                <div className="mt-3">
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-200 text-amber-800">
                    Requires Action
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-emerald-600">Active Users</p>
                  <p className="text-3xl font-bold text-emerald-700">{stats.active}</p>
                </div>
                <div className="p-3 bg-emerald-200/50 rounded-full">
                  <UserCheck className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100/50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-600">Rejected</p>
                  <p className="text-3xl font-bold text-red-700">{stats.rejected}</p>
                </div>
                <div className="p-3 bg-red-200/50 rounded-full">
                  <UserX className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={filter === "all" ? "default" : "outline"} 
              onClick={() => setFilter("all")}
              size="sm"
              className={cn(
                "transition-all duration-200",
                filter === "all" && "bg-blue-600 hover:bg-blue-700"
              )}
            >
              All Users ({stats.total})
            </Button>
            <Button 
              variant={filter === "pending" ? "default" : "outline"} 
              onClick={() => setFilter("pending")}
              size="sm"
              className={cn(
                "transition-all duration-200",
                filter === "pending" && "bg-amber-500 hover:bg-amber-600"
              )}
            >
              <Clock className="w-3 h-3 mr-1" />
              Pending ({stats.pending})
            </Button>
            <Button 
              variant={filter === "active" ? "default" : "outline"} 
              onClick={() => setFilter("active")}
              size="sm"
              className={cn(
                "transition-all duration-200",
                filter === "active" && "bg-emerald-500 hover:bg-emerald-600"
              )}
            >
              <UserCheck className="w-3 h-3 mr-1" />
              Active ({stats.active})
            </Button>
            <Button 
              variant={filter === "rejected" ? "default" : "outline"} 
              onClick={() => setFilter("rejected")}
              size="sm"
              className={cn(
                "transition-all duration-200",
                filter === "rejected" && "bg-red-500 hover:bg-red-600"
              )}
            >
              <UserX className="w-3 h-3 mr-1" />
              Rejected ({stats.rejected})
            </Button>
          </div>
        </div>

        {/* Enhanced Users List */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  User Management
                </CardTitle>
                <CardDescription className="mt-1">
                  Review and manage user registration approvals
                </CardDescription>
              </div>
              <div className="text-sm text-gray-500">
                {filteredUsers.length} of {stats.total} users
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-500">
                  No users match the selected filter. Try adjusting your filters.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredUsers.map((user) => (
                  <Card key={user._id} className="transition-all duration-200 hover:shadow-md border-l-4 border-l-transparent hover:border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                        {/* User Info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-lg">{user.name}</h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <div className="flex items-center gap-1">
                                  <Mail className="h-4 w-4" />
                                  {user.email}
                                </div>
                                {user.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-4 w-4" />
                                    {user.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <Badge 
                              variant={user.role === "Super Admin" ? "default" : "secondary"}
                              className="px-3 py-1"
                            >
                              <Shield className="w-3 h-3 mr-1" />
                              {user.role}
                            </Badge>
                            
                            {getStatusBadge(user.status)}
                            
                            <span className="text-gray-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(user.registeredDate)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 flex-wrap">
                          {user.status === "Pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApprove(user.userId, user.email)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                              >
                                <CheckIcon className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(user.userId, user.email)}
                                className="shadow-sm"
                              >
                                <XIcon className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {user.status === "Active" && user.role !== "Super Admin" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(user.userId, user.email, "Account deactivated")}
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                            >
                              <XIcon className="w-4 h-4 mr-1" />
                              Deactivate
                            </Button>
                          )}
                          {user.status === "Rejected" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(user.userId, user.email)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                            >
                              <CheckIcon className="w-4 h-4 mr-1" />
                              Reactivate
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}